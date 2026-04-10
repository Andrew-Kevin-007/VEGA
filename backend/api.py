from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import asyncio, uuid, json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

from shared.state import scan_state

# --- Request models ---
class RoleCredential(BaseModel):
    username: str
    password: str
    role: str

class ScanRequest(BaseModel):
    target_url: str
    roles: List[RoleCredential]

# --- Routes ---
@app.post("/scan/start")
async def start_scan(req: ScanRequest):
    scan_state["target_url"] = req.target_url
    scan_state["phase"] = "starting"
    scan_state["progress"] = 0
    scan_state["logs"] = []
    scan_state["vulns"] = []
    scan_state["endpoints"] = []
    scan_state["graph"] = {"nodes": [], "edges": []}

    asyncio.create_task(run_scan(req))
    return {"scan_id": str(uuid.uuid4())}

@app.get("/scan/status")
def get_status():
    return {
        "phase": scan_state["phase"],
        "progress": scan_state["progress"],
        "current_action": scan_state["current_action"]
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

# --- Background scan runner ---
async def run_scan(req: ScanRequest):
    try:
        from shared.models import AppMap, Endpoint, AttackResult
        from agent.agent_loop import build_agent
        from core.auth_handler import login_all_roles
        from core.crawler import crawl
        from shared.models import RoleCredential as RC

        scan_state["phase"] = "crawling"
        scan_state["progress"] = 10
        scan_state["current_action"] = "Crawling target application..."
        scan_state["logs"].append(f"Starting scan on {req.target_url}")

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

        # Crawler insight — LLM static vuln analysis
        from agent.crawler_insight import analyze_crawl_data
        scan_state["logs"].append("Running LLM crawler insight analysis...")
        insight_vulns = analyze_crawl_data(scan_state["endpoints"], req.target_url)
        for v in insight_vulns:
            scan_state["vulns"].append({
                "id": str(uuid.uuid4()),
                "type": v.get("type", "Unknown"),
                "severity": v.get("severity", "Medium"),
                "evidence": v.get("evidence", ""),
                "narrative": v.get("narrative", ""),
                "fp_score": 0.15,
                "chain": []
            })
        scan_state["logs"].append(f"Crawler insight found {len(insight_vulns)} static vulns.")

        # Subdomain enumeration
        from agent.subdomain_enum import enumerate_subdomains
        scan_state["logs"].append("Running subdomain enumeration...")
        subdomains = enumerate_subdomains(req.target_url)
        scan_state["logs"].append(f"Found {len(subdomains)} subdomains: {subdomains[:5]}")

        if not app_map.endpoints:
            scan_state["phase"] = "done"
            scan_state["progress"] = 100
            scan_state["current_action"] = "Scan complete — no endpoints discovered"
            scan_state["logs"].append("No endpoints found. Try providing role credentials.")
            scan_state["report"] = "# VEGA Scan Report\n\nNo endpoints discovered. Provide credentials to scan authenticated routes."
            return

        scan_state["phase"] = "hypothesizing"
        scan_state["progress"] = 30
        scan_state["current_action"] = "Generating attack hypotheses..."

        scan_state["phase"] = "attacking"
        scan_state["progress"] = 50
        scan_state["current_action"] = "Running attack chain..."


        # --- Additional vulnerability checks ---
        from core.vuln_checks import check_crlf, run_sqlmap

        # CRLF Injection checks on first 5 endpoints
        scan_state["logs"].append("Running CRLF injection checks...")
        for ep in app_map.endpoints[:5]:
            result = await check_crlf(ep, session_store)
            scan_state["logs"].append(f"CRLF check on {ep.method} {ep.url}: {'vulnerable' if result['vulnerable'] else 'safe'}")
            if result["vulnerable"]:
                scan_state["vulns"].append({
                    "id": str(uuid.uuid4()),
                    "type": "CRLF Injection",
                    "severity": "High",
                    "evidence": result["evidence"],
                    "payload": result["payload"],
                    "narrative": "CRLF injection detected — attacker can inject arbitrary HTTP headers.",
                    "fp_score": 0.1,
                    "chain": []
                })

        # SQLMap check on first endpoint
        scan_state["logs"].append("Running SQLMap on first endpoint...")
        sqlmap_result = await run_sqlmap(req.target_url, app_map.endpoints[0])
        scan_state["logs"].append(f"SQLMap check on {app_map.endpoints[0].url}: {'vulnerable' if sqlmap_result['vulnerable'] else 'safe'}")
        if sqlmap_result["vulnerable"]:
            scan_state["vulns"].append({
                "id": str(uuid.uuid4()),
                "type": "SQL Injection via SQLMap",
                "severity": "Critical",
                "evidence": sqlmap_result["evidence"],
                "payload": "sqlmap automated scan",
                "narrative": "SQL injection detected via SQLMap — database may be exposed to data exfiltration or manipulation.",
                "fp_score": 0.05,
                "chain": []
            })

        scan_state["phase"] = "analyzing"
        scan_state["progress"] = 70
        scan_state["current_action"] = "Analyzing results..."

        agent = build_agent()
        final_state = agent.invoke({
            "app_map": app_map,
            "hypotheses": [],
            "attack_results": [],
            "confirmed_vulns": [],
            "logs": [],
            "session_store": session_store,
            "target_url": req.target_url
})

        for log in final_state["logs"]:
            scan_state["logs"].append(log)

        scan_state["vulns"] = final_state["confirmed_vulns"]

        # Build graph from vulns
        nodes, edges = [], []
        for vuln in final_state["confirmed_vulns"]:
            n_id = vuln["id"]
            nodes.append({"id": n_id, "label": vuln["type"], "type": "vuln"})
            ep_id = f"ep_{n_id}"
            ep = vuln["chain"][0]["endpoint"]
            ep_url = ep.url if hasattr(ep, "url") else ep.get("url", "unknown")
            nodes.append({"id": ep_id, "label": ep_url, "type": "endpoint"})
            edges.append({"source": ep_id, "target": n_id, "label": "exploited via"})

        scan_state["graph"] = {"nodes": nodes, "edges": edges}

        # Build markdown report
        report = f"# VEGA Scan Report\n\nTarget: {req.target_url}\n\n"
        for vuln in final_state["confirmed_vulns"]:
            report += f"## {vuln['type']} [{vuln['severity']}]\n\n"
            report += f"**Evidence:** {vuln['evidence']}\n\n"
            report += f"**Narrative:**\n{vuln['narrative']}\n\n---\n\n"
        scan_state["report"] = report

        scan_state["phase"] = "done"
        scan_state["progress"] = 100
        scan_state["current_action"] = "Scan complete"
        scan_state["logs"].append("Scan complete.")

    except Exception:
        import traceback
        scan_state["phase"] = "error"
        scan_state["logs"].append(f"Error detail: {traceback.format_exc()}")
        print(f"[SCAN ERROR] {traceback.format_exc()}")
