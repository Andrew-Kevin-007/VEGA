"""
Web crawler for discovering endpoints and API routes.
Uses Playwright to intercept network requests and extract forms/links.
Builds an AppMap of all discovered endpoints.
"""

import asyncio
import json
from typing import Set, List, Optional
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

from core.session_store import SessionStore
from shared.models import AppMap, Endpoint


async def crawl(target_url: str, session_store: SessionStore) -> AppMap:
    """
    Crawl target URL and discover all endpoints.

    Args:
        target_url: Target application URL (e.g., http://localhost:3000)
        session_store: SessionStore with authenticated sessions

    Returns:
        AppMap with all discovered endpoints
    """
    # Get first available role for authentication
    roles = session_store.all_roles()
    if not roles:
        print("[CRAWLER] No authenticated sessions available")
        return AppMap(target_url=target_url, endpoints=[], roles=[])

    first_role = roles[0]
    headers = session_store.get_headers(first_role)
    cookies = session_store.get_cookies(first_role)

    # Run sync crawler in executor to avoid asyncio issues on Windows
    loop = asyncio.get_event_loop()
    endpoints = await loop.run_in_executor(
        None, _crawl_sync, target_url, headers, cookies
    )

    # Convert endpoint tuples to Endpoint objects
    endpoint_objects = []
    for method, path, params in endpoints:
        try:
            endpoint = Endpoint(
                url=path,
                method=method,
                params=list(params) if params else [],
                auth_required=False,
                roles_allowed=[]
            )
            endpoint_objects.append(endpoint)
        except Exception as e:
            print(f"[CRAWLER] Error: {e}")

    # Create and return AppMap
    app_map = AppMap(target_url=target_url, endpoints=endpoint_objects, roles=roles)
    return app_map


def _crawl_sync(target_url: str, headers: dict, cookies: dict) -> Set[tuple]:
    """
    Sync crawler using playwright sync_api.

    Args:
        target_url: Target application URL
        headers: Authentication headers
        cookies: Authentication cookies

    Returns:
        Set of (method, path, params) tuples
    """
    endpoints: Set[tuple] = set()
    visited_urls: Set[str] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        if headers is None:
            headers = {}
            
        context = browser.new_context(extra_http_headers=headers)
        page = context.new_page()

        # Set cookies
        if cookies:
            context.add_cookies([
                {"name": k, "value": v, "domain": urlparse(target_url).netloc}
                for k, v in cookies.items()
            ])

        # Setup request interception
        def handle_request(request):
            try:
                print(f"[CRAWLER] Request: {request.method} {request.url[:80]}")
                path = urlparse(request.url).path
                method = request.method

                # Try to extract request body for POST/PUT/PATCH
                request_data = {}
                try:
                    if request.method in ["POST", "PUT", "PATCH"]:
                        post_data = request.post_data
                        if post_data:
                            request_data = json.loads(post_data)
                except Exception as e:
                    print(f"[CRAWLER] Error: {e}")

                # Extract parameter names from request
                params = list(request_data.keys()) if request_data else []

                # Add to endpoints
                endpoint_key = (method, path, tuple(sorted(params)))
                endpoints.add(endpoint_key)
            except Exception as e:
                print(f"[CRAWLER] Error: {e}")

        page.on("request", handle_request)

        # Start crawling
        queue = [target_url]

        while queue and len(visited_urls) < 30:
            url = queue.pop(0)

            if url in visited_urls:
                continue

            visited_urls.add(url)

            try:
                # Navigate to page
                page.goto(url, wait_until="networkidle", timeout=10000)
                print(f"[CRAWLER] Visited: {url}, endpoints so far: {len(endpoints)}")

                # Extract forms
                forms = page.evaluate("""
                    () => {
                        const forms = [];
                        document.querySelectorAll('form').forEach(form => {
                            const inputs = [];
                            form.querySelectorAll('input, textarea, select').forEach(input => {
                                if (input.name) {
                                    inputs.push(input.name);
                                }
                            });
                            forms.push({
                                action: form.action || '',
                                method: form.method || 'GET',
                                inputs: inputs
                            });
                        });
                        return forms;
                    }
                """)

                # Process extracted forms
                for form in forms:
                    try:
                        action = form.get('action', '')
                        if action:
                            action_url = urljoin(url, action)
                            action_path = urlparse(action_url).path
                            method = form.get('method', 'GET').upper()
                            inputs = form.get('inputs', [])

                            endpoint_key = (method, action_path, tuple(sorted(inputs)))
                            endpoints.add(endpoint_key)
                    except Exception as e:
                        print(f"[CRAWLER] Error: {e}")

                # Extract links
                links = page.evaluate("""
                    () => {
                        const links = [];
                        document.querySelectorAll('a[href]').forEach(a => {
                            links.push(a.href);
                        });
                        return links;
                    }
                """)

                # Add discovered links to queue
                for link in links:
                    try:
                        link_parsed = urlparse(link)
                        target_parsed = urlparse(target_url)

                        # Only crawl same domain
                        if link_parsed.netloc == target_parsed.netloc:
                            if link not in visited_urls and len(queue) < 30:
                                queue.append(link)
                    except Exception as e:
                        print(f"[CRAWLER] Error: {e}")

            except Exception as e:
                # Silent failure on timeouts, 404s, etc.
                print(f"[CRAWLER] Error: {e}")

        browser.close()
        print(f"[CRAWLER] Done. Total endpoints: {len(endpoints)}")

    return endpoints
