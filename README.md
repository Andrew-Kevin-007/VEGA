# VEGA — AI-Powered Vulnerability Intelligence Platform

> A production-grade, multi-agent security scanning platform that crawls, hypothesizes, attacks, analyzes, and narrates web application vulnerabilities — orchestrated by LangGraph and powered by Groq LLMs.

---

## Overview

VEGA (Vulnerability Exploitation & Generation Agent) is an autonomous penetration testing platform designed for security researchers and application security teams. It combines a Playwright-based web crawler with a five-agent LLM pipeline to discover, validate, and document vulnerabilities with minimal false positives.

### What makes VEGA different

| Traditional Scanners | VEGA |
|---|---|
| Signature-based payload matching | LLM-generated contextual hypotheses |
| Single-role testing | Multi-role simultaneous testing (RBAC) |
| Binary pass/fail results | False-positive scoring + narrative explanation |
| Static reports | Real-time streaming dashboard |
| Manual chain building | Automatic multi-step attack chains |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     FastAPI Backend                       │
│  POST /scan/start   GET /scan/status   GET /scan/stream  │
│  GET /scan/endpoints   GET /scan/vulns   GET /scan/graph │
└──────────────────────────┬───────────────────────────────┘
                           │
          ┌────────────────▼─────────────────┐
          │         Agent Loop (LangGraph)    │
          │                                  │
          │  ┌──────────┐  ┌──────────────┐  │
          │  │ Hypothesis│  │   Analyzer   │  │
          │  │  Agent   │──▶│    Agent     │  │
          │  └──────────┘  └──────┬───────┘  │
          │                       │          │
          │  ┌──────────┐  ┌──────▼───────┐  │
          │  │ Narrator │◀──│  FP Reducer  │  │
          │  │  Agent   │  │  + Risk Score│  │
          │  └──────────┘  └──────────────┘  │
          └────────────────┬─────────────────┘
                           │
       ┌───────────────────▼──────────────────────┐
       │              Core Modules                 │
       │  Crawler  Auth Handler  Request Engine    │
       │  DOM Analyzer  RBAC Tester  Chain Builder │
       └───────────────────┬──────────────────────┘
                           │
       ┌───────────────────▼──────────────────────┐
       │              React Frontend               │
       │  Landing Page → Scan Config → Dashboard  │
       │  Endpoints | Vulns | Graph | Logs | Report│
       └──────────────────────────────────────────┘
```

---

## Features

- 🕷️ **Playwright Web Crawler** — Navigates the target app with authenticated sessions across multiple roles simultaneously
- 🧠 **LLM Hypothesis Generation** — Groq-powered agent generates targeted attack plans for each discovered endpoint
- ⚔️ **Multi-Step Attack Chains** — Sequential exploit chains with context injection between steps
- 🛡️ **Comprehensive Vuln Coverage** — SQLi, XSS (DOM + reflected), CSRF, IDOR, JWT tampering, RBAC bypass, GraphQL injection
- 🔍 **False-Positive Reduction** — Dedicated agent scores and filters noise before final reporting
- 📊 **Risk Scoring** — Severity classification: Critical → High → Medium → Low → Info
- 📝 **Plain-English Narratives** — Every finding includes a step-by-step attacker narrative
- 🔴 **Real-Time Streaming** — Server-Sent Events stream live scan logs to the dashboard
- 📈 **Attack Graph** — Force-directed visualization of vulnerability-endpoint relationships
- 📄 **PDF Report Export** — Printable executive report generated from markdown

---

## Tech Stack

### Backend

| Component | Technology |
|---|---|
| API Framework | FastAPI |
| AI Orchestration | LangGraph |
| LLM Provider | Groq (llama3) |
| Browser Automation | Playwright |
| HTTP Client | httpx |
| Graph Library | networkx |
| Data Models | Pydantic |

### Frontend

| Component | Technology |
|---|---|
| Build Tool | Vite |
| Framework | React 18 |
| Routing | React Router v6 |
| Styling | Vanilla CSS (CSS Modules pattern) |
| Charts | Chart.js + react-chartjs-2 |
| Graph Viz | react-force-graph-2d |
| Markdown | react-markdown |
| Icons | Lucide React |
| Fonts | Google Fonts (Newsreader, Inter, JetBrains Mono) |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com/)
- A target web application (we recommend [OWASP Juice Shop](https://github.com/juice-shop/juice-shop))

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/vega.git
cd vega
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Linux/macOS

# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Configure environment
copy .env.example .env
# Edit .env and set GROQ_API_KEY=your_key_here
```

### 3. Start the Backend

```bash
uvicorn backend.api:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`.

### 5. Start a Scan

1. Open `http://localhost:5173`
2. Click **Start scanning** or navigate to **Scanner**
3. Enter your target URL (e.g., `http://localhost:3000`)
4. Add role credentials (username, password, role)
5. Click **Start scan**
6. Watch the real-time dashboard populate

---

## Setting Up a Test Target (OWASP Juice Shop)

