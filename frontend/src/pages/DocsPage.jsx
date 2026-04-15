import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, ChevronRight, Hash, Terminal, Cpu, Layers, 
  Workflow, Zap, MessageCircle, HelpCircle, Shield,
  ExternalLink, Copy, Check
} from 'lucide-react';
import './DocsPage.css';

const DOCS_SECTIONS = [
  {
    id: 'intro',
    title: 'Introduction',
    icon: Book,
    content: (
      <div className="docs-content">
        <h1>Autonomous AI Security with VEGA</h1>
        <p className="docs-lead">
          VEGA is an industry-first autonomous penetration testing platform that replaces traditional, 
          static scanning with a dynamic swarm of specialized AI agents.
        </p>
        
        <div className="docs-callout docs-callout--info">
          <Shield size={18} />
          <div>
            <strong>Core Philosophy:</strong> VEGA doesn't just match signatures. 
            It understands context, formulates hypotheses, and executes state-aware 
            attacks like a human security engineer.
          </div>
        </div>

        <h2>Why VEGA?</h2>
        <p>
          Traditional DAST tools fail in modern Single Page Applications (SPAs) because 
          they lack state preservation and reasoning. VEGA bridges this gap by utilizing 
          Playwright for deep-tissue crawling and LLMs for contextual decision making.
        </p>

        <div className="docs-grid">
          <div className="docs-feature">
            <h3>Zero Config</h3>
            <p>Point at a URL, provide credentials, and let the agents do the rest.</p>
          </div>
          <div className="docs-feature">
            <h3>Machine Speed</h3>
            <p>Perform complete end-to-end vulnerability analysis in minutes, not weeks.</p>
          </div>
          <div className="docs-feature">
            <h3>Agentic Intelligence</h3>
            <p>Five specialized agents work in a LangGraph DAG to ensure high accuracy.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    content: (
      <div className="docs-content">
        <h1>Getting Started</h1>
        <p>Launch your first autonomous scan in less than 3 minutes.</p>

        <h2>Prerequisites</h2>
        <ul>
          <li><strong>Python 3.10+</strong>: Core logic engine</li>
          <li><strong>Node.js 18+</strong>: React Dashboard UI</li>
          <li><strong>Groq API Key</strong>: Low-latency LLM inference</li>
        </ul>

        <h2>Installation</h2>
        <p>Clone the repository and install dependencies:</p>
        <div className="docs-code-block">
          <code>git clone https://github.com/vega-security/vega.git
cd vega
pip install -r requirements.txt
cd frontend && npm install</code>
        </div>

        <h2>Environment Configuration</h2>
        <p>Create a <code>.env</code> file in the root directory:</p>
        <div className="docs-code-block">
          <code>GROQ_API_KEY="your_gsk_xxx_key"</code>
        </div>

        <h2>Launching VEGA</h2>
        <p>Run the bundled orchestration script:</p>
        <div className="docs-code-block">
          <code>./start.sh  # Unix/macOS
start.bat  # Windows</code>
        </div>
      </div>
    )
  },
  {
    id: 'agent-swarm',
    title: 'The Agent Swarm',
    icon: Cpu,
    content: (
      <div className="docs-content">
        <h1>The Agent Swarm</h1>
        <p>
          VEGA utilizes a decentralized swarm of five specialized AI agents. 
          Each agent is meticulously prompt-engineered for a specific phase of the 
          vulnerability lifecycle.
        </p>

        <div className="docs-agent-card">
          <div className="docs-agent-head">
            <Layers size={20} className="docs-agent-icon docs-agent-icon--blue" />
            <h3>1. The Crawler Engine</h3>
          </div>
          <p>
            An automated browser agent powered by Playwright. It navigates the target application, 
            intercepts XHR/API calls, and builds an <em>AppMap</em> context including 
            authentication state and parameter structures.
          </p>
        </div>

        <div className="docs-agent-card">
          <div className="docs-agent-head">
            <MessageCircle size={20} className="docs-agent-icon docs-agent-icon--purple" />
            <h3>2. The Hypothesis Agent</h3>
          </div>
          <p>
            Analyzes the AppMap to predict viable attack surfaces. It doesn't use blind fuzzing; 
            it reasons about input context to target SQLi, XSS, and IDOR specifically where they 
            are likely to exist.
          </p>
        </div>

        <div className="docs-agent-card">
          <div className="docs-agent-head">
            <Hash size={20} className="docs-agent-icon docs-agent-icon--orange" />
            <h3>3. The Attacker Agent</h3>
          </div>
          <p>
            The executioner. It constructs state-aware HTTP requests, injecting 
            malicious logic payloads generated based on the active hypotheses.
          </p>
        </div>

        <div className="docs-agent-card">
          <div className="docs-agent-head">
            <HelpCircle size={20} className="docs-agent-icon docs-agent-icon--red" />
            <h3>4. The Analyzer Agent</h3>
          </div>
          <p>
            The auditor. Compares the response of the attack against a benign baseline. 
            It identifies deviations, error signatures, or successful data exfiltration markers.
          </p>
        </div>

        <div className="docs-agent-card">
          <div className="docs-agent-head">
            <Shield size={20} className="docs-agent-icon docs-agent-icon--green" />
            <h3>5. The FP-Reducer Agent</h3>
          </div>
          <p>
            The final arbiter. Re-evaluates confirmed findings to ensure they aren't noise 
            caused by WAF blocks or random server jitter. This ensures a 100% signal-to-noise ratio.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'scanning-modes',
    title: 'Continuous Batching',
    icon: Workflow,
    content: (
      <div className="docs-content">
        <h1>Continuous Batching</h1>
        <p>VEGA scales to large enterprise applications using a chunked execution model.</p>

        <h2>Batch Mode (Default)</h2>
        <p>
          By default, VEGA scans the first 50 discovered endpoints. This protects your 
          LLM token quota and avoids triggering aggressive rate-limiting on the target. 
          Once a batch completes, you can review findings and trigger the next 50.
        </p>

        <h2>Max Scan Mode</h2>
        <p>
          Available in the Dashboard Overview. Checking "MAX SCAN" before triggering the 
          next batch will cause the agents to sweep the <strong>entirety</strong> of the 
          remaining application map in a single massive execution run.
        </p>

        <div className="docs-callout docs-callout--warning">
          <HelpCircle size={18} />
          <div>
            <strong>Caution:</strong> Max Scan can significantly increase token usage. 
            Use it when you have identified a high-risk vulnerability class and want 
            to hunt it across the entire infrastructure.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'cicd',
    title: 'CI/CD Integration',
    icon: Terminal,
    content: (
      <div className="docs-content">
        <h1>CI/CD Integration</h1>
        <p>Integrate VEGA as a security gate in your pipeline.</p>
        
        <p>
          VEGA's API is headless-first. You can trigger scans via a single POST 
          request and poll the <code>/scan/status</code> endpoint to wait for completion.
        </p>

        <h3>Example API Call</h3>
        <div className="docs-code-block">
          <code>{`curl -X POST http://localhost:8000/scan/start \\
  -H "Content-Type: application/json" \\
  -d '{"target_url": "https://staging.myapp.com", "roles": []}'`}</code>
        </div>

        <p>
          In a production pipeline, if <code>/scan/vulns</code> returns a list 
          with length &gt; 0, the build should be automatically terminated.
        </p>
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
          <h4>Does VEGA store target data?</h4>
          <p>No. VEGA is designed to run locally or in a private cloud environment. Scan results and AppMaps exist only in memory during execution.</p>
        </div>

        <div className="docs-faq-item">
          <h4>Can it handle Multi-Factor Authentication (MFA)?</h4>
          <p>Currently, VEGA supports JWT and Cookie-based session state. Direct MFA bypassing is on the 2024 roadmap.</p>
        </div>

        <div className="docs-faq-item">
          <h4>Which LLMs does it support?</h4>
          <p>The current production release is optimized for Groq (Llama-3-70B) due to latency requirements, but can be shimmed for Anthropic or OpenAI easily.</p>
        </div>

        <div className="docs-faq-item">
          <h4>Is it safe for production targets?</h4>
          <p>VEGA executes real payloads. While the Hypothesis agent tries to avoid destructive logic, we strongly recommend scanning Staging or UAT environments first.</p>
        </div>
      </div>
    )
  }
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('intro');

  // Smooth scroll to top when tab changes
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
