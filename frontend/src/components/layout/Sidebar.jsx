import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radar, ShieldAlert, GitBranch, Terminal, FileText } from 'lucide-react';
import './Sidebar.css';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/endpoints', icon: Radar, label: 'Endpoints' },
  { to: '/dashboard/vulns', icon: ShieldAlert, label: 'Vulnerabilities' },
  { to: '/dashboard/graph', icon: GitBranch, label: 'Attack Graph' },
  { to: '/dashboard/logs', icon: Terminal, label: 'Live Logs' },
  { to: '/dashboard/report', icon: FileText, label: 'Report' },
];

export default function Sidebar({ phase, progress, targetUrl }) {
  const phaseColor =
    phase === 'done' ? 'var(--low)' :
    phase === 'error' ? 'var(--critical)' :
    phase === 'idle' ? 'var(--text-tertiary)' : 'var(--accent)';

  return (
    <aside className="sidebar">
      <div className="sidebar__status">
        <div className="sidebar__status-row">
          <span className="sidebar__dot" style={{ background: phaseColor }} />
          <span className="sidebar__phase">{phase || 'idle'}</span>
        </div>
        <div className="sidebar__progress-track">
          <div className="sidebar__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {targetUrl && (
          <p className="sidebar__target" title={targetUrl}>
            {targetUrl.replace(/^https?:\/\//, '')}
          </p>
        )}
      </div>

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
            <Icon size={17} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__brand">VEGA</p>
        <p className="sidebar__version">v1.0.0</p>
      </div>
    </aside>
  );
}
