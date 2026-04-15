import sys
import os

# Add project root to sys.path so modules like shared, core, and agent can be found
# regardless of what directory the user launches uvicorn from.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import asyncio, uuid, json
from shared.security_utils import is_safe_url

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- In-memory scan state ---
scan_state = {
    "phase": "idle",
    "progress": 0,
    "current_action": "",
    "endpoints": [],
    "vulns": [],
    "graph": {"nodes": [], "edges": []},
    "logs": [],
    "report": "",
    "scanned_index": 0,
    "app_map": None,
    "vuln_types": []   # active vuln classes for this scan
}

# --- Request models ---
class RoleCredential(BaseModel):
    username: str
    password: str
    role: str

# All supported vuln class ids (matches frontend VulnSelector)
ALL_VULN_TYPES = ["sqli", "xss", "idor", "jwt", "rbac", "csrf", "graphql", "logic"]

class ScanRequest(BaseModel):
    target_url: str
    roles: List[RoleCredential]
    vuln_types: Optional[List[str]] = None  # None = all types

# --- Routes ---
@app.post("/scan/start")
async def start_scan(req: ScanRequest):
    # Resolve active vuln types — default to all
    active_vulns = req.vuln_types if req.vuln_types else ALL_VULN_TYPES

    # SSRF Protection
    is_safe, error = is_safe_url(req.target_url)
    if not is_safe:
        scan_state["phase"] = "error"
        scan_state["logs"].append(f"Security Block: {error}")
        return {"status": "error", "message": error}

    scan_state["phase"] = "starting"
    scan_state["progress"] = 0
    scan_state["logs"] = []
    scan_state["vulns"] = []
    scan_state["endpoints"] = []
    scan_state["graph"] = {"nodes": [], "edges": []}
    scan_state["scanned_index"] = 0
    scan_state["app_map"] = None
    scan_state["vuln_types"] = active_vulns

    asyncio.create_task(run_scan(req, active_vulns))
    return {"scan_id": str(uuid.uuid4()), "vuln_types": active_vulns}

@app.get("/scan/status")
def get_status():
    return {
        "phase": scan_state["phase"],
        "progress": scan_state["progress"],
        "current_action": scan_state["current_action"],
        "scanned_index": scan_state.get("scanned_index", 0),
        "total_endpoints": len(scan_state.get("endpoints", []))
    }

@app.get("/scan/endpoints")
def get_endpoints():
    return scan_state["endpoints"]

@app.get("/scan/vulns")
def get_vulns():
    return scan_state["vulns"]

@app.get("/scan/graph")
def get_graph():
    return scan_state["graph"]

@app.get("/scan/report")
def get_report():
    return {"markdown": scan_state["report"]}

@app.get("/scan/stream")
async def stream_logs():
    async def event_generator():
        sent = 0
        while scan_state["phase"] not in ["done", "error"]:
            logs = scan_state["logs"]
            while sent < len(logs):
                yield f"data: {logs[sent]}\n\n"
                sent += 1
            await asyncio.sleep(0.5)
        # flush remaining
        logs = scan_state["logs"]
        while sent < len(logs):
            yield f"data: {logs[sent]}\n\n"
            sent += 1
    return StreamingResponse(event_generator(), media_type="text/event-stream")

class ContinueRequest(BaseModel):
    vuln_types: Optional[List[str]] = None
    max_scan: bool = False

@app.post("/scan/continue")
async def continue_scan(req: ContinueRequest = None):
    if scan_state["phase"] == "done" and scan_state.get("app_map"):
        if req and req.vuln_types:
            scan_state["vuln_types"] = req.vuln_types
        scan_state["max_scan"] = req.max_scan if req else False
        # Queue the next batch
        scan_state["phase"] = "starting"
        asyncio.create_task(run_attack_batch())
        return {"status": "continuing", "vuln_types": scan_state["vuln_types"]}
    return {"status": "error", "message": "Cannot continue scan"}

# --- Background scan runner ---
async def run_scan(req: ScanRequest, active_vulns: list):
    try:
        from shared.models import AppMap, Endpoint, AttackResult
        from agent.agent_loop import build_agent
        from core.auth_handler import login_all_roles
        from core.crawler import crawl
        from shared.models import RoleCredential as RC

        scan_state["phase"] = "crawling"
        scan_state["progress"] = 10
        vuln_label = ", ".join(active_vulns).upper()
        scan_state["current_action"] = f"Crawling target — testing: {vuln_label}"
        scan_state["logs"].append(f"Starting scan on {req.target_url}")
        scan_state["logs"].append(f"Active vulnerability classes: {vuln_label}")

        credentials = [RC(username=r.username, password=r.password, role=r.role) for r in req.roles]
        session_store = await login_all_roles(req.target_url, credentials)
        app_map = await crawl(req.target_url, session_store)
        scan_state["endpoints"] = [
            {"id": f"ep_{i}", "url": e.url, "method": e.method,
             "params": e.params, "auth_required": e.auth_required,
             "roles_allowed": e.roles_allowed}
            for i, e in enumerate(app_map.endpoints)
        ]
        scan_state["logs"].append(f"Discovered {len(scan_state['endpoints'])} endpoints")

        if not app_map.endpoints:
            scan_state["phase"] = "done"
            scan_state["progress"] = 100
            scan_state["current_action"] = "Scan complete — no endpoints discovered"
            scan_state["logs"].append("No endpoints found. Try providing role credentials.")
            scan_state["report"] = "# VEGA Scan Report\n\nNo endpoints discovered. Provide credentials to scan authenticated routes."
            return

        scan_state["app_map"] = app_map
        scan_state["scanned_index"] = 0
        
        # Trigger the first batch attack
        await run_attack_batch()

    except Exception:
        import traceback
        scan_state["phase"] = "error"
        scan_state["logs"].append(f"Error detail: {traceback.format_exc()}")

