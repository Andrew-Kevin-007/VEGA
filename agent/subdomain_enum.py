import requests
from urllib.parse import urlparse

def enumerate_subdomains(target_url: str) -> list[str]:
    if "localhost" in target_url or "127.0.0.1" in target_url:
        print("[SUBDOMAIN] Skipping — local target")
        return []
    try:
        # Extract domain from target_url
        parsed = urlparse(target_url)
        domain = parsed.hostname
        
        # Fallback if no scheme was provided (e.g., just "example.com")
        if not domain:
            domain = target_url.split('/')[0]
            
        # Strip "www." if present to get the base domain
        if domain.startswith("www."):
            domain = domain[4:]
            
        url = f"https://crt.sh/?q=%.{domain}&output=json"
        
        # Query crt.sh
        resp = requests.get(url, timeout=10, verify=False)
        resp.raise_for_status()
        
        # In some cases, crt.sh might not return valid JSON if there are no results or it errors out
        text = resp.text.strip()
        if not text.startswith("["):
            return []
            
        data = resp.json()
        subdomains = set()
        
        if isinstance(data, list):
            for item in data:
                name_value = item.get("name_value", "")
                # name_value can sometimes contain multiple domains separated by newlines
                for name in name_value.split('\n'):
                    name = name.strip()
                    if name and not name.startswith("*"):
                        subdomains.add(name)
                        
        return list(subdomains)
        
    except Exception as e:
        print(f"[SUBDOMAIN] Error: {e}")
        return []
