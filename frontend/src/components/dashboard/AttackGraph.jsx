import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './AttackGraph.css';

export default function AttackGraph({ graphData }) {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight || 600
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 600
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force graph to fit after data loads
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [graphData]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="agraph__empty">
        <p>Attack graph not available.</p>
        <span>Vulnerabilities must be confirmed to build the graph.</span>
      </div>
    );
  }

  const getNodeColor = (node) => {
    if (node.type === 'endpoint') return '#8c8c8c'; // text-tertiary
    if (node.type === 'vuln') return '#d97757'; // accent
    return '#191a1a';
  };

  const getNodeRadius = (node) => {
    return node.type === 'endpoint' ? 6 : 8;
  };

  return (
    <div className="agraph" ref={containerRef}>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeColor={getNodeColor}
        nodeRelSize={getNodeRadius}
        nodeLabel="label"
        linkColor={() => '#e8e5df'} // border color
        linkWidth={2}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        enableZoomInteraction={true}
        enableNodeDrag={true}
        backgroundColor="#f3f0eb" // bg-wash
      />
      <div className="agraph__legend">
        <div className="agraph__legend-item">
          <span className="agraph__legend-dot" style={{ background: '#8c8c8c' }} />
          Endpoint
        </div>
        <div className="agraph__legend-item">
          <span className="agraph__legend-dot" style={{ background: '#d97757' }} />
          Vulnerability
        </div>
      </div>
    </div>
  );
}
