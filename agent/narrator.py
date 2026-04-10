from langchain_groq import ChatGroq
from dotenv import load_dotenv
from agent.prompts import NARRATOR_SYSTEM

load_dotenv()

from agent.llm_router import get_llm
from shared.state import scan_state

def generate_narrative(vuln_type: str, severity: str, chain: list, evidence: str) -> str:
    llm = get_llm(scan_state["target_url"])
    prompt = f"""
    Vulnerability: {vuln_type}
    Severity: {severity}
    Attack chain steps: {chain}
    Evidence: {evidence}

    Write the attacker narrative.
    """
    response = llm.invoke([
        {"role": "system", "content": NARRATOR_SYSTEM},
        {"role": "user", "content": prompt}
    ])
    return response.content.strip()
