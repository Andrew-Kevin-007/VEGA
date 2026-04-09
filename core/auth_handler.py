"""
Authentication handler for multi-role login and session management.
Uses Playwright for browser-based login with Juice Shop.
Fallback to HTTP POST if Playwright fails.
"""

import asyncio
import json
import base64
from typing import List, Optional
import requests

from core.session_store import Session, SessionStore
from shared.models import RoleCredential


async def login_all_roles(target_url: str, credentials: List[RoleCredential]) -> SessionStore:
    """
    Login all roles via Playwright and extract session data.
    
    Args:
        target_url: Target application URL (e.g., http://localhost:3000)
        credentials: List of RoleCredential objects with role, email, password
        
    Returns:
        SessionStore with authenticated sessions for all roles
    """
    session_store = SessionStore()
    
    for cred in credentials:
        session = await _login_role(target_url, cred)
        if session:
            session_store.add(session)
    
    return session_store


async def _login_role(target_url: str, credential: RoleCredential) -> Optional[Session]:
    """
    Login a single role via HTTP POST.

    Args:
        target_url: Target application URL
        credential: RoleCredential with role, username, password

    Returns:
        Session object with cookies and JWT, or None if login failed
    """
    return await _login_via_http(target_url, credential)



async def _login_via_http(target_url: str, credential: RoleCredential) -> Optional[Session]:
    """
    Fallback login via HTTP POST to /rest/user/login endpoint.
    Used if Playwright login fails.
    
    Args:
        target_url: Target application URL
        credential: RoleCredential with role, email, password
        
    Returns:
        Session object or None if login failed
    """
    def _sync_request():
        try:
            req_session = requests.Session()
            req_session.verify = False
            response = req_session.post(
                f"{target_url}/rest/user/login",
                json={"email": credential.username, "password": credential.password},
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            jwt_token = data["authentication"]["token"]
            
            cookies = {}
            for cookie in req_session.cookies:
                cookies[cookie.name] = cookie.value
            
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            session = Session(
                role=credential.role,
                cookies=cookies,
                headers=headers,
                jwt_token=jwt_token
            )
            
            print(f"[AUTH] Login OK for {credential.role}")
            return session
            
        except Exception as e:
            print(f"[AUTH] HTTP login failed for {credential.role}: {e}")
            return None

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_request)


def tamper_jwt(token: str, claim_overrides: dict) -> str:
    """
    Tamper with JWT claims without re-signing.
    Used for RBAC testing by modifying role/permission claims.
    NOTE: Resulting token will have invalid signature - for testing only.
    
    Args:
        token: JWT token (3 parts separated by dots)
        claim_overrides: Dictionary of claims to override (e.g., {"role": "admin"})
        
    Returns:
        Modified JWT token with tampered claims but invalid signature
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid JWT format - must have 3 parts")
        
        # Decode payload (part 1)
        payload_b64 = parts[1]
        
        # Add padding if needed for base64 decoding
        padding = 4 - (len(payload_b64) % 4)
        if padding != 4:
            payload_b64 += "=" * padding
        
        # Decode JSON payload
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        
        # Override claims
        payload.update(claim_overrides)
        
        # Re-encode payload (without padding for JWT standard)
        new_payload_json = json.dumps(payload, separators=(',', ':'))
        new_payload_b64 = base64.urlsafe_b64encode(
            new_payload_json.encode()
        ).decode().rstrip("=")
        
        # Reconstruct token with original signature (which is now invalid)
        tampered_token = f"{parts[0]}.{new_payload_b64}.{parts[2]}"
        return tampered_token
        
    except Exception as e:
        print(f"[AUTH] JWT tampering failed: {e}")
        return token


# Utility function to decode JWT without verification (for inspection)
def decode_jwt_payload(token: str) -> Optional[dict]:
    """
    Decode JWT payload without signature verification.
    Used for inspection only.
    
    Args:
        token: JWT token
        
    Returns:
        Decoded payload dictionary or None if invalid
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        
        payload_b64 = parts[1]
        padding = 4 - (len(payload_b64) % 4)
        if padding != 4:
            payload_b64 += "=" * padding
        
        return json.loads(base64.urlsafe_b64decode(payload_b64))
        
    except Exception as e:
        print(f"[AUTH] JWT decode failed: {e}")
        return None
