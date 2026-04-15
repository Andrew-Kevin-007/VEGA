import { Link } from 'react-router-dom';
import './Footer.css';

const COLS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Scanner', to: '/scan' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Endpoints', to: '/dashboard/endpoints' },
      { label: 'Vulnerabilities', to: '/dashboard/vulns' },
      { label: 'Attack Graph', to: '/dashboard/graph' },
      { label: 'Executive Report', to: '/dashboard/report' },
    ],
  },
  {
    heading: 'Detection',
    links: [
      { label: 'SQL Injection', to: '/' },
      { label: 'XSS (DOM + Reflected)', to: '/' },
      { label: 'IDOR & RBAC Bypass', to: '/' },
      { label: 'JWT Tampering', to: '/' },
      { label: 'GraphQL Security', to: '/' },
      { label: 'Business Logic Flaws', to: '/' },
    ],
  },
  {
    heading: 'Architecture',
    links: [
      { label: 'Hypothesis Agent', to: '/' },
      { label: 'Attack Chain Builder', to: '/' },
      { label: 'Analyzer Agent', to: '/' },
      { label: 'FP Reducer', to: '/' },
      { label: 'Risk Scorer', to: '/' },
      { label: 'Narrator Agent', to: '/' },
    ],
  },
  {
    heading: 'Technology',
    links: [
      { label: 'FastAPI Backend', to: '/' },
      { label: 'LangGraph Orchestration', to: '/' },
      { label: 'Playwright Crawler', to: '/' },
      { label: 'Groq LLM Inference', to: '/' },
      { label: 'React Frontend', to: '/' },
      { label: 'SSE Stream Logs', to: '/' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', to: '/' },
      { label: 'API Reference', to: '/' },
      { label: 'GitHub Repository', href: 'https://github.com' },
      { label: 'OWASP Juice Shop', href: 'https://github.com/juice-shop/juice-shop' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About VEGA', to: '/' },
      { label: 'Security Research', to: '/' },
      { label: 'Responsible Disclosure', to: '/' },
      { label: 'GitHub', href: 'https://github.com' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__top">
          <div className="footer__brand-col">
            <div className="footer__brand">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <path d="M20 2L4 14v12l16 12 16-12V14L20 2z" stroke="currentColor" strokeWidth="2.2"/>
                <circle cx="20" cy="20" r="3" fill="var(--accent)"/>
              </svg>
              <span>VEGA</span>
            </div>
            <p className="footer__tagline">
              AI-powered vulnerability intelligence.<br />
              Built for security teams who need real answers.
            </p>
          </div>

          <div className="footer__grid">
            {COLS.map((col) => (
              <div className="footer__col" key={col.heading}>
                <h4 className="footer__heading">{col.heading}</h4>
                <ul className="footer__list">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                      ) : (
                        <Link to={l.to}>{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} VEGA Security Platform. Open source under MIT License.
          </p>
          <div className="footer__legal">
            <span>Privacy Policy</span>
            <span>Responsible Disclosure</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
