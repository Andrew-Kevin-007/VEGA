import json
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

from agent.llm_router import get_llm
from shared.state import scan_state

def analyze_crawl_data(endpoints: list, target_url: str) -> list[dict]:
    try:
        llm = get_llm(scan_state["target_url"])
        
        # Pass only first 20 endpoints to stay within token limit
        sample_endpoints = endpoints[:20]
        
        endpoints_data = []
        for ep in sample_endpoints:
            if hasattr(ep, "__dict__"):
                endpoints_data.append({
                    "url": getattr(ep, "url", ""),
                    "method": getattr(ep, "method", ""),
                    "params": getattr(ep, "params", [])
                })
            else:
                endpoints_data.append(ep)

        prompt = f"""
You are a top-tier security scanner. Analyze the following endpoints extracted during a crawl.
Target URL: {target_url}
Endpoints: {json.dumps(endpoints_data, indent=2)}

Focus strictly on identifying:
- Information Disclosure
- Predictable parameters
- Hidden admin routes
- Exposed config/debug/env endpoints

Return ONLY a valid JSON array of found vulnerabilities.
Each vulnerability dictionary MUST have exactly these keys:
- "type" (string)
- "severity" (string)
- "evidence" (string, what endpoint or pattern triggered this)
- "narrative" (string, brief explanation of the risk)

If no vulnerabilities are found, return an empty array: []
Do not include any other text, reasoning, or markdown around the JSON.
"""
        response = llm.invoke([{"role": "user", "content": prompt}])
        raw = response.content.strip()
        
        # Parse JSON response (strip markdown fences if present)
        for fence in ["```json", "```JSON", "```"]:
            if raw.startswith(fence):
                raw = raw[len(fence):]
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()
        
        if not raw:
            return []
            
        data = json.loads(raw)
        if isinstance(data, list):
            return data
        else:
            print(f"[CRAWLER INSIGHT] Error: LLM returned dict instead of array")
            return []

    except Exception as e:
        print(f"[CRAWLER INSIGHT] Error: {e}")
        return []
