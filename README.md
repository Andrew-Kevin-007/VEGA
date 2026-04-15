# VEGA Security Platform

![VEGA Platform](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![LangGraph](https://img.shields.io/badge/LangGraph-FF4F00?style=for-the-badge)

VEGA is an autonomous, AI-driven web application vulnerability scanner. Leveraging the bleeding-edge reasoning capabilities of LLMs within a cyclical LangGraph agentic loop, VEGA can actively crawl, hypothesize, execute, and validate real security payloads against target endpoints with zero human intervention.

## 🧠 System Architecture

VEGA is divided into a robust asynchronous FastAPI backend and a high-performance React (Vite) frontend. The core scanning intelligence is powered by **Five Specialized AI Agents** operating in a directed acyclic graph (DAG):

```mermaid
graph TD
    classDef browser fill:#3b82f6,color:#fff,stroke:#2563eb
    classDef agent fill:#8b5cf6,color:#fff,stroke:#7c3aed
    classDef exec fill:#f97316,color:#fff,stroke:#ea580c
    classDef check fill:#e5484d,color:#fff,stroke:#dc2626
    classDef report fill:#10b981,color:#fff,stroke:#059669

    A[🌐 Target Web App] -->|Playwright Interception| B(Crawler Engine):::browser
    B -->|AppMap (Endpoints + Auth)| C(Hypothesis Agent):::agent
    
    C -->|Generate Vectors| D[Attacker Agent]:::exec
    D -->|Exec Payload & Diff| E{Analyzer Agent}:::check
    
    E -->|Vuln Suspected| F(FP Reducer Agent):::agent
    E -->|Clean| C
    
    F -->|False Positive| C
    F -->|Confirmed Vuln| G[Narrator Agent]:::report
    G -->|Continuous UI Stream| H((Live Dashboard))
```

### The Agentic Loop
1. **Crawler Engine**: Intercepts HTTP traffic using Playwright, mapping forms, inputs, and endpoints intelligently.
2. **Hypothesis Agent**: LLM analyzes parameters and predicts viable vulnerabilities (SQLi, XSS, IDOR) based on signature structures.
3. **Attacker Agent**: Reconstructs state-aware HTTP requests securely injecting malicious logic payloads.
4. **Analyzer Agent**: Compares baseline (benign) HTML/JSON responses strictly against payload responses to detect deviations.
5. **False Positive Reducer**: Secondary LLM logic filters out noise caused by WAFs, generic 404s, or unstable network anomalies.
6. **Narrator Agent**: Drafts the executive technical report dynamically.

---

## 🚀 Getting Started

### 1. Requirements
* `Python >= 3.10`
* `Node.js >= 18`
* `Groq API Key` (for running the underlying Agent LLM)

### 2. Environment Setup

Create a `.env` file in the root of your project:
```bash
GROQ_API_KEY="your_gsk_key_here"
```

### 3. Installation & Launch (Local)
We've bundled cross-platform launch scripts.

**Windows:**
```cmd
start.bat
```
**macOS / Linux:**
```bash
chmod +x start.sh
./start.sh
```
This automatically boots the standard **FastAPI backend** on `:8000` and the **Vite React UI** on `:5173`.

---

## 🏗️ Production CI/CD Integration

VEGA is incredibly resilient and optimized for automated deployment pipelines. You can invoke VEGA via its REST API directly from your CI runners to gate releases on security health.

### Example GitHub Actions CI Workflow

```yaml
name: VEGA Security Gates

on:
  pull_request:
    branches: [ "main", "production" ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Spin Up Staging Environment
        run: docker-compose -f docker-compose.staging.yml up -d

      - name: Run VEGA Headless Scan
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
        run: |
          # Trigger background scan
          SCAN_ID=$(curl -s -X POST http://vega-server:8000/scan/start \
            -H "Content-Type: application/json" \
            -d '{"target_url": "http://staging-app:3000", "roles": []}' | jq -r .scan_id)
            
          # Poll until scanning terminates
          while true; do
            STATUS=$(curl -s http://vega-server:8000/scan/status | jq -r .phase)
            if [ "$STATUS" == "done" ]; then break; fi
            if [ "$STATUS" == "error" ]; then exit 1; fi
            sleep 10
          done
          
          # Fetch identified confirmed vulnerabilities
          VULNS_COUNT=$(curl -s http://vega-server:8000/scan/vulns | jq length)
          
          if [ "$VULNS_COUNT" -gt 0 ]; then
            echo "🚨 CI GATE FAILED: $VULNS_COUNT vulnerabilities detected."
            exit 1
          else
            echo "✅ ALL ENDPOINTS SECURE."
            exit 0
          fi
```

## 🛠️ Continuous Batch Scanning API 

For expansive architectures encompassing hundreds of endpoints, VEGA supports chunked processing to mitigate heavy token overhead via **Continuous Scanning**.

1. `POST /scan/start` initializes the AppMap and evaluates the first **batch of 50 routes**.
2. `POST /scan/continue` automatically slides the processing window forward, securely evaluating the *next* block of endpoints.

The UI Dashboard elegantly handles this via the **"Attack Next Batch"** mechanism visible directly within the **Overview** execution panel once a subset phase goes idle.

---
*Created by Andrew Kevin. For enterprise deployments, adhere tightly to defined CI orchestration guidelines.*
