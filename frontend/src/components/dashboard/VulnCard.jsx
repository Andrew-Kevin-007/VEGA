import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, FileText, Activity } from 'lucide-react';
import './VulnCard.css';

export default function VulnCard({ vuln }) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return 'var(--critical)';
    if (s === 'high') return 'var(--high)';
    if (s === 'medium') return 'var(--medium)';
    if (s === 'low') return 'var(--low)';
    return 'var(--info)';
  };

  const getSeverityBg = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return '#fef2f2';
    if (s === 'high') return '#fff7ed';
    if (s === 'medium') return '#fefce8';
    if (s === 'low') return '#f0fdf4';
    return '#eff6ff';
  };

  const severityColor = getSeverityColor(vuln.severity);
  const severityBg = getSeverityBg(vuln.severity);
  const path = vuln.chain?.[0]?.endpoint?.url || 'Unknown endpoint';
  const method = vuln.chain?.[0]?.endpoint?.method || 'UNK';

  return (
    <div className={`vcard ${expanded ? 'vcard--expanded' : ''}`}>
      <div
        className="vcard__header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
      >
        <div className="vcard__header-main">
          <div className="vcard__title-row">
            <span
              className="vcard__severity"
              style={{ color: severityColor, background: severityBg, borderColor: `${severityColor}40` }}
            >
              {vuln.severity}
            </span>
            <h3 className="vcard__title">{vuln.type}</h3>
          </div>
          <p className="vcard__endpoint">
            <span className="vcard__method">{method}</span>
            {path}
          </p>
        </div>

        <div className="vcard__header-side">
          <div className="vcard__fp">
            <Activity size={14} />
            <span>FP Score: {vuln.fp_score?.toFixed(2) || '0.00'}</span>
          </div>
          <button className="vcard__toggle">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="vcard__body">
          <div className="vcard__section">
            <h4 className="vcard__label">
              <FileText size={14} />
              Attacker Narrative
            </h4>
            <div className="vcard__narrative">
              {vuln.narrative.split('\n').map((p, i) => (
                p.trim() && <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="vcard__section">
            <h4 className="vcard__label">
              <AlertCircle size={14} />
              Evidence / Payload string
            </h4>
            <div className="vcard__code-block">
              <code>{vuln.evidence || JSON.stringify(vuln.chain?.[0]?.payload, null, 2)}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
