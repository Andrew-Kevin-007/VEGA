import requests
import json
import time

def test_workflow():
    base_url = "http://localhost:8000"
    
    # 1. Start Scan
    print("[*] Starting Scan...")
    req_body = {
        "target_url": "http://localhost:3000",
        "roles": [{"username": "admin@juice-sh.op", "password": "password", "role": "admin"}]
    }
    resp = requests.post(f"{base_url}/scan/start", json=req_body)
    if resp.status_code != 200:
        print(f"Error starting scan: {resp.status_code} {resp.text}")
        return
    print(f"[+] Scan started: {resp.json()}")
    
    # 2. Monitor status
    done = False
    while not done:
        status_resp = requests.get(f"{base_url}/scan/status")
        if status_resp.status_code == 200:
            status = status_resp.json()
            print(f"[*] Status: Phase={status['phase']} Progress={status['progress']} Action={status['current_action']}")
            if status['phase'] in ["done", "error"]:
                done = True
                break
        time.sleep(2)
        
    print("\n[*] Scan completed.")
    
    # 3. Fetch Endpoints
    ep_resp = requests.get(f"{base_url}/scan/endpoints")
    if ep_resp.status_code == 200:
        eps = ep_resp.json()
        print(f"[+] Discovered Endpoints: {len(eps)}")
        for e in eps[:3]:
            print(f"    - {e.get('method')} {e.get('url')}")
    
    # 4. Fetch Vulns
    vuln_resp = requests.get(f"{base_url}/scan/vulns")
    if vuln_resp.status_code == 200:
        vulns = vuln_resp.json()
        print(f"\n[+] Discovered Vulns: {len(vulns)}")
        for v in vulns:
            print(f"    - [{v.get('severity')}] {v.get('type')}")
    
    # 5. Fetch Report
    rep_resp = requests.get(f"{base_url}/scan/report")
    if rep_resp.status_code == 200:
        rep = rep_resp.json()
        markdown = rep.get('markdown', '')
        print(f"\n[+] Report Generated, length: {len(markdown)} chars")

if __name__ == "__main__":
    test_workflow()
