import json
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from agent.prompts import HYPOTHESIS_SYSTEM

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.3)

def generate_hypotheses(app_map) -> list:
    prompt = f"""
    App target: {app_map.target_url}
    Discovered endpoints: {[e.__dict__ for e in app_map.endpoints]}
    Roles available: {app_map.roles}

    Generate attack hypotheses covering:
    IDOR, SQLi, XSS, CSRF, broken auth, business logic flaws, privilege escalation.
    Return ONLY a JSON array.
    """
    response = llm.invoke([
        {"role": "system", "content": HYPOTHESIS_SYSTEM},
        {"role": "user", "content": prompt}
    ])
    try:
        return json.loads(response.content)
    except json.JSONDecodeError:
        # strip markdown fences if model adds them
        clean = response.content.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(clean)
