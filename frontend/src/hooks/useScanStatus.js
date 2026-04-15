import { useState, useEffect, useRef, useCallback } from 'react';
import { vegaApi } from '../api/vegaApi';

export function useScanStatus(enabled = true) {
  const [status, setStatus] = useState({ phase: 'idle', progress: 0, current_action: '' });
  const intervalRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const data = await vegaApi.getStatus();
      setStatus(data);
      if (data.phase === 'done' || data.phase === 'error') {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    poll();
    intervalRef.current = setInterval(poll, 1500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, poll]);

  return {
    ...status,
    isIdle: status.phase === 'idle',
    isScanning: !['idle', 'done', 'error'].includes(status.phase),
    isDone: status.phase === 'done',
    isError: status.phase === 'error',
    refetch: poll,
  };
}
