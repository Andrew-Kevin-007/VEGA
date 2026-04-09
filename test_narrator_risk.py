from dotenv import load_dotenv
load_dotenv()
from agent.narrator import generate_narrative
from agent.risk_scorer import score_risk

narrative = generate_narrative(
    vuln_type="IDOR",
    severity="High",
    chain=[{"step": 1, "action": "Access /api/users/2 as regular user", "result": "Got admin user data"}],
    evidence="Regular user accessed another user's private data via ID manipulation"
)
print("narrative OK:", narrative[:200])

severity = score_risk("IDOR", "User accessed other users data without authorization")
print("risk_scorer OK:", severity)
