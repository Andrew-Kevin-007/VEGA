from langchain_groq import ChatGroq
from dotenv import load_dotenv
from agent.prompts import NARRATOR_SYSTEM

load_dotenv()

llm = ChatGroq(model="llama3-8b-8192", temperature=0.7)

def generate_narrative(vuln_type: str, severity: str, chain: list, evidence: str) -> str:
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
