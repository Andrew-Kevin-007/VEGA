import { useRef, useEffect, useState } from 'react';
import { Pause, Play, Trash2, Terminal as TerminalIcon } from 'lucide-react';
import './LogTerminal.css';

export default function LogTerminal({ logs, isStreaming, onClear }) {
  const endRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);
  const [displayLogs, setDisplayLogs] = useState([]);

  // Handle pausing without losing logs from the hook
  useEffect(() => {
    if (!paused) setDisplayLogs(logs);
  }, [logs, paused]);

  // Handle auto-scrolling
  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayLogs, autoScroll]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="logterm">
      <div className="logterm__header">
        <div className="logterm__title">
          <TerminalIcon size={14} />
          <span>Real-time Event Stream</span>
          {isStreaming && !paused && <span className="logterm__pulse" />}
        </div>
        <div className="logterm__actions">
          <button
            className="logterm__btn"
            onClick={() => setPaused(!paused)}
            title={paused ? 'Resume stream' : 'Pause stream'}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="logterm__btn" onClick={onClear} title="Clear logs">
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      <div className="logterm__body" onScroll={handleScroll}>
        {displayLogs.length === 0 ? (
          <div className="logterm__empty">
            No logs available. Start a scan to stream events.
          </div>
        ) : (
          displayLogs.map((log, i) => (
            <div key={i} className="logterm__line">
              <span className="logterm__content">{log}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
