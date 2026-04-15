import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, ChevronRight, Hash, Terminal, Cpu, Layers, 
  Workflow, Zap, MessageCircle, HelpCircle, Shield,
  ExternalLink, Copy, Check, Scale, ShieldCheck, AlertOctagon,
  Search, Code2, Database, Share2
} from 'lucide-react';
import './DocsPage.css';

const DOCS_SECTIONS = [
  {
    id: 'intro',
    title: 'Introduction',
    icon: Book,
    content: (
      <div className="docs-content">
        <h1>The VEGA Framework</h1>
        <p className="docs-lead">
          VEGA is a next-generation autonomous security intelligence platform. 
          Unlike traditional scanners that rely on static heuristics, VEGA utilizes a 
          dynamic swarm of reasoning-capable agents to identify complex, logic-based vulnerabilities.
        </p>
        
        <div className="docs-callout docs-callout--info">
          <Shield size={18} />
          <div>
            <strong>Automated Reasoning:</strong> VEGA simulates the intuition of a 
            senior penetration tester by maintaining state across multi-step attack chains.
          </div>
        </div>

        <h2>Core Value Proposition</h2>
        <p>
          In the modern era of rapid software delivery, traditional quarterly penetration 
          testing is a bottleneck. VEGA provides real-time, high-fidelity security data 
          that integrates directly into the development lifecycle.
        </p>

        <div className="docs-grid">
          <div className="docs-feature">
            <h3>Autonomous Crawling</h3>
            <p>Maps SPAs and deep API routes with Playwright-backed interception.</p>
          </div>
          <div className="docs-feature">
            <h3>Zero False Positives</h3>
            <p>Every finding is mathematically validated via delta-response analysis.</p>
          </div>
          <div className="docs-feature">
            <h3>Agentic Swarm</h3>
            <p>Specialized LLM agents collaborate to resolve complex logic flaws.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'arch',
    title: 'Architecture & Loop',
    icon: Workflow,
    content: (
      <div className="docs-content">
        <h1>The Agentic Lifecycle</h1>
        <p>VEGA operates on a cyclic, self-correcting feedback loop powered by LangGraph.</p>

        <div className="docs-callout docs-callout--info">
          <Share2 size={18} />
          <div>
            <strong>The VEGA DAG:</strong> Every scan progresses through a series of "Thought Nodes" where agents pass structured data to one another.
          </div>
        </div>

        <h2>1. Discovery (The AppMap)</h2>
        <p>
          The Crawler agent navigates the target, identifying every interactive element. 
          It captures headers, cookies, and parameter types, building a comprehensive 
          JSON manifest of the application's attack surface.
        </p>

        <h2>2. Tactical Hypothesis</h2>
        <p>
          The Hypothesis Agent performs a semantic audit of the AppMap. It identifies 
          patterns indicative of common vulnerabilities (e.g., numeric ID parameters 
          invoking an IDOR hypothesis) and generates specific injection strings.
        </p>

        <h2>3. Execution & Delta Analysis</h2>
        <p>
          The Attacker Agent fires the payloads. The Analyzer Agent then performs a 
          binary diff between the "Benign Baseline" and the "Attack Response". 
          This is where VEGA differentiates between a standard error and a 
          successful exploit.
        </p>

        <h2>4. Narrative Generation</h2>
        <p>
          Finally, the Narrator Agent converts raw HTTP evidence into a technical walkthrough 
          suitable for executive reporting and developer remediation.
        </p>
      </div>
    )
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    content: (
      <div className="docs-content">
        <h1>Quickstart Guide</h1>
        <p>Deploy VEGA into your environment and launch your first scan.</p>

        <h2>Hardware Requirements</h2>
        <ul>
          <li><strong>CPU</strong>: 4+ Cores (for Playwright parallelization)</li>
          <li><strong>RAM</strong>: 8GB minimum recommended</li>
          <li><strong>Network</strong>: Stable outbound HTTPS for LLM inference</li>
        </ul>

        <h2>Installation</h2>
        <div className="docs-code-block">
          <code>{`# Clone the repository
git clone https://github.com/vega-security/vega.git

# Install Python backend dependencies
pip install -r requirements.txt

# Install Frontend dashboard
cd frontend && npm install`}</code>
        </div>

        <h2>Environment Configuration</h2>
        <p>Seed your <code>.env</code> file in the root directory:</p>
        <div className="docs-code-block">
          <code>GROQ_API_KEY="your_gsk_xxx_key"</code>
        </div>

        <h2>Launching</h2>
        <div className="docs-code-block">
          <code>./start.sh  # Boot both API and UI</code>
        </div>
      </div>
    )
  },
  {
    id: 'safety',
    title: 'Safety & Ethics',
    icon: ShieldCheck,
    content: (
      <div className="docs-content">
        <h1>Ethical Boundaries</h1>
        <p>VEGA is built with strict safety guidelines to ensure responsible security research.</p>

        <div className="docs-callout docs-callout--info">
          <Shield size={18} />
          <div>
            <strong>Local Audits:</strong> We have whitelisted <code>localhost</code> and <code>127.0.0.1</code> to allow auditing of local development environments like Juice Shop. All other private network ranges remain blocked.
          </div>
        </div>

        <div className="docs-callout docs-callout--warning">
          <AlertOctagon size={18} />
          <div>
            <strong>Destructive Actions:</strong> By default, the Hypothesis agent is 
            constrained from generating "Full Delete" or system-level wipe commands.
          </div>
        </div>

        <h2>Compliance Controls</h2>
        <p>
          VEGA respects <code>robots.txt</code> and allows for explicit endpoint 
          blacklisting via the configuration panel.
        </p>
      </div>
    )
  },
  {
    id: 'hardening',
    title: 'Hardening & Deep Discovery',
    icon: Shield,
    content: (
      <div className="docs-content">
        <h1>Advanced Protection Layer</h1>
        <p>VEGA executes in a hardened environment meant for auditing public-facing assets.</p>

        <h3>1. SSRF Fingerprinting</h3>
        <p>
          Our protection layer performs real-time DNS pinning and IP-range validation. 
          If a target hostname resolves to a restricted internal network (e.g., 10.x.x.x, 192.168.x.x), 
          the scan is immediately halted with a <code>Security Block</code> alert.
        </p>

        <h3>2. Deep Discovery Engine</h3>
        <p>
          Traditional crawlers only see HTML buttons. VEGA's engine uses:
        </p>
        <ul>
          <li><strong>Network Interception:</strong> Captures Fetch/XHR requests made by JS bundles.</li>
          <li><strong>Static Mining:</strong> Scans scripts for relative API paths (e.g., <code>/api/v1/user</code>).</li>
          <li><strong>Memory Profiling:</strong> Hooks into the browser heap to find dormant URLs.</li>
        </ul>

        <div className="docs-callout docs-callout--info">
          <Cpu size={18} />
          <div>
            <strong>Playwright Sandbox:</strong> Every scan runs in an isolated, 
            ephemeral browser context with unique fingerprints to bypass simple anti-bot measures.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'scanning-modes',
    title: 'Operating Modes',
    icon: Layers,
    content: (
      <div className="docs-content">
        <h1>Scale & Throughput</h1>
        <p>VEGA provides granular control over how much of your infra is tested at once.</p>

        <h3>1. Incremental Batching (Default)</h3>
        <p>
          The platform operates on a "Batch-of-50" principle. This ensures that 
          the Crawler doesn't overwhelm the target server and keeps LLM token 
          expenditure predictable and cost-effective.
        </p>

        <h3>2. Targeted Max Scan</h3>
        <p>
          For critical vulnerability classes (e.g., "Find all SQLi in the app right now"), 
          the <strong>Max Scan</strong> toggle skips the batch limit. It attempts to 
          hypothesize and attack every single identified endpoint in a unified sweep.
        </p>

        <div className="docs-callout docs-callout--info">
          <Search size={18} />
          <div>
            <strong>Tip:</strong> Use Max Scan during final release validation to 
            ensure comprehensive coverage of known risk profiles.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'api-ref',
    title: 'API Reference',
    icon: Code2,
    content: (
      <div className="docs-content">
        <h1>API Reference</h1>
        <p>VEGA exposes a high-performance REST API for headless orchestration and integration.</p>

        <h3>Endpoint Table</h3>
        <div className="docs-table-wrapper">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="method method--post">POST</span></td>
                <td><code>/scan/start</code></td>
                <td>Initialize a new autonomous scan.</td>
              </tr>
              <tr>
                <td><span className="method method--get">GET</span></td>
                <td><code>/scan/status</code></td>
                <td>Fetch current phase, progress, and batch index.</td>
              </tr>
              <tr>
                <td><span className="method method--post">POST</span></td>
                <td><code>/scan/continue</code></td>
                <td>Trigger the next batch or Max Scan.</td>
              </tr>
              <tr>
                <td><span className="method method--get">GET</span></td>
                <td><code>/scan/vulns</code></td>
                <td>Retrieve all confirmed findings and evidence.</td>
              </tr>
              <tr>
                <td><span className="method method--get">GET</span></td>
                <td><code>/scan/stream</code></td>
                <td>Listen to real-time agent thought logs (SSE).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Schema Detail</h3>
        <p>A typical <code>/scan/start</code> payload requires a <code>target_url</code> and optional <code>roles</code>:</p>
        <div className="docs-code-block">
          <code>{`{
  "target_url": "https://example.com",
  "roles": [
    { "role": "admin", "username": "admin_vega", "password": "***" }
  ],
  "vuln_types": ["sqli", "xss"]
}`}</code>
        </div>
      </div>
    )
  },
  {
    id: 'deployment',
    title: 'Deployment Guide',
    icon: Database,
    content: (
      <div className="docs-content">
        <h1>Enterprise Deployment</h1>
        <p>VEGA is architected for privacy-first, local-first execution environments.</p>

        <h2>Cloud vs. On-Premise</h2>
        <div className="docs-grid">
          <div className="docs-feature">
            <h3>Private Cloud (AWS/GCP)</h3>
            <p>Deploy as a stateful container cluster. Ensure your VPC allows outbound traffic to LLM providers (Groq/Anthropic/OpenAI).</p>
          </div>
          <div className="docs-feature">
            <h3>On-Premise (Air-gapped)</h3>
            <p>For strictly air-gapped environments, VEGA can be shimmed to use local inference engines like <strong>Ollama</strong> or <strong>vLLM</strong>.</p>
          </div>
        </div>

        <h2>Environment Sealing</h2>
        <p>
          In production, we recommend running VEGA in an isolated network segment. 
          Use the <code>ROLES_ALLOWED</code> configuration to prevent the crawler 
          from attempting to navigate to sensitive internal identity providers.
        </p>
      </div>
    )
  },
  {
    id: 'advanced',
    title: 'Advanced Settings',
    icon: Scale,
    content: (
      <div className="docs-content">
        <h1>Advanced Configuration</h1>
        <p>Optimize your scanning engine for depth, speed, or cost-efficiency.</p>

        <h3>LLM Token Budgeting</h3>
        <p>
          Each scan consumes tokens. You can set the <code>MAX_TOKENS_PER_VULN</code> 
          in the <code>.env</code> file to prevent the Hypothesis agent from 
          reloading overly verbose API responses into its context window.
        </p>

        <h3>State Persistence</h3>
        <p>
          By default, VEGA uses in-memory state. For long-running scans (1,000+ endpoints), 
          you can enable SQLite persistence by setting:
        </p>
        <div className="docs-code-block">
          <code>DATABASE_TYPE="sqlite"</code>
        </div>
        
        <div className="docs-callout docs-callout--info">
          <Shield size={18} />
          <div>
            <strong>Persistent Scans:</strong> Enabling SQLite allows you to resume 
            crawling after a backend restart without losing the discovered AppMap.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Share2,
    content: (
      <div className="docs-content">
        <h1>Integrations</h1>
        <p>Connect VEGA to your existing security stack for automated remediation workflows.</p>

        <div className="docs-grid">
          <div className="docs-feature">
            <h3>Slack & MS Teams</h3>
            <p>Receive real-time alerts for <strong>Critical</strong> and <strong>High</strong> severity findings directly in your security channels.</p>
          </div>
          <div className="docs-feature">
            <h3>Jira & GitHub Issues</h3>
            <p>Automatically create tickets for confirmed vulnerabilities, including full HTTP evidence and remediation narratives.</p>
          </div>
        </div>

        <h2>Webhook Orchestration</h2>
        <p>
          VEGA supports generic outbound webhooks. Configure your listener to 
          receive JSON payloads containing the full <code>VulnReport</code> 
          schema upon completion of any scan batch.
        </p>
      </div>
    )
  },
  {
    id: 'security-model',
    title: 'Security & Privacy',
    icon: Shield,
    content: (
      <div className="docs-content">
        <h1>Security Model</h1>
        <p>VEGA is designed with a "Local-First" data architecture to protect sensitive infrastructure metadata.</p>

        <h3>Data Redaction</h3>
        <p>
          The <strong>FP-Reducer</strong> agent automatically scrubs PII and 
          sensitive tokens (e.g., JWTs, API Keys) from narrative reports 
          before they are rendered in the dashboard or exported as PDF.
        </p>

        <h3>Encryption at Rest</h3>
        <p>
          If SQLite persistence is enabled, the <code>vega.db</code> file 
          should be encrypted using volume-level encryption (e.g., BitLocker 
          or dm-crypt) as it contains the AppMap context.
        </p>

        <div className="docs-callout docs-callout--info">
          <ShieldCheck size={18} />
          <div>
            <strong>SOC2 Readiness:</strong> VEGA's logging architecture is designed 
            to provide full traceability for every attack executed, meeting 
            standard audit requirements for penetration testing tools.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'glossary',
    title: 'Glossary',
    icon: HelpCircle,
    content: (
      <div className="docs-content">
        <h1>Glossary of Terms</h1>
        
        <div className="docs-faq-item">
          <h4>Agentic Loop</h4>
          <p>A self-correcting cycle where multiple specialized AI agents pass state to one another to resolve complex problems.</p>
        </div>

        <div className="docs-faq-item">
          <h4>AppMap</h4>
          <p>The structured JSON manifest of an application's attack surface, including endpoints, parameters, and authentication states.</p>
        </div>

        <div className="docs-faq-item">
          <h4>DAST (Dynamic Application Security Testing)</h4>
          <p>A security testing method that identifies vulnerabilities by interacting with a running application.</p>
        </div>

        <div className="docs-faq-item">
          <h4>Delta Analysis</h4>
          <p>The process of comparing a benign server response to an attack response to find anomalies indicating a successful exploit.</p>
        </div>
      </div>
    )
  },
  {
    id: 'faq',
    title: 'FAQs',
    icon: HelpCircle,
    content: (
      <div className="docs-content">
        <h1>Frequently Asked Questions</h1>
        
        <div className="docs-faq-item">
          <h4>How does VEGA handle Rate Limiting?</h4>
          <p>VEGA's Crawler agent has a built-in exponential backoff. If the target server begins returning 429 status codes, the agents will automatically throttle execution.</p>
        </div>

        <div className="docs-faq-item">
          <h4>Does it support authenticated scans?</h4>
          <p>Yes. VEGA simulates a real user session. You can provide multiple roles (Admin, User, Editor) to test for Broken Access Control (BAC) and IDOR vulnerabilities.</p>
        </div>

        <div className="docs-faq-item">
          <h4>Can I use other LLMs?</h4>
          <p>VEGA is currently optimized for Llama-3 (Groq) due to its high speed and low latency. Support for Anthropic Claude 3 and OpenAI GPT-4 is currently in preview.</p>
        </div>

        <div className="docs-faq-item">
          <h4>Is my code sent to the LLM?</h4>
          <p>No. VEGA sends only the endpoint metadata, parameter structures, and HTTP responses. Your source code remains local at all times.</p>
        </div>
      </div>
    )
  }
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('intro');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="docs">
      <div className="docs__inner container">
        
        {/* Left Sidebar Navigation */}
        <aside className="docs__sidebar">
          <div className="docs__sidebar-head">
            <Book size={16} />
            <span>Developer Docs</span>
          </div>
          <nav className="docs__nav">
            {DOCS_SECTIONS.map((s) => (
              <button 
                key={s.id} 
                className={`docs__nav-item ${activeTab === s.id ? 'docs__nav-item--active' : ''}`}
                onClick={() => setActiveTab(s.id)}
                style={{ padding: '12px 14px', marginBottom: '2px' }}
              >
                <s.icon size={16} strokeWidth={activeTab === s.id ? 2 : 1.5} />
                <span>{s.title}</span>
                {activeTab === s.id && <motion.div layoutId="active-pill" className="docs__nav-pill" />}
              </button>
            ))}
          </nav>

          <div className="docs__sidebar-footer">
            <p className="docs__version">v1.2.0-stable</p>
            <a href="https://github.com/vega-security/vega" className="docs__github-link">
              View on GitHub <ExternalLink size={12} />
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="docs__main">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {DOCS_SECTIONS.find(s => s.id === activeTab)?.content}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
