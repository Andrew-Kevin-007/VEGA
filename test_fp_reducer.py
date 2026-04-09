from dotenv import load_dotenv
load_dotenv()
from agent.fp_reducer import reduce_false_positive

dummy_vuln = {
    "vuln_type": "IDOR",
    "confirmed": True,
    "confidence": 0.85
}
result = reduce_false_positive(dummy_vuln, "User accessed /api/users/2 without admin role, got 200 with full user data")
print("fp_reducer OK:", result)
