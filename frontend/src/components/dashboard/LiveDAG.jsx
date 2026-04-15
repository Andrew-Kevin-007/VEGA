import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './LiveDAG.css';

/**
 * LiveDAG — Real-time Directed Acyclic Graph of discoveries and attacks.
 * Parses SSE log lines to extract graph events:
 *   - Endpoint discovered → new node
 *   - Attack launched → new edge (orange)
 *   - Vulnerability found → node turns red
 *   - Clean endpoint → node turns green
 */

const NODE_COLORS = {
  root:      '#191a1a',
  endpoint:  '#8c8c8c',
  attacking: '#f97316',
  payload:   '#8e4ec6',
  vuln:      '#e5484d',
  clean:     '#46a758',
};

const NODE_SIZE = { root: 8, endpoint: 5, attacking: 6, payload: 6, vuln: 7, clean: 5 };

export default function LiveDAG({ logs = [], vulns = [], targetUrl = '', isLive = false }) {
  const fgRef = useRef();
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ w: 800, h: 560 });
  const containerRef = useRef();
  const nodesMap = useRef({});   // id → node
  const attackedSet = useRef(new Set());

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      setDimensions({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Seed root node from targetUrl
  useEffect(() => {
    if (!targetUrl) return;
    const rootId = 'root';
    if (nodesMap.current[rootId]) return;
    const root = { id: rootId, label: targetUrl.replace(/^https?:\/\//, ''), type: 'root', color: NODE_COLORS.root, val: 3 };
    nodesMap.current[rootId] = root;
    setGraph({ nodes: [root], links: [] });
  }, [targetUrl]);

  // Parse logs into graph updates
  useEffect(() => {
    if (!logs.length) return;
    const lastLog = logs[logs.length - 1];
    if (!lastLog) return;

    const line = lastLog.message || lastLog;
    addGraphEvent(line);
  }, [logs]);

  const addGraphEvent = useCallback((line) => {
    // Endpoint discovered
    const discoveredMatch = line.match(/[Dd]iscovered?\s+([A-Z]+)\s+(\/[^\s]+)/);
    const crawledMatch    = line.match(/[Cc]rawl(?:ed|ing)?\s+(\/[^\s"']+)/);
    const endpointMatch   = line.match(/endpoint.*?(\/[^"'\s,]+)/i);

    // Attack launched
    const attackMatch = line.match(/[Tt]esting?\s+(\/[^\s"']+)|[Aa]ttack(?:ing)?\s+(\/[^\s"']+)/);

    // Vulnerability found
    const vulnMatch   = line.match(/[Vv]uln(?:erability)?.*?(\/[^\s"',]+)|[Cc]onfirmed?:?\s+(\w+)/i);
    const cleanMatch  = line.match(/[Cc]lean|[Nn]o\s+vuln|[Ss]afe/i);

    setGraph(prev => {
      const newNodes = [...prev.nodes];
      const newLinks = [...prev.links];

      const ensure = (path, type = 'endpoint') => {
        const id = path;
        if (!nodesMap.current[id]) {
          const node = {
            id,
            label: path.length > 20 ? path.slice(0, 20) + '…' : path,
            type,
            color: NODE_COLORS[type],
            val: 2,
            x: Math.random() * 400 - 200,
            y: Math.random() * 300 - 150,
          };
          nodesMap.current[id] = node;
          newNodes.push(node);
          // Link to root or parent
          const parent = path.split('/').slice(0, -1).join('/') || 'root';
          const parentId = nodesMap.current[parent] ? parent : 'root';
          if (parentId && nodesMap.current[parentId]) {
            newLinks.push({ source: parentId, target: id, color: 'rgba(140,140,140,0.3)' });
          }
        }
        return id;
      };

      const updateNode = (id, updates) => {
        const idx = newNodes.findIndex(n => n.id === id);
        if (idx >= 0) {
          newNodes[idx] = { ...newNodes[idx], ...updates };
          nodesMap.current[id] = { ...nodesMap.current[id], ...updates };
        }
      };

      // Handle discovery
      const path = (discoveredMatch && (discoveredMatch[2])) ||
                   (crawledMatch && crawledMatch[1]) ||
                   (endpointMatch && endpointMatch[1]);
      if (path && path !== '/') ensure(path, 'endpoint');

      // Handle attack
      const atkPath = attackMatch && (attackMatch[1] || attackMatch[2]);
      if (atkPath) {
        const id = ensure(atkPath, 'attacking');
        if (!attackedSet.current.has(id)) {
          attackedSet.current.add(id);
          updateNode(id, { type: 'attacking', color: NODE_COLORS.attacking, val: 3 });
          // Add attack edge
          newLinks.push({ source: 'root', target: id, color: '#f9731660', dashed: true });
        }
      }

      // Handle vuln found
      if (vulnMatch && !cleanMatch) {
        const vpath = vulnMatch[1] || atkPath;
        if (vpath) {
          const id = nodesMap.current[vpath] ? vpath : null;
          if (id) updateNode(id, { type: 'vuln', color: NODE_COLORS.vuln, val: 4 });
        }
      }

      // Handle clean
      if (cleanMatch && atkPath) {
        const id = nodesMap.current[atkPath] ? atkPath : null;
        if (id) updateNode(id, { type: 'clean', color: NODE_COLORS.clean });
      }

      return { nodes: newNodes, links: newLinks };
    });
  }, []);

  // Explicitly map payload chains from confirmed vulns
  useEffect(() => {
    if (!vulns || vulns.length === 0) return;
    setGraph(prev => {
      const newNodes = [...prev.nodes];
      const newLinks = [...prev.links];
      let didChange = false;

      vulns.forEach(v => {
        if (!v.chain || !v.chain.length) return;
        
        const vulnNodeId = `vuln_${v.id || v.type}`;
        const epNodeId = v.chain[0]?.endpoint?.url;
        const payloadNodeId = `payload_${v.id || v.type}`;
        
        // Add Vuln Node
        if (!nodesMap.current[vulnNodeId]) {
            const vulnNode = { id: vulnNodeId, label: v.type, type: 'vuln', color: NODE_COLORS.vuln, val: 5, x: Math.random()*200, y: Math.random()*200 };
            nodesMap.current[vulnNodeId] = vulnNode;
            newNodes.push(vulnNode);
            didChange = true;
        }

        // Add Payload Node (explicit visualization of HOW it was achieved)
        if (!nodesMap.current[payloadNodeId]) {
            const rawPayload = v.chain[0].payload;
            let payloadStr = typeof rawPayload === 'object' ? JSON.stringify(rawPayload) : String(rawPayload);
            if (payloadStr.length > 25) payloadStr = payloadStr.slice(0, 25) + '…';
            
            const payloadNode = { id: payloadNodeId, label: `Payload: ${payloadStr}`, type: 'payload', color: NODE_COLORS.payload, val: 4, x: Math.random()*100, y: Math.random()*100 };
            nodesMap.current[payloadNodeId] = payloadNode;
            newNodes.push(payloadNode);
            didChange = true;

            // Link Endpoint -> Payload
            if (epNodeId && nodesMap.current[epNodeId]) {
                newLinks.push({ source: epNodeId, target: payloadNodeId, color: '#f9731660', dashed: true });
            }

            // Link Payload -> Vuln
            newLinks.push({ source: payloadNodeId, target: vulnNodeId, color: '#e5484d80' });
        }
      });
      
      return didChange ? { nodes: newNodes, links: newLinks } : prev;
    });
  }, [vulns]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const size = NODE_SIZE[node.type] || 5;
    const label = node.label || node.id;

    // Glow for attacking/payload/vuln
    if (node.type === 'attacking' || node.type === 'vuln' || node.type === 'payload') {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
      const glowColor = node.type === 'attacking' ? '#f9731620' : node.type === 'payload' ? '#8e4ec620' : '#e5484d20';
      ctx.fillStyle = glowColor;
      ctx.fill();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || '#8c8c8c';
    ctx.fill();

    // Label
    if (globalScale >= 0.7) {
      const fontSize = Math.max(8 / globalScale, 9);
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(25,26,26,0.7)';
      ctx.fillText(label, node.x, node.y + size + 3);
    }
  }, []);

  const isEmpty = graph.nodes.length === 0;

  return (
    <div className="ldag" ref={containerRef}>
      {/* Legend */}
      <div className="ldag__legend">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="ldag__legend-item">
            <span className="ldag__legend-dot" style={{ background: color }} />
            <span>{type}</span>
          </div>
        ))}
        {isLive && (
          <div className="ldag__live-badge">
            <span className="ldag__live-dot" />
            Live
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="ldag__empty">
          <div className="ldag__empty-ring" />
          <p>Attack graph builds in real time as the crawler discovers endpoints.</p>
          <span>Start a scan to see the DAG grow.</span>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          graphData={graph}
          width={dimensions.w}
          height={dimensions.h}
          backgroundColor="transparent"
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => 'replace'}
          linkColor={link => link.color || 'rgba(140,140,140,0.3)'}
          linkWidth={1}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.1}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.35}
          onEngineStop={() => fgRef.current?.zoomToFit(400, 40)}
        />
      )}
    </div>
  );
}
