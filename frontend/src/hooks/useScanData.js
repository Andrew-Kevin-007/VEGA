import { useState, useEffect, useCallback } from 'react';
import { vegaApi } from '../api/vegaApi';

export function useScanData(phase) {
  const [endpoints, setEndpoints] = useState([]);
  const [vulns, setVulns] = useState([]);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [report, setReport] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [ep, v, g, r] = await Promise.all([
        vegaApi.getEndpoints(),
        vegaApi.getVulns(),
        vegaApi.getGraph(),
        vegaApi.getReport(),
      ]);
      setEndpoints(ep || []);
      setVulns(v || []);
      setGraph(g || { nodes: [], edges: [] });
      setReport(r?.markdown || '');
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (phase === 'done' || phase === 'error') {
      fetchAll();
    } else if (phase === 'crawling' || phase === 'attacking' || phase === 'analyzing') {
      // Partial fetches during scan
      const t = setTimeout(async () => {
        try {
          const ep = await vegaApi.getEndpoints();
          setEndpoints(ep || []);
        } catch { /* silent */ }
        try {
          const v = await vegaApi.getVulns();
          setVulns(v || []);
        } catch { /* silent */ }
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phase, fetchAll]);

  return { endpoints, vulns, graph, report, refetch: fetchAll };
}
