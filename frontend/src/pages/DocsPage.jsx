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
          blacklisting via the configuration panel. It is designed to be run against 
          Non-Production (Staging/UAT) environments to mitigate any risk of 
          unintended data mutation in live systems.
        </p>

        <h2>Legal Notice</h2>
        <p>
          Users must possess explicit authorization to scan any target URL. VEGA is 
          not intended for unauthorized testing and includes internal logging for 
          auditability within enterprise deployments.
        </p>
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