async def run_attack_batch():
    try:
        from shared.models import AppMap, AttackResult
        from agent.agent_loop import build_agent
        
        full_app_map = scan_state.get("app_map")
        idx = scan_state.get("scanned_index", 0)
        
        if not full_app_map:
            return
            
        # Compute slice limit based on Max Scan flag
        import math
        limit = len(full_app_map.endpoints[idx:]) if scan_state.get("max_scan") else 50
        
        batch_endpoints = full_app_map.endpoints[idx : idx + limit]
        if not batch_endpoints:
            scan_state["phase"] = "done"
            scan_state["progress"] = 100
            scan_state["current_action"] = "All available endpoints have been scanned."
            return
            
        batch_app_map = AppMap(
            target_url=full_app_map.target_url,
            endpoints=batch_endpoints,
            roles=full_app_map.roles
        )
        
        scan_state["phase"] = "hypothesizing"
        scan_state["progress"] = 30
        scan_state["current_action"] = f"Generating attack hypotheses (Batch {idx+1}-{idx+len(batch_endpoints)})..."
        scan_state["logs"].append(f"Scanning batch {idx+1} to {idx+len(batch_endpoints)}...")

        scan_state["phase"] = "attacking"
        scan_state["progress"] = 50
        scan_state["current_action"] = f"Executing attacks on {len(batch_endpoints)} endpoints..."
        
        from core.request_engine import execute_attack
        from core.session_store import SessionStore
        
        # Build sessions for this execution
        session_store = SessionStore()
        # In a real impl, we would persist sessions from run_scan, but for now we re-use credentials
        # (This is a simplified re-auth for the batch)
        
        attack_results = []
        for ep_data in batch_endpoints:
            # Reconstruct Endpoint object from dict if needed, but batch_endpoints are already objects here
            # Since they come from app_map.endpoints
            
            # For each active vuln type, we might want to run multiple payloads.
            # Here we simplify: trigger a targeted attack for each endpoint.
            res = await execute_attack(
                endpoint=ep_data,
                payload={"test": "vega_payload"}, # The actual payload generation should come from hypotheses
                session_store=SessionStore(), # Assuming unauth for placeholder, 
                target_url=full_app_map.target_url
            )
            attack_results.append(res)

        scan_state["phase"] = "analyzing"
        scan_state["progress"] = 70
        scan_state["current_action"] = "Analyzing results with AI swarm..."

        agent = build_agent()
        final_state = agent.invoke({
            "app_map": batch_app_map,
            "hypotheses": [], # Hypothesis agent will generate these inside the loop if we restructure
            "attack_results": attack_results,
            "confirmed_vulns": scan_state["vulns"], 
            "logs": [],
            "vuln_types": scan_state["vuln_types"]
        })

        for log in final_state["logs"]:
            scan_state["logs"].append(log)

        scan_state["vulns"] = final_state["confirmed_vulns"]
        scan_state["scanned_index"] += len(batch_endpoints)

        # Re-build graph from cumulative vulns
        nodes, edges = [], []
        for vuln in scan_state["vulns"]:
            n_id = vuln["id"]
            nodes.append({"id": n_id, "label": vuln["type"], "type": "vuln"})
            ep_id = f"ep_{n_id}"
            try:
                ep_url = vuln["chain"][0]["endpoint"].url
            except Exception:
                ep_url = getattr(vuln["chain"][0].endpoint, "url", "Unknown Endpoint")
                
            nodes.append({"id": ep_id, "label": ep_url, "type": "endpoint"})
            edges.append({"source": ep_id, "target": n_id, "label": "exploited via"})

        scan_state["graph"] = {"nodes": nodes, "edges": edges}

        # Re-build markdown report cumulatively
        report = f"# VEGA Scan Report\n\nTarget: {full_app_map.target_url}\n\n"
        for vuln in scan_state["vulns"]:
            report += f"## {vuln['type']} [{vuln['severity']}]\n\n"
            report += f"**Evidence:** {vuln['evidence']}\n\n"
            report += f"**Narrative:**\n{vuln['narrative']}\n\n---\n\n"
        scan_state["report"] = report

        scan_state["phase"] = "done"
        scan_state["progress"] = 100
        scan_state["current_action"] = "Scan complete"
        scan_state["logs"].append("Batch scan complete.")

    except Exception:
        import traceback
        scan_state["phase"] = "error"
        scan_state["logs"].append(f"Error detail: {traceback.format_exc()}")
