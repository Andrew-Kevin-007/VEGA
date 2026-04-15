import { useNavigate } from 'react-router-dom';
import ScanConfig from '../components/scanner/ScanConfig';
import './ScanPage.css';

const STEPS = [
  { num: '01', title: 'Authenticate',    desc: 'VEGA logs in as each role, capturing session state.' },
  { num: '02', title: 'Crawl',           desc: 'Playwright maps every endpoint across all roles.' },
  { num: '03', title: 'Hypothesize',     desc: 'LLM agent generates targeted, contextual attack plans.' },
  { num: '04', title: 'Attack',          desc: 'Chains execute. Baseline diffing spots anomalies.' },
  { num: '05', title: 'Analyze',         desc: 'Second agent validates. FP reducer filters noise.' },
  { num: '06', title: 'Report',          desc: 'Narrative + PDF report generated automatically.' },
];

export default function ScanPage() {
  const navigate = useNavigate();

  const handleScanStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="scanpage">
      <div className="scanpage__inner container">

        {/* ── Left: Form ── */}
        <div className="scanpage__left">
          <div className="scanpage__header">
            <p className="scanpage__label">Scanner</p>
            <h1 className="scanpage__title">Configure your scan.</h1>
            <p className="scanpage__sub">
              Enter a target URL and one or more role credentials. VEGA will
              authenticate as each role, crawl the application, and run its
              full vulnerability pipeline — automatically.
            </p>
          </div>

          <ScanConfig onScanStarted={handleScanStarted} />
        </div>

        {/* ── Right: Info panel ── */}
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

          {/* Tip card */}
          <div className="scanpage__tip">
            <p className="scanpage__tip-head">Test target: OWASP Juice Shop</p>
            <p className="scanpage__tip-body">
              To see VEGA in action, run Juice Shop locally and use these credentials:
            </p>
            <div className="scanpage__creds">
              <div className="scanpage__cred-row">
                <span className="scanpage__cred-role">admin</span>
                <code>admin@juice-sh.op / admin123</code>
              </div>
              <div className="scanpage__cred-row">
                <span className="scanpage__cred-role">user</span>
                <code>jim@juice-sh.op / ncc-1701</code>
              </div>
            </div>
            <p className="scanpage__tip-cmd">
              <code>docker run -d -p 3000:3000 bkimminich/juice-shop</code>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
