import json
import os
from typing import List, Dict, Any, Optional
from langchain_groq import ChatGroq
from shared.models import Endpoint


class LLMPayloadGenerator:
    """LLM-powered payload generator for security testing."""
    
    def __init__(self):
        """Initialize payload generator with SMART LLM model."""
        llm_model = os.getenv("LLM_MODEL_SMART", "llama-3.3-70b-versatile")
        self.llm = ChatGroq(model=llm_model, temperature=0.7)
        
        # Cache payloads per endpoint URL to avoid duplicate calls
        self.payload_cache: Dict[str, List[Dict[str, Any]]] = {}
    
    def generate(self, endpoint: Endpoint) -> List[Dict[str, Any]]:
        """
        Generate attack payloads for given endpoint using LLM.
        
        Args:
            endpoint: Endpoint object with url, method, params, auth_required
        
        Returns:
            List of payload dicts with type, param, value, reason
        """
        try:
            # Check cache first
            if endpoint.url in self.payload_cache:
                return self.payload_cache[endpoint.url]
            
            # Build prompt with endpoint details
            prompt = f"""You are a security expert. Given this endpoint:
URL: {endpoint.url}
Method: {endpoint.method}
Params: {endpoint.params}
Auth Required: {endpoint.auth_required}

Generate targeted attack payloads for SQLi, XSS, IDOR, CSRF.
Return JSON only:
{{"payloads": [{{"type": "string", "param": "string", "value": "string", "reason": "string"}}]}}"""
            
            # Call LLM
            response = self.llm.invoke(prompt)
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            # Extract and parse JSON
            json_str = response_text.strip()
            
            # Remove markdown code blocks
            if json_str.startswith("```json"):
                json_str = json_str[7:]
            elif json_str.startswith("```"):
                json_str = json_str[3:]
            
            if json_str.endswith("```"):
                json_str = json_str[:-3]
            
            # Parse JSON response
            data = json.loads(json_str.strip())
            payloads = data.get("payloads", [])
            
            # Cache result
            self.payload_cache[endpoint.url] = payloads
            
            return payloads
        
        except Exception:
            pass
        
        return []
