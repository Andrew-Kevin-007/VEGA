import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import ScanConfig from '../components/scanner/ScanConfig';
import './ScanPage.css';

const STEPS = [
  { num: '01', title: 'Authenticate',   desc: 'VEGA logs in as each role, capturing session state.' },
  { num: '02', title: 'Crawl',          desc: 'Playwright maps every endpoint across all roles.' },
  { num: '03', title: 'Hypothesize',    desc: 'LLM agent generates targeted, contextual attack plans.' },
  { num: '04', title: 'Attack & Chain', desc: 'Sequential chains execute. Baseline diffing spots anomalies.' },
  { num: '05', title: 'Analyze',        desc: 'Second agent validates. FP reducer filters noise.' },
  { num: '06', title: 'Report',         desc: 'Narrative + PDF report generated automatically.' },
];

function BackendStatus({ onReady }) {
  const [status, setStatus] = useState('checking'); // checking | online | offline

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('http://localhost:8000/scan/status', { signal: AbortSignal.timeout(2500) });
        if (res.ok) { setStatus('online'); onReady(true); }
        else setStatus('offline');
      } catch {
        setStatus('offline'); onReady(false);
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [onReady]);

  return (
    <div className={`backend-badge backend-badge--${status}`}>
      {status === 'checking' && <><Loader size={12} className="backend-badge__spin" /> Checking backend…</>}
      {status === 'online'   && <><CheckCircle size={12} /> Backend online</>}
      {status === 'offline'  && (
        <>
          <AlertCircle size={12} />
          Backend offline
          <span className="backend-badge__help">
            — run <code>start.bat</code> or:
            <code className="backend-badge__cmd">
              cd backend && uvicorn api:app --reload
            </code>
          </span>
        </>
      )}
    </div>
  );
}

export default function ScanPage() {
  const navigate = useNavigate();
  const [backendReady, setBackendReady] = useState(false);

  const handleScanStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="scanpage">
      <div className="scanpage__inner container">

        {/* ── LEFT: Form ── */}
        <div className="scanpage__left">
          <div className="scanpage__header">
            <p className="scanpage__label">Scanner</p>
            <h1 className="scanpage__title">Configure your scan.</h1>
            <p className="scanpage__sub">
              Enter a target URL and one or more role credentials. VEGA will
              authenticate, crawl, hypothesize, attack, and narrate — automatically.
              No manual configuration required.
            </p>
            <BackendStatus onReady={setBackendReady} />
          </div>

          <ScanConfig onScanStarted={handleScanStarted} backendReady={backendReady} />
        </div>

        {/* ── RIGHT: Info panel ── */}
        <div className="scanpage__right">

          {/* Pipeline steps */}
          <div className="scanpage__steps">
            <p className="scanpage__steps-label">What happens next</p>
            {STEPS.map((s, i) => (
              <div key={i} className="scanpage__step">
                <span className="scanpage__step-num">{s.num}</span>
                <div>
                  <p className="scanpage__step-title">{s.title}</p>
                  <p className="scanpage__step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick start card */}
          <div className="scanpage__tip">
            <div className="scanpage__tip-head">
              <Terminal size={13} />
              <span>Test target: OWASP Juice Shop</span>
            </div>
            <p className="scanpage__tip-body">
              Run Juice Shop locally and use these demo credentials to see a full scan:
            </p>
            <div className="scanpage__creds">
              {[
                { role: 'admin', cred: 'admin@juice-sh.op / admin123' },
                { role: 'user',  cred: 'jim@juice-sh.op / ncc-1701'  },
              ].map(({ role, cred }) => (
                <div key={role} className="scanpage__cred-row">
                  <span className="scanpage__cred-role">{role}</span>
                  <code>{cred}</code>
                </div>
              ))}
            </div>
            <div className="scanpage__tip-divider" />
            <p className="scanpage__tip-cmd-label">Start Juice Shop with Docker:</p>
            <code className="scanpage__tip-cmd">
              docker run -d -p 3000:3000 bkimminich/juice-shop
            </code>
          </div>

        </div>
      </div>
    </div>
  );
}
