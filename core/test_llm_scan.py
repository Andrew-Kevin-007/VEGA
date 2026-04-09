#!/usr/bin/env python3
"""
Test script for LLMScanOrchestrator.
Runs a complete scan against Juice Shop target.
"""

import asyncio
import json
import os
from pathlib import Path
from core.llm_scan_orchestrator import LLMScanOrchestrator
from shared.models import RoleCredential


async def main():
    """Run complete LLM scan test."""
    
    # Target URL (Juice Shop running locally)
    target_url = "http://localhost:3000"
    
    # Credentials for Juice Shop
    credentials = [
        {
            "username": "admin@juice-sh.op",
            "password": "admin123",
            "role": "admin"
        },
        {
            "username": "jim@juice-sh.op",
            "password": "ncc-1701",
            "role": "user"
        }
    ]
    
    print("[*] ==========================================")
    print("[*] VEGA LLM Scan Orchestrator Test")
    print("[*] ==========================================")
    print(f"[*] Target: {target_url}")
    print(f"[*] Credentials: {len(credentials)} roles")
    print("[*] ==========================================\n")
    
    # Create orchestrator
    orchestrator = LLMScanOrchestrator(target_url, credentials)
    
    # Run scan
    print("[*] Starting scan...\n")
    report = await orchestrator.run_scan()
    
    # Print report to console
    print("\n[*] ==========================================")
    print("[*] SCAN REPORT")
    print("[*] ==========================================\n")
    
    print(f"Target: {report['target']}")
    print(f"Total Endpoints: {report['total_endpoints']}")
    print(f"Total Attacks: {report['total_attacks']}")
    print(f"Vulnerabilities Found: {report['vulnerabilities_found']}\n")
    
    if report['vulnerabilities']:
        print("[!] VULNERABILITIES:")
        for i, vuln in enumerate(report['vulnerabilities'], 1):
            print(f"\n  [{i}] {vuln['type']}")
            print(f"      Endpoint: {vuln['endpoint']}")
            print(f"      Method: {vuln['method']}")
            print(f"      Param: {vuln['param']}")
            print(f"      Confidence: {vuln['confidence']}%")
            print(f"      Reason: {vuln['reason']}")
    else:
        print("[+] No vulnerabilities found")
    
    if report['narrative']:
        print("\n[*] NARRATIVE:\n")
        print(report['narrative'])
    
    # Save report to JSON
    print("\n[*] Saving report to file...")
    
    # Create reports directory if not exists
    reports_dir = Path("d:\\GitHub\\VEGA_v1.0\\reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    # Write report
    report_path = reports_dir / "scan_result.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"[+] Report saved to: {report_path}\n")
    
    print("[*] ==========================================")
    print("[*] Scan Complete")
    print("[*] ==========================================")


if __name__ == "__main__":
    asyncio.run(main())
