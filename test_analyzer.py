from dotenv import load_dotenv
load_dotenv()
from shared.models import AttackResult, Endpoint
from agent.analyzer import analyze_result

dummy_endpoint = Endpoint(
    url='/api/users/2',
    method='GET',
    params={'id': '2'},
    auth_required=True,
    roles_allowed=['admin']
)
dummy_result = AttackResult(
    endpoint=dummy_endpoint,
    payload={'id': '2'},
    response_code=200,
    response_body='{"id":2,"email":"user@juice-sh.op","role":"customer"}',
    diff_from_baseline='Length diff: 50 chars. Content changed.'
)
result = analyze_result(dummy_result)
print('analyzer OK:', result)
