import json
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from agent.prompts import FP_REDUCER_SYSTEM

load_dotenv()

llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1)

def reduce_false_positive(vuln_candidate: dict, evidence: str) -> dict:
    prompt = f"""
    Vulnerability type: {vuln_candidate.get('vuln_type')}
    Confirmed: {vuln_candidate.get('confirmed')}
    Evidence: {evidence}
    Confidence: {vuln_candidate.get('confidence')}

    Is this a real vulnerability or a false positive?
    """
    response = llm.invoke([
        {"role": "system", "content": FP_REDUCER_SYSTEM},
        {"role": "user", "content": prompt}
    ])

    raw = response.content.strip()
    for fence in ["```json", "```JSON", "```"]:
        if raw.startswith(fence):
            raw = raw[len(fence):]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()

    if not raw:
        return {"is_false_positive": True, "reasoning": "empty response", "fp_score": 1.0}

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"is_false_positive": True, "reasoning": raw[:200], "fp_score": 1.0}
