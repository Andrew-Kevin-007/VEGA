import './VulnSelector.css';

export const ALL_VULNS = [
  { id: 'sqli',     label: 'SQL Injection',         desc: 'Boolean, time-based, error-based' },
  { id: 'xss',      label: 'XSS (DOM + Reflected)', desc: 'Sink/source tracing, payload reflection' },
  { id: 'idor',     label: 'IDOR',                  desc: 'Object reference cross-role testing' },
  { id: 'jwt',      label: 'JWT Tampering',          desc: 'Alg confusion, none-alg, claim manipulation' },
  { id: 'rbac',     label: 'RBAC Bypass',            desc: 'Every endpoint from every role' },
  { id: 'csrf',     label: 'CSRF',                   desc: 'Token validation, SameSite cookie analysis' },
  { id: 'graphql',  label: 'GraphQL Security',       desc: 'Introspection, depth limits, injection' },
  { id: 'logic',    label: 'Business Logic Flaws',   desc: 'LLM-generated context-aware hypotheses' },
];

export default function VulnSelector({ selected, onChange }) {
  const allSelected = selected.length === ALL_VULNS.length;

  const toggle = (id) => {
    if (selected.includes(id)) {
      if (selected.length === 1) return; // keep at least one
      onChange(selected.filter(v => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([ALL_VULNS[0].id]); // leave at least one
    } else {
      onChange(ALL_VULNS.map(v => v.id));
    }
  };

  return (
    <div className="vselect">
      <div className="vselect__header">
        <span className="vselect__title">Vulnerability Classes</span>
        <button className="vselect__toggle-all" type="button" onClick={toggleAll}>
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <p className="vselect__hint">
        Select which attack classes VEGA will test. Defaults to all — uncheck to narrow the scan scope.
      </p>
      <div className="vselect__grid">
        {ALL_VULNS.map(({ id, label, desc }) => {
          const active = selected.includes(id);
          return (
            <label
              key={id}
              className={`vselect__item ${active ? 'vselect__item--on' : ''}`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle(id)}
                className="vselect__cb"
              />
              <div className="vselect__check">
                {active && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="vselect__text">
                <span className="vselect__label">{label}</span>
                <span className="vselect__desc">{desc}</span>
              </div>
            </label>
          );
        })}
      </div>
      <p className="vselect__selected-count">
        {selected.length} of {ALL_VULNS.length} classes selected
      </p>
    </div>
  );
}
