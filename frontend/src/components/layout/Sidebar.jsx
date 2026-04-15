import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Radar, ShieldAlert,
  GitBranch, Terminal, FileText, ArrowLeft
} from 'lucide-react';
import './Sidebar.css';

const links = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Overview',        end: true },
  { to: '/dashboard/endpoints', icon: Radar,           label: 'Endpoints' },
  { to: '/dashboard/vulns',     icon: ShieldAlert,     label: 'Vulnerabilities' },
  { to: '/dashboard/graph',     icon: GitBranch,       label: 'Attack Graph' },
  { to: '/dashboard/logs',      icon: Terminal,        label: 'Live Logs' },
  { to: '/dashboard/report',    icon: FileText,        label: 'Report & Export' },
];

const PHASE_LABELS = {
  idle:          'Waiting',
  starting:      'Starting…',
  crawling:      'Crawling',
  hypothesizing: 'Hypothesizing',
  attacking:     'Attacking',
  analyzing:     'Analyzing',
  done:          'Complete',
  error:         'Error',
};

export default function Sidebar({ phase, progress, targetUrl }) {
  const isActive   = phase && phase !== 'idle' && phase !== 'done' && phase !== 'error';
  const isDone     = phase === 'done';
  const isError    = phase === 'error';

  const dotColor =
    isDone  ? 'var(--low)' :
    isError ? 'var(--critical)' :
    isActive? 'var(--accent)' :
    'rgba(250,249,246,0.2)';

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar__brand-row">
        <Link to="/" className="sidebar__brand-link">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
            <path d="M20 2L4 14v12l16 12 16-12V14L20 2z" stroke="rgba(250,249,246,0.6)" strokeWidth="2"/>
            <circle cx="20" cy="20" r="3" fill="var(--accent)"/>
          </svg>
          <span className="sidebar__brand-name">VEGA</span>
        </Link>
        <Link to="/" className="sidebar__back" title="Back to site">
          <ArrowLeft size={14} />
        </Link>
      </div>

      {/* Status card */}
      <div className="sidebar__status">
        <div className="sidebar__status-top">
          <span className="sidebar__dot" style={{ background: dotColor }} />
          <span className="sidebar__phase-label">
            {PHASE_LABELS[phase] || 'Waiting'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="sidebar__bar-track">
          <div
            className="sidebar__bar-fill"
            style={{
              width: `${progress || 0}%`,
              background: isDone ? 'var(--low)' : isError ? 'var(--critical)' : 'var(--accent)',
            }}
          />
        </div>

        <div className="sidebar__status-foot">
          <span className="sidebar__progress-pct">{progress || 0}%</span>
          {targetUrl && (
            <span className="sidebar__target" title={targetUrl}>
              {targetUrl.replace(/^https?:\/\//, '').slice(0, 24)}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <Icon size={16} strokeWidth={1.8} className="sidebar__link-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* New scan CTA */}
      <div className="sidebar__footer">
        <Link to="/scan" className="sidebar__new-scan">
          Start new scan
        </Link>
        <p className="sidebar__version">VEGA · v1.0.0</p>
      </div>

    </aside>
  );
}
