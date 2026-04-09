import json
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from agent.prompts import ANALYZER_SYSTEM
from shared.models import AttackResult

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1)

def analyze_result(attack_result: AttackResult) -> dict:
    prompt = f"""
    Endpoint: {attack_result.endpoint.url} [{attack_result.endpoint.method}]
    Payload sent: {attack_result.payload}
    Response code: {attack_result.response_code}
    Response body (truncated): {attack_result.response_body[:500]}
    Diff from baseline: {attack_result.diff_from_baseline}

    Determine if a vulnerability was confirmed.
    """
    response = llm.invoke([
        {"role": "system", "content": ANALYZER_SYSTEM},
        {"role": "user", "content": prompt}
    ])
    
    raw = response.content.strip()
    
    # strip all possible markdown fence variations
    for fence in ["```json", "```JSON", "```"]:
        if raw.startswith(fence):
            raw = raw[len(fence):]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()
    
    # fallback if model returns empty
    if not raw:
        return {"confirmed": False, "vuln_type": "unknown", "evidence": "empty response", "confidence": 0.0}
    
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"confirmed": False, "vuln_type": "unknown", "evidence": raw[:200], "confidence": 0.0}
