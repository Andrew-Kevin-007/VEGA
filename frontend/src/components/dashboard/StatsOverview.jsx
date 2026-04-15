import { Radar, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import './StatsOverview.css';

export default function StatsOverview({ endpoints, vulns, progress }) {
  const criticalCount = vulns.filter(v => (v.severity || '').toLowerCase() === 'critical').length;
  const highCount = vulns.filter(v => (v.severity || '').toLowerCase() === 'high').length;

  const stats = [
    { icon: Radar, label: 'Endpoints', value: endpoints.length, color: 'var(--info)' },
    { icon: ShieldAlert, label: 'Vulnerabilities', value: vulns.length, color: 'var(--high)' },
    { icon: AlertTriangle, label: 'Critical / High', value: `${criticalCount} / ${highCount}`, color: 'var(--critical)' },
    { icon: Activity, label: 'Progress', value: `${progress}%`, color: 'var(--accent)' },
  ];

  return (
    <div className="stats">
      {stats.map((s, i) => (
        <div key={i} className="stats__card">
          <div className="stats__icon" style={{ color: s.color, background: `${s.color}11` }}>
            <s.icon size={18} strokeWidth={1.8} />
          </div>
          <div>
            <p className="stats__value">{s.value}</p>
            <p className="stats__label">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
