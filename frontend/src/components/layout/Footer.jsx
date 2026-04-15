import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__grid">
          <div className="footer__col">
            <h4 className="footer__heading">Platform</h4>
            <ul className="footer__list">
              <li><Link to="/scan">Scanner</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/dashboard?tab=report">Reports</Link></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">Capabilities</h4>
            <ul className="footer__list">
              <li><span>SQL Injection</span></li>
              <li><span>Cross-Site Scripting</span></li>
              <li><span>IDOR Detection</span></li>
              <li><span>RBAC Testing</span></li>
              <li><span>GraphQL Security</span></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">Architecture</h4>
            <ul className="footer__list">
              <li><span>Hypothesis Agent</span></li>
              <li><span>Analyzer Agent</span></li>
              <li><span>FP Reducer</span></li>
              <li><span>Risk Scorer</span></li>
              <li><span>Narrator Agent</span></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">Project</h4>
            <ul className="footer__list">
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><span>Documentation</span></li>
              <li><span>API Reference</span></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__brand">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <path d="M20 2L4 14v12l16 12 16-12V14L20 2z" stroke="currentColor" strokeWidth="2.2"/>
              <circle cx="20" cy="20" r="3" fill="var(--accent)"/>
            </svg>
            <span>VEGA</span>
          </div>
          <p className="footer__copy">AI-powered vulnerability intelligence.</p>
        </div>
      </div>
    </footer>
  );
}
