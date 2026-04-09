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

load_dotenv()

class AgentState(TypedDict):
    app_map: AppMap
    hypotheses: List[dict]
    attack_results: List[Any]
    confirmed_vulns: List[dict]
    logs: List[str]

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
    state["confirmed_vulns"] = confirmed
    return state

def build_agent():
    graph = StateGraph(AgentState)
    graph.add_node("hypothesize", hypothesize_node)
    graph.add_node("analyze", analyze_node)
    graph.set_entry_point("hypothesize")
    graph.add_edge("hypothesize", "analyze")
    graph.add_edge("analyze", END)
    return graph.compile()
