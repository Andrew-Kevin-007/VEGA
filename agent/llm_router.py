import ipaddress
import socket
from urllib.parse import urlparse
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()


def is_local_target(target_url: str) -> bool:
    try:
        parsed = urlparse(target_url)
        hostname = parsed.hostname
        
        if not hostname:
            # If we couldn't parse a hostname, assume local to be safe
            return True

        if hostname.lower() == "localhost":
            return True

        # First, check if the hostname itself is literally an IP address
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback:
                return True
        except ValueError:
            pass

        # Second, try to resolve the hostname via DNS
        try:
            resolved_ip = socket.gethostbyname(hostname)
        except socket.gaierror:
            # Cannot resolve -> return True (assume local, e.g. docker alias)
            return True

        # Check if the resolved IP is a private network
        ip = ipaddress.ip_address(resolved_ip)
        if ip.is_private or ip.is_loopback:
            return True

        # Resolves, and is not a private IP -> External domain
        return False

    except Exception:
        # Fallback to local on unpredictable errors
        return True


def get_llm(target_url: str, temperature: float = 0.7) -> ChatOpenAI:
    if is_local_target(target_url):
        return ChatOpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY"),
            model="llama-3.3-70b-versatile",
            temperature=temperature
        )
    else:
        return ChatOpenAI(
            base_url=os.getenv("UNCENSORED_BASE_URL"),
            api_key=os.getenv("UNCENSORED_API_KEY"),
            model=os.getenv("UNCENSORED_MODEL"),
            temperature=temperature
        )
