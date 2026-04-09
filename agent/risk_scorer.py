import json
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from agent.prompts import RISK_SCORER_SYSTEM

load_dotenv()

llm = ChatGroq(model="llama3-8b-8192", temperature=0.1)

def score_risk(vuln_type: str, evidence: str) -> str:
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
