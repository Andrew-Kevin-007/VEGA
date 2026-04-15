import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Cpu, Globe, Zap, Shield, Filter, FileText } from 'lucide-react';
import './AgentFeed.css';

/**
 * AgentFeed — Claude-style automation feed.
 * Parses log messages into structured agent action cards.
 */

const AGENT_CONFIG = {
  crawler:      { label: 'Crawler',         icon: Globe,    color: '#3b82f6', bg: '#eff6ff' },
  hypothesis:   { label: 'Hypothesis',      icon: Cpu,      color: '#8b5cf6', bg: '#f5f3ff' },
  attacker:     { label: 'Attacker',        icon: Zap,      color: '#f97316', bg: '#fff7ed' },
  analyzer:     { label: 'Analyzer',        icon: Shield,   color: '#e5484d', bg: '#fef2f2' },
  fp_reducer:   { label: 'FP Reducer',      icon: Filter,   color: '#78716c', bg: '#fafaf9' },
  narrator:     { label: 'Narrator',        icon: FileText, color: '#a78bfa', bg: '#f5f3ff' },
  system:       { label: 'System',          icon: Cpu,      color: '#8c8c8c', bg: '#f9f9f9' },
};

// Classify a log line to determine which agent it belongs to
function classifyLog(msg) {
  const m = msg.toLowerCase();
  if (m.includes('crawl') || m.includes('discovered') || m.includes('navigat') || m.includes('intercept'))
    return 'crawler';
  if (m.includes('hypothesis') || m.includes('attack plan') || m.includes('generating attack') || m.includes('llm'))
    return 'hypothesis';
  if (m.includes('testing') || m.includes('payload') || m.includes('injecting') || m.includes('attacker') || m.includes('chain'))
    return 'attacker';
  if (m.includes('analyz') || m.includes('confirmed') || m.includes('vulnerable') || m.includes('finding'))
    return 'analyzer';
  if (m.includes('false positive') || m.includes('fp') || m.includes('noise'))
    return 'fp_reducer';
  if (m.includes('narrat') || m.includes('report') || m.includes('summary'))
    return 'narrator';
  return 'system';
}

function isSignificant(msg) {
  const m = msg.toLowerCase();
  return m.includes('discovered') || m.includes('confirmed') || m.includes('testing') ||
    m.includes('vulnerable') || m.includes('crawl') || m.includes('hypothesis') ||
    m.includes('complete') || m.includes('attack') || m.includes('report') ||
    m.includes('starting') || m.includes('error');
}

function AgentCard({ entry, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = AGENT_CONFIG[entry.agent] || AGENT_CONFIG.system;
  const Icon = cfg.icon;

  return (
    <div
      className="afeed__card"
      style={{ '--agent-color': cfg.color, '--agent-bg': cfg.bg, animationDelay: `${index * 30}ms` }}
    >
      <div className="afeed__card-header" onClick={() => entry.detail && setExpanded(!expanded)}>
        <div className="afeed__card-left">
          <div className="afeed__agent-icon" style={{ background: cfg.bg, color: cfg.color }}>
            <Icon size={13} strokeWidth={2} />
          </div>
          <span className="afeed__agent-label" style={{ color: cfg.color }}>{cfg.label}</span>
          <p className="afeed__message">{entry.message}</p>
        </div>
        <div className="afeed__card-right">
          <span className="afeed__time">{entry.time}</span>
          {entry.detail && (
            <span className="afeed__expand">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
          )}
        </div>
      </div>

      {expanded && entry.detail && (
        <div className="afeed__detail">
          <pre className="afeed__detail-pre">{entry.detail}</pre>
        </div>
      )}
    </div>
  );
}

export default function AgentFeed({ logs = [], isStreaming = false }) {
  const [entries, setEntries] = useState([]);
  const feedRef = useRef();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!logs.length) return;
    const lastLog = logs[logs.length - 1];
    const msg = lastLog?.message || lastLog || '';
    if (!msg || !isSignificant(msg)) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;

    setEntries(prev => {
      const newEntry = {
        id: Date.now() + Math.random(),
        agent: classifyLog(msg),
        message: msg.length > 120 ? msg.slice(0, 120) + '…' : msg,
        detail: msg.length > 120 ? msg : null,
        time,
      };
      return [...prev.slice(-80), newEntry]; // keep last 80
    });
  }, [logs]);

  useEffect(() => {
    if (!paused && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [entries, paused]);

  return (
    <div className="afeed">
      {/* Header */}
      <div className="afeed__header">
        <div className="afeed__header-left">
          <h3 className="afeed__title">Agent Activity</h3>
          {isStreaming && (
            <span className="afeed__live">
              <span className="afeed__live-dot" />
              Live
            </span>
          )}
        </div>
        <div className="afeed__header-right">
          {entries.length > 0 && (
            <button className="afeed__pause-btn" onClick={() => setPaused(!paused)}>
              {paused ? 'Resume scroll' : 'Pause scroll'}
            </button>
          )}
          {entries.length > 0 && (
            <button className="afeed__clear-btn" onClick={() => setEntries([])}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Agent legend */}
      <div className="afeed__agents">
        {Object.entries(AGENT_CONFIG).filter(([k]) => k !== 'system').map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = entries.filter(e => e.agent === key).length;
          return (
            <div key={key} className="afeed__agent-chip" style={{ background: cfg.bg, color: cfg.color }}>
              <Icon size={11} strokeWidth={2} />
              <span>{cfg.label}</span>
              {count > 0 && <em>{count}</em>}
            </div>
          );
        })}
      </div>

      {/* Feed */}
      <div className="afeed__feed" ref={feedRef}>
        {entries.length === 0 ? (
          <div className="afeed__empty">
            <div className="afeed__empty-icon">
              {[...Object.values(AGENT_CONFIG).slice(0, 3)].map(({ icon: I, color }, i) => (
                <I key={i} size={18} strokeWidth={1.5} style={{ color }} />
              ))}
            </div>
            <p>Agent activity will appear here as the scan runs.</p>
            <span>Each of VEGA's five AI agents reports its actions in real time.</span>
          </div>
        ) : (
          entries.map((entry, i) => (
            <AgentCard key={entry.id} entry={entry} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
