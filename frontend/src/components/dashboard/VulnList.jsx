import { useState } from 'react';
import VulnCard from './VulnCard';
import './VulnList.css';

export default function VulnList({ vulns }) {
  const [filterSev, setFilterSev] = useState('ALL');

  const filtered = filterSev === 'ALL'
    ? vulns
    : vulns.filter(v => (v.severity || '').toUpperCase() === filterSev);

  const stats = {
    all: vulns.length,
    critical: vulns.filter(v => (v.severity || '').toLowerCase() === 'critical').length,
    high: vulns.filter(v => (v.severity || '').toLowerCase() === 'high').length,
    medium: vulns.filter(v => (v.severity || '').toLowerCase() === 'medium').length,
    low: vulns.filter(v => (v.severity || '').toLowerCase() === 'low').length,
  };

  if (!vulns.length) {
    return (
      <div className="vlist__empty">
        <p>No vulnerabilities found.</p>
        <span>The analysis agents are reviewing attack results.</span>
      </div>
    );
  }

  return (
    <div className="vlist">
      <div className="vlist__header">
        <h3 className="vlist__title">Confirmed Vulnerabilities</h3>
        <div className="vlist__filters">
          <button
            className={`vlist__filter ${filterSev === 'ALL' ? 'vlist__filter--active' : ''}`}
            onClick={() => setFilterSev('ALL')}
          >
            All <span>{stats.all}</span>
          </button>
          <button
            className={`vlist__filter vlist__filter--critical ${filterSev === 'CRITICAL' ? 'vlist__filter--active' : ''}`}
            onClick={() => setFilterSev('CRITICAL')}
          >
            Critical <span>{stats.critical}</span>
          </button>
          <button
            className={`vlist__filter vlist__filter--high ${filterSev === 'HIGH' ? 'vlist__filter--active' : ''}`}
            onClick={() => setFilterSev('HIGH')}
          >
            High <span>{stats.high}</span>
          </button>
          <button
            className={`vlist__filter vlist__filter--medium ${filterSev === 'MEDIUM' ? 'vlist__filter--active' : ''}`}
            onClick={() => setFilterSev('MEDIUM')}
          >
            Medium <span>{stats.medium}</span>
          </button>
          <button
            className={`vlist__filter vlist__filter--low ${filterSev === 'LOW' ? 'vlist__filter--active' : ''}`}
            onClick={() => setFilterSev('LOW')}
          >
            Low <span>{stats.low}</span>
          </button>
        </div>
      </div>

      <div className="vlist__container">
        {filtered.length > 0 ? (
          filtered.map(vuln => <VulnCard key={vuln.id} vuln={vuln} />)
        ) : (
          <div className="vlist__empty-filter">
            <p>No {filterSev} severity vulnerabilities found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
