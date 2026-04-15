import './ScanProgress.css';

const PHASES = [
  { key: 'starting', label: 'Initializing' },
  { key: 'crawling', label: 'Crawling' },
  { key: 'hypothesizing', label: 'Hypothesizing' },
  { key: 'attacking', label: 'Attacking' },
  { key: 'analyzing', label: 'Analyzing' },
  { key: 'done', label: 'Complete' },
];

export default function ScanProgress({ phase, progress, currentAction }) {
  const activeIndex = PHASES.findIndex((p) => p.key === phase);

  return (
    <div className="scanprog">
      <div className="scanprog__bar-track">
        <div
          className="scanprog__bar-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="scanprog__phases">
        {PHASES.map((p, i) => (
          <div
            key={p.key}
            className={`scanprog__phase ${
              i < activeIndex ? 'scanprog__phase--done' : ''
            } ${i === activeIndex ? 'scanprog__phase--active' : ''}`}
          >
            <div className="scanprog__dot" />
            <span className="scanprog__phase-label">{p.label}</span>
          </div>
        ))}
      </div>

      {currentAction && (
        <p className="scanprog__action">{currentAction}</p>
      )}
    </div>
  );
}
