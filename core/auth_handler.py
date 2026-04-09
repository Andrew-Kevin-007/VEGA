"""
Authentication handler for multi-role login and session management.
REST login via HTTP POST to /rest/user/login endpoint.
Fallback to Playwright for browser-based login if REST fails.
"""

import asyncio
import json
import base64
import httpx
from typing import List, Optional, Dict, Any

from core.session_store import Session, SessionStore


async def login_all_roles(target_url: str, credentials: List[Dict[str, str]]) -> SessionStore:
    """
    Login all roles via REST API with Playwright fallback.
    
    Args:
        target_url: Target application URL (e.g., http://localhost:3000)
        credentials: List of dicts with username, password, role
        
    Returns:
        SessionStore with authenticated sessions for all roles
    """
    session_store = SessionStore()
    
    print(f"[AUTH] Starting authentication for {len(credentials)} roles...")
    
    for cred in credentials:
        print(f"[AUTH] Attempting login for role: {cred.get('role', 'unknown')}")
        session = await _login_role(target_url, cred)
        if session:
            session_store.add(session)
            print(f"[AUTH] ✓ Successfully added session for {cred.get('role')}")
        else:
            print(f"[AUTH] ✗ Failed to add session for {cred.get('role')}")
    
    print(f"[AUTH] Authentication complete. {len(session_store.sessions) if hasattr(session_store, 'sessions') else 0} sessions stored.\n")
    return session_store


async def _login_role(target_url: str, credential: Dict[str, str]) -> Optional[Session]:
    """
    Login a single role. Tries REST API first, then Playwright fallback.

    Args:
        target_url: Target application URL
        credential: Dict with username, password, role

    Returns:
        Session object or None if login failed
    """
    role = credential.get("role", "unknown")
    username = credential.get("username", "")
    password = credential.get("password", "")
    
    # Step 1: Try REST API login first
    print(f"[AUTH] Step 1: Trying REST API login for {role}...")
    session = await _login_via_rest(target_url, username, password, role)
    if session:
        print(f"[AUTH] ✓ REST login successful for {role}")
        return session
    
    # Step 2: Fall back to Playwright
    print(f"[AUTH] Step 2: REST failed, falling back to Playwright for {role}...")
    session = await _login_via_playwright(target_url, username, password, role)
    if session:
        print(f"[AUTH] ✓ Playwright login successful for {role}")
        return session
    
    print(f"[AUTH] ✗ All login methods failed for {role}\n")
    return None


async def _login_via_rest(target_url: str, username: str, password: str, role: str) -> Optional[Session]:
    """
    Login via REST API POST to /rest/user/login.
    
    Args:
        target_url: Target application URL
        username: Email or username
        password: Password
        role: Role identifier for session storage
        
    Returns:
        Session object or None if login failed
    """
    try:
        login_url = f"{target_url}/rest/user/login"
        print(f"[AUTH]   → POST {login_url}")
        
        payload = {
            "email": username,
            "password": password
        }
        print(f"[AUTH]   → Payload: email={username}")
        
        # Use httpx async client
        async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
            response = await client.post(
                login_url,
                json=payload
            )
            
            print(f"[AUTH]   → Response: {response.status_code}")
            
            if response.status_code not in [200, 201]:
                print(f"[AUTH]   → Error: HTTP {response.status_code}")
                print(f"[AUTH]   → Response body: {response.text[:200]}")
                return None
            
            # Parse JSON response
            data = response.json()
            print(f"[AUTH]   → Response keys: {list(data.keys())}")
            
            # Extract JWT token
            if "authentication" not in data:
                print(f"[AUTH]   → Error: 'authentication' key not found in response")
                return None
            
            if "token" not in data["authentication"]:
                print(f"[AUTH]   → Error: 'token' key not found in authentication")
                return None
            
            jwt_token = data["authentication"]["token"]
            print(f"[AUTH]   → ✓ Token extracted (length: {len(jwt_token)})")
            
            # Extract cookies if available
            cookies = {}
            for cookie_name, cookie_value in response.cookies.items():
                cookies[cookie_name] = cookie_value
            print(f"[AUTH]   → Cookies: {list(cookies.keys())}")
            
            # Create session
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {jwt_token}"
            }
            
            session = Session(
                role=role,
                cookies=cookies,
                headers=headers,
                jwt_token=jwt_token
            )
            
            print(f"[AUTH]   → ✓ Session created for {role}")
            return session
    
    except httpx.ConnectError as e:
        print(f"[AUTH]   → Connection error: {e}")
        return None
    except httpx.TimeoutException as e:
        print(f"[AUTH]   → Timeout error: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"[AUTH]   → JSON decode error: {e}")
        print(f"[AUTH]   → Response was: {response.text[:200] if 'response' in locals() else 'N/A'}")
        return None
    except Exception as e:
        print(f"[AUTH]   → Unexpected error: {type(e).__name__}: {e}")
        return None


async def _login_via_playwright(target_url: str, username: str, password: str, role: str) -> Optional[Session]:
    """
    Fallback login via Playwright browser automation.
    
    Args:
        target_url: Target application URL
        username: Email or username
        password: Password
        role: Role identifier
        
    Returns:
        Session object or None if login failed
    """
    try:
        print(f"[AUTH]   → Playwright not yet implemented")
        print(f"[AUTH]   → Would automate browser login for {role}")
        return None
    except Exception as e:
        print(f"[AUTH]   → Playwright error: {type(e).__name__}: {e}")
        return None


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
