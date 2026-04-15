import './StatsOverview.css';

const SEV_CONFIG = {
  critical: { label: 'Critical', color: 'var(--critical)', bg: '#fef2f2' },
  high:     { label: 'High',     color: 'var(--high)',     bg: '#fff7ed' },
  medium:   { label: 'Medium',   color: 'var(--medium)',   bg: '#fefce8' },
  low:      { label: 'Low',      color: 'var(--low)',      bg: '#f0fdf4' },
};

export default function StatsOverview({ endpoints, vulns, progress, phase }) {
  const bySev = {
    critical: vulns.filter(v => (v.severity||'').toLowerCase() === 'critical').length,
    high:     vulns.filter(v => (v.severity||'').toLowerCase() === 'high').length,
    medium:   vulns.filter(v => (v.severity||'').toLowerCase() === 'medium').length,
    low:      vulns.filter(v => (v.severity||'').toLowerCase() === 'low').length,
  };
  const total = vulns.length;
  const riskScore = total === 0 ? 0 :
    Math.round(
      (bySev.critical * 10 + bySev.high * 6 + bySev.medium * 3 + bySev.low * 1) /
      Math.max(total, 1)
    );

  return (
    <div className="stats">
      {/* Primary metric row */}
      <div className="stats__primary">
        <div className="stats__primary-card">
          <p className="stats__primary-label">Total Endpoints</p>
          <p className="stats__primary-num">{endpoints.length}</p>
          <p className="stats__primary-sub">Discovered by crawler</p>
        </div>
        <div className="stats__primary-card">
          <p className="stats__primary-label">Vulnerabilities</p>
          <p className="stats__primary-num">{total}</p>
          <p className="stats__primary-sub">Confirmed findings</p>
        </div>
        <div className="stats__primary-card">
          <p className="stats__primary-label">Scan Progress</p>
          <p className="stats__primary-num">{progress}%</p>
          <div className="stats__mini-bar">
            <div style={{ width: `${progress}%` }} className="stats__mini-fill" />
          </div>
          <p className="stats__primary-sub">{phase || 'idle'}</p>
        </div>
        <div className="stats__primary-card stats__primary-card--risk">
          <p className="stats__primary-label">Risk Score</p>
          <p className="stats__primary-num" style={{
            color: riskScore >= 8 ? 'var(--critical)' :
                   riskScore >= 5 ? 'var(--high)' :
                   riskScore >= 2 ? 'var(--medium)' : 'var(--low)'
          }}>
            {total === 0 ? '—' : `${riskScore}/10`}
          </p>
          <p className="stats__primary-sub">Weighted severity</p>
        </div>
      </div>

      {/* Severity breakdown */}
      <div className="stats__severity">
        <p className="stats__sev-head">Severity Breakdown</p>
        <div className="stats__sev-row">
          {Object.entries(SEV_CONFIG).map(([key, cfg]) => (
            <div key={key} className="stats__sev-item">
              <div className="stats__sev-bar-wrap">
                <div
                  className="stats__sev-bar"
                  style={{
                    width: total > 0 ? `${Math.round((bySev[key] / total) * 100)}%` : '0%',
                    background: cfg.color,
                  }}
                />
              </div>
              <div className="stats__sev-data">
                <span className="stats__sev-num" style={{ color: cfg.color }}>{bySev[key]}</span>
                <span className="stats__sev-label">{cfg.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
