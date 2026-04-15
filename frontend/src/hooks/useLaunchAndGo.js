import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vegaApi } from '../api/vegaApi';

/**
 * Returns a function that:
 * 1. Calls the Vite middleware to spawn uvicorn in a new terminal (fire-and-forget)
 * 2. Immediately navigates to /scan so the user sees the config form
 * The ScanPage's BackendStatus pill pings every 5s and turns green when ready.
 */
export function useLaunchAndGo() {
  const navigate = useNavigate();

  return useCallback(async (e) => {
    if (e) e.preventDefault();
    // Fire & forget — don't await, user shouldn't wait for spawn syscall
    vegaApi.launchBackend().catch(() => {});
    navigate('/scan');
  }, [navigate]);
}
