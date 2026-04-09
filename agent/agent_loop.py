from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Any
from dotenv import load_dotenv
from agent.hypothesis import generate_hypotheses
from agent.analyzer import analyze_result
from agent.fp_reducer import reduce_false_positive
from agent.narrator import generate_narrative
from agent.risk_scorer import score_risk
from shared.models import AppMap, VulnReport, AttackResult
import uuid
import asyncio
from core.request_engine import execute_attack

load_dotenv()

class AgentState(TypedDict):
    app_map: AppMap
    hypotheses: List[dict]
    attack_results: List[Any]
    confirmed_vulns: List[dict]
    logs: List[str]
    session_store: Any
    target_url: str

def hypothesize_node(state: AgentState) -> AgentState:
    state["logs"].append("Generating attack hypotheses from app map...")
    hypotheses = generate_hypotheses(state["app_map"])
    state["logs"].append(f"Generated {len(hypotheses)} hypotheses.")
    state["hypotheses"] = hypotheses
    return state

def analyze_node(state: AgentState) -> AgentState:
    state["logs"].append(f"Analyzing {len(state['attack_results'])} attack results...")
    confirmed = []
    for result in state["attack_results"]:
        analysis = analyze_result(result)
        if analysis.get("confirmed"):
            fp_check = reduce_false_positive(analysis, analysis.get("evidence", ""))
            if not fp_check.get("is_false_positive"):
                severity = score_risk(analysis["vuln_type"], analysis["evidence"])
                narrative = generate_narrative(
                    vuln_type=analysis["vuln_type"],
                    severity=severity,
                    chain=[result.__dict__],
                    evidence=analysis["evidence"]
                )
                confirmed.append({
                    "id": str(uuid.uuid4()),
                    "type": analysis["vuln_type"],
                    "severity": severity,
                    "chain": [result.__dict__],
                    "narrative": narrative,
                    "fp_score": fp_check.get("fp_score", 0.0),
                    "evidence": analysis["evidence"]
                })
                state["logs"].append(f"Confirmed vuln: {analysis['vuln_type']} [{severity}]")
            else:
                state["logs"].append(f"Filtered false positive: {analysis['vuln_type']}")
    from agent.cve_lookup import lookup_cves
    for vuln in confirmed:
        vuln["cves"] = lookup_cves(vuln["type"], vuln["evidence"])
    state["confirmed_vulns"] = confirmed
    return state

def execute_node(state: AgentState) -> AgentState:
    state["logs"].append(f"Executing {len(state['hypotheses'])} hypotheses...")
    
    session_store = state["session_store"]
    target_url = state["target_url"]
    
    async def _run_attacks():
        results = []

        # Filter to only target domain endpoints
        target_host = state["target_url"].rstrip("/")
        SKIP_PATTERNS = [
            "/assets/", "/media/", "/chunk-", ".js", ".css", ".jpg",
            ".jpeg", ".png", ".gif", ".ico", ".woff", ".svg", ".md",
            "github", "camo.githubusercontent", "shields.io",
            "githubusercontent", "redirect?to="
        ]
        relevant_endpoints = [
            ep for ep in state["app_map"].endpoints
            if (ep.url.startswith("/") or ep.url.startswith(target_host))
            and not any(pat in ep.url for pat in SKIP_PATTERNS)
        ]

        for hypothesis in state["hypotheses"]:
            target_param = hypothesis.get("target_param", "")
            payload = hypothesis.get("payload", "")
            param = hypothesis.get("target_param", "id")
            if not param or param.strip() == "":
                param = "id"
            payload = {param: hypothesis.get("payload", "")}

            # Find matching endpoint
            endpoint = relevant_endpoints[0] if relevant_endpoints else None
            for ep in relevant_endpoints:
                if target_param and target_param in ep.url:
                    endpoint = ep
                    break
                    
            if not endpoint:
                continue
                
            if endpoint.method.upper() not in ["GET", "POST"]:
                continue
                
            for role in session_store.all_roles():
                res = await execute_attack(
                    endpoint,
                    {target_param: payload},
                    session_store,
                    role=role,
                    target_url=target_url
                )
                results.append(res)
        return results

    import nest_asyncio
    nest_asyncio.apply()
    loop = asyncio.get_event_loop()
    state["attack_results"] = loop.run_until_complete(_run_attacks())
    state["logs"].append(f"Execution complete. Generated {len(state['attack_results'])} results.")
    return state

def build_agent():
    graph = StateGraph(AgentState)
    graph.add_node("hypothesize", hypothesize_node)
    graph.add_node("execute", execute_node)
    graph.add_node("analyze", analyze_node)
    graph.set_entry_point("hypothesize")
    graph.add_edge("hypothesize", "execute")
    graph.add_edge("execute", "analyze")
    graph.add_edge("analyze", END)
    return graph.compile()
