from dotenv import load_dotenv
load_dotenv()
from shared.models import AppMap, Endpoint, AttackResult
from agent.agent_loop import build_agent

app_map = AppMap(
    target_url="http://localhost:3000",
    endpoints=[
        Endpoint(url="/api/users/1", method="GET", params={"id": "1"}, auth_required=True, roles_allowed=["admin"]),
    ],
    roles=["admin", "user"]
)

dummy_result = AttackResult(
    endpoint=app_map.endpoints[0],
    payload={"id": "2"},
    response_code=200,
    response_body='{"id":2,"email":"user@juice-sh.op","role":"customer"}',
    diff_from_baseline="Length diff: 50 chars."
)

agent = build_agent()
final_state = agent.invoke({
    "app_map": app_map,
    "hypotheses": [],
    "attack_results": [dummy_result],
    "confirmed_vulns": [],
    "logs": []
})

print("agent loop OK")
print("logs:", final_state["logs"])
print("confirmed vulns:", len(final_state["confirmed_vulns"]))
