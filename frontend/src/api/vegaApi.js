const BASE = 'http://localhost:8000';

export const vegaApi = {
  /** Call Vite's dev-server middleware to spawn uvicorn in a new terminal */
  launchBackend: async () => {
    try {
      const res = await fetch('/api/launch-backend', { method: 'POST' });
      return res.json();
    } catch {
      return { status: 'error' };
    }
  },

  startScan: async (targetUrl, roles, vulnTypes = null) => {
    const res = await fetch(`${BASE}/scan/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_url: targetUrl,
        roles,
        ...(vulnTypes && vulnTypes.length ? { vuln_types: vulnTypes } : {}),
      }),
    });
    return res.json();
  },

  getStatus: async () => {
    const res = await fetch(`${BASE}/scan/status`);
    return res.json();
  },

  getEndpoints: async () => {
    const res = await fetch(`${BASE}/scan/endpoints`);
    return res.json();
  },

  getVulns: async () => {
    const res = await fetch(`${BASE}/scan/vulns`);
    return res.json();
  },

  getGraph: async () => {
    const res = await fetch(`${BASE}/scan/graph`);
    return res.json();
  },

  getReport: async () => {
    const res = await fetch(`${BASE}/scan/report`);
    return res.json();
  },

  streamLogs: (onMessage, onError) => {
    const source = new EventSource(`${BASE}/scan/stream`);
    source.onmessage = (e) => onMessage(e.data);
    source.onerror = (e) => {
      if (onError) onError(e);
      source.close();
    };
    return source;
  },
};
