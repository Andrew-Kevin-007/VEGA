import requests

def lookup_cves(vuln_type: str, evidence: str) -> list:
    try:
        keyword = vuln_type.split("(")[0].strip()
        url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch={keyword}&resultsPerPage=3"
        resp = requests.get(url, timeout=8, verify=False)
        resp.raise_for_status()
        data = resp.json()
        results = []
        for item in data.get("vulnerabilities", [])[:3]:
            cve = item.get("cve", {})
            cve_id = cve.get("id", "N/A")
            desc = cve.get("descriptions", [{}])[0].get("value", "N/A")
            metrics = cve.get("metrics", {})
            cvss_score = "N/A"
            if "cvssMetricV31" in metrics:
                cvss_score = metrics["cvssMetricV31"][0]["cvssData"]["baseScore"]
            elif "cvssMetricV2" in metrics:
                cvss_score = metrics["cvssMetricV2"][0]["cvssData"]["baseScore"]
            score = float(cvss_score) if cvss_score != "N/A" else 0
            severity = "Critical" if score >= 9 else "High" if score >= 7 else "Medium" if score >= 4 else "Low"
            results.append({"cve_id": cve_id, "description": desc[:200], "severity": severity, "cvss_score": cvss_score})
        return results
    except Exception as e:
        print(f"[CVE] Error: {e}")
        return []