The easiest way to test VEGA is against [OWASP Juice Shop](https://github.com/juice-shop/juice-shop):

```bash
# Via Docker
docker run -d -p 3000:3000 bkimminich/juice-shop

# Or via npm
npm install -g @juice-shop/juice-shop
juice-shop
```

**Recommended credentials for Juice Shop:**

| Role | Username | Password |
|---|---|---|
| admin | `admin@juice-sh.op` | `admin123` |
| user | `jim@juice-sh.op` | `ncc-1701` |
| guest | `bender@juice-sh.op` | `OhG0dPlease1` |

---

## API Reference

| Endpoint | Method | Body | Description |
|---|---|---|---|
| `/scan/start` | POST | `{ target_url, roles: [{username, password, role}] }` | Start a new scan |
| `/scan/status` | GET | — | Current phase, progress percentage, action string |
| `/scan/endpoints` | GET | — | Array of discovered endpoints |
| `/scan/vulns` | GET | — | Array of confirmed vulnerabilities |
| `/scan/graph` | GET | — | Attack graph `{ nodes, edges }` |
| `/scan/report` | GET | — | Markdown report string |
| `/scan/stream` | GET | — | SSE stream of real-time log lines |

### Scan Status Phases

```
idle → starting → crawling → hypothesizing → attacking → analyzing → done
                                                                    ↓
                                                                  error
```

### Vulnerability Object Shape

```json
{
  "id": "vuln_001",
  "type": "SQL Injection",
  "severity": "Critical",
  "fp_score": 0.12,
  "narrative": "An attacker can bypass authentication by injecting...",
  "evidence": "id=1' OR '1'='1",
  "chain": [
    {
      "endpoint": { "url": "/api/login", "method": "POST" },
      "payload": { "email": "' OR 1=1--", "password": "x" },
      "response_code": 200
    }
  ]
}
```

---

## Project Structure

```
vega/
├── backend/
│   └── api.py              # FastAPI app + scan state management
├── agent/
│   ├── agent_loop.py       # LangGraph workflow orchestration
│   ├── hypothesis.py       # Attack hypothesis generator
│   ├── analyzer.py         # Vulnerability confirmation agent
│   ├── fp_reducer.py       # False-positive scoring agent
│   ├── risk_scorer.py      # Severity classification agent
│   └── narrator.py         # Plain-English narrative generator
├── core/
│   ├── crawler.py          # Playwright web crawler
│   ├── auth_handler.py     # Multi-role authentication
│   ├── request_engine.py   # HTTP request execution + diffing
│   ├── chain_builder.py    # Multi-step attack chain builder
│   ├── vuln_checks.py      # Payload database (SQLi, XSS, etc.)
│   ├── dom_analyzer.py     # DOM-based XSS detection
│   ├── rbac_tester.py      # RBAC violation testing
│   └── graphql_tester.py   # GraphQL security testing
├── shared/
│   └── models.py           # Shared Pydantic data models
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       │   └── vegaApi.js       # Backend API client
│       ├── hooks/
│       │   ├── useScanStatus.js # Polling hook
│       │   ├── useLogStream.js  # SSE hook
│       │   ├── useScanData.js   # Data fetching hook
│       │   └── useReveal.js     # Scroll reveal hook
│       ├── components/
│       │   ├── layout/          # Navbar, Sidebar, Footer, DashboardLayout
│       │   ├── landing/         # Hero, Features, HowItWorks
│       │   ├── scanner/         # ScanConfig, ScanProgress
│       │   └── dashboard/       # StatsOverview, EndpointTable, VulnCard,
│       │                        # VulnList, AttackGraph, LogTerminal,
│       │                        # SeverityChart, ReportViewer
│       └── pages/
│           ├── LandingPage.jsx
│           ├── ScanPage.jsx
│           └── DashboardPage.jsx
└── README.md
```

---

## Configuration

Create a `.env` file in the project root:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional overrides
CRAWL_MAX_DEPTH=3
CRAWL_MAX_PAGES=50
REQUEST_TIMEOUT=30
ATTACK_CONCURRENCY=5
```

---

## Development

### Running Tests

```bash
# Backend unit tests
pytest tests/ -v

# Frontend build check
cd frontend
npm run build
```

### Code Style

- Python: `black` + `ruff`
- JavaScript: ESLint (Vite default config)

---

## Security & Ethics

> ⚠️ **VEGA is intended exclusively for authorized security testing.**
>
> Only use VEGA against applications you own or have explicit written permission to test. Unauthorized penetration testing is illegal in most jurisdictions. The authors are not responsible for any misuse of this software.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [LangGraph](https://github.com/langchain-ai/langgraph) — Agent orchestration
- [Groq](https://groq.com/) — LLM inference
- [Playwright](https://playwright.dev/) — Browser automation
- [OWASP Juice Shop](https://github.com/juice-shop/juice-shop) — Test target
- [Anthropic](https://anthropic.com/) — Design inspiration
