import { useState, useEffect, useRef, useCallback } from 'react';
import { vegaApi } from '../api/vegaApi';

export function useLogStream(shouldStream = false) {
  const [logs, setLogs] = useState([]);
  const sourceRef = useRef(null);

  const start = useCallback(() => {
    if (sourceRef.current) return;
    sourceRef.current = vegaApi.streamLogs(
      (line) => {
        const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs((prev) => [...prev.slice(-800), `[${ts}] ${line}`]);
      },
      () => { sourceRef.current = null; }
    );
  }, []);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
  }, []);

  const clear = useCallback(() => setLogs([]), []);

  useEffect(() => {
    if (shouldStream) start();
    else stop();
    return stop;
  }, [shouldStream, start, stop]);

  return { logs, start, stop, clear };
}
