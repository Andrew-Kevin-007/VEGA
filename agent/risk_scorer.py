import json
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from agent.prompts import RISK_SCORER_SYSTEM

load_dotenv()

from agent.llm_router import get_llm
from shared.state import scan_state

def score_risk(vuln_type: str, evidence: str) -> str:
    llm = get_llm(scan_state["target_url"])
    prompt = f"""
    Vulnerability type: {vuln_type}
    Evidence: {evidence}
    """
    response = llm.invoke([
        {"role": "system", "content": RISK_SCORER_SYSTEM},
        {"role": "user", "content": prompt}
    ])
    raw = response.content.strip()
    for fence in ["```json", "```JSON", "```"]:
        if raw.startswith(fence):
            raw = raw[len(fence):]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()

    try:
        result = json.loads(raw)
        return result.get("severity", "Medium")
    except json.JSONDecodeError:
        return "Medium"
