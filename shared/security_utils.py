import socket
import ipaddress
from urllib.parse import urlparse
from typing import Tuple, Optional

# Private and reserved IP ranges to block for SSRF protection
PRIVATE_IP_RANGES = [
    ipaddress.ip_network('127.0.0.0/8'),      # Loopback
    ipaddress.ip_network('10.0.0.0/8'),       # Private-Use
    ipaddress.ip_network('172.16.0.0/12'),    # Private-Use
    ipaddress.ip_network('192.168.0.0/16'),   # Private-Use
    ipaddress.ip_network('169.254.0.0/16'),   # Link-Local
    ipaddress.ip_network('0.0.0.0/8'),        # Current network
    ipaddress.ip_network('100.64.0.0/10'),    # Shared Address Space
    ipaddress.ip_network('192.0.0.0/24'),     # IETF Protocol Assignments
    ipaddress.ip_network('192.0.2.0/24'),     # TEST-NET-1
    ipaddress.ip_network('198.18.0.0/15'),    # Network Interconnect Device Benchmark Testing
    ipaddress.ip_network('198.51.100.0/24'),  # TEST-NET-2
    ipaddress.ip_network('203.0.113.0/24'),   # TEST-NET-3
    ipaddress.ip_network('224.0.0.0/4'),      # Multicast
    ipaddress.ip_network('240.0.0.0/4'),      # Reserved for Future Use
    ipaddress.ip_network('::1/128'),          # IPv6 Loopback
    ipaddress.ip_network('fe80::/10'),        # IPv6 Link-Local
    ipaddress.ip_network('fc00::/7'),         # IPv6 Unique Local
]

def is_safe_url(url: str, allow_internal: bool = False) -> Tuple[bool, Optional[str]]:
    """
    Validate if a URL is safe to scan (prevents SSRF).
    
    Args:
        url: The URL to validate
        allow_internal: If True, bypasses private IP checks
        
    Returns:
        (is_safe, error_message)
    """
    if allow_internal:
        return True, None

    try:
        parsed = urlparse(url)
        if not parsed.scheme or parsed.scheme not in ['http', 'https']:
            return False, "Invalid URL scheme. Only HTTP and HTTPS are allowed."

        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid hostname."

        # 1. Check for literal IP addresses in hostname
        try:
            ip = ipaddress.ip_address(hostname)
            if any(ip in range for range in PRIVATE_IP_RANGES):
                return False, f"Target IP {hostname} is in a restricted private range."
        except ValueError:
            # Not an IP literal, continue to DNS resolution
            pass

        # 2. Resolve DNS and check resulting IP
        try:
            # Note: In production, you might want to use a custom DNS resolver that prevents DNS Rebinding
            resolved_ip_str = socket.gethostbyname(hostname)
            resolved_ip = ipaddress.ip_address(resolved_ip_str)
            
            if any(resolved_ip in range for range in PRIVATE_IP_RANGES):
                return False, f"Hostname {hostname} resolves to restricted IP {resolved_ip_str}."
        except socket.gaierror:
            return False, f"Could not resolve hostname: {hostname}"

        return True, None

    except Exception as e:
        return False, f"URL validation error: {str(e)}"
