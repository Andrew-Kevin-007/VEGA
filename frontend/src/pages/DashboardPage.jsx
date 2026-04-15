import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { useScanStatus } from '../hooks/useScanStatus';
import { useLogStream }  from '../hooks/useLogStream';
import { useScanData }   from '../hooks/useScanData';
import { vegaApi }       from '../api/vegaApi';
import DashboardLayout   from '../components/layout/DashboardLayout';
import StatsOverview     from '../components/dashboard/StatsOverview';
import EndpointTable     from '../components/dashboard/EndpointTable';
import VulnList          from '../components/dashboard/VulnList';
import LiveDAG           from '../components/dashboard/LiveDAG';
import AgentFeed         from '../components/dashboard/AgentFeed';
import ReportViewer      from '../components/dashboard/ReportViewer';
import SeverityChart     from '../components/dashboard/SeverityChart';
import VulnCard          from '../components/dashboard/VulnCard';
import './DashboardPage.css';

/* ── Tab header ────────────────────────────────────── */
function TabHeader({ label, title, sub }) {
  return (
    <div className="dash-tab__header">
      <p className="dash-tab__label">{label}</p>
      <h1 className="dash-tab__title">{title}</h1>
      {sub && <p className="dash-tab__sub">{sub}</p>}
    </div>
  );
}

/* ── Animated counter ──────────────────────────────── */
function AnimCounter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const diff = value - prev.current;
    const steps = Math.min(Math.abs(diff), 12);
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setDisplay(Math.round(prev.current + (diff * i / steps)));
      if (i >= steps) { clearInterval(tick); prev.current = value; }
    }, 40);
    return () => clearInterval(tick);
  }, [value]);
  return <>{display}{suffix}</>;
}

/* ── Live finding badge ────────────────────────────── */
function FindingBadge({ vuln, idx }) {
  const sevColor = { critical:'var(--critical)', high:'var(--high)', medium:'var(--medium)', low:'var(--low)' };
  const sev = (vuln.severity || 'low').toLowerCase();
  return (
    <div className="dash-live-badge" style={{ animationDelay: `${idx * 60}ms` }}>
      <AlertTriangle size={12} style={{ color: sevColor[sev], flexShrink: 0 }} />
      <div>
        <span className="dash-live-badge__name">{vuln.name || vuln.type || 'Vulnerability'}</span>
        <span className="dash-live-badge__ep">{vuln.endpoint || ''}</span>
      </div>
      <span className="dash-live-badge__sev" style={{ color: sevColor[sev] }}>
        {vuln.severity}
      </span>
    </div>
  );
}

/* ── Batch Action Form ─────────────────────────────── */
function BatchAction({ status }) {
  const [selectedVuln, setSelectedVuln] = useState('all');
  const [isMaxScan, setIsMaxScan]       = useState(false);
  
  const handleContinue = () => {
    vegaApi.continueScan(selectedVuln === 'all' ? null : [selectedVuln], isMaxScan);
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer', color: 'rgba(250,249,246,0.7)' }}>
        <input 
          type="checkbox" 
          checked={isMaxScan} 
          onChange={e => setIsMaxScan(e.target.checked)} 
          style={{ accentColor: 'var(--accent)' }}
        />
        MAX SCAN
      </label>
      
      <div style={{ display: 'flex', gap: '0' }}>
        <select 
           value={selectedVuln} 
           onChange={e => setSelectedVuln(e.target.value)}
           style={{ 
             background: '#191a1a', 
             color: '#fff', 
             border: '1px solid rgba(250,249,246,0.2)', 
             borderRight: 'none',
             padding: '0 12px', 
             height: '36px', 
             borderTopLeftRadius: '4px',
             borderBottomLeftRadius: '4px',
             fontSize: '12px',
             outline: 'none',
             cursor: 'pointer'
           }}
        >
          <option value="all">All Vulnerabilities</option>
          <option value="sqli">SQL Injection</option>
          <option value="xss">Cross-Site Scripting</option>
          <option value="idor">IDOR</option>
          <option value="jwt">JWT Flaws</option>
          <option value="rbac">Privilege Escalation</option>
          <option value="csrf">CSRF</option>
          <option value="logic">Business Logic</option>
          <option value="graphql">GraphQL Exploits</option>
        </select>
        <button 
          className="dash-overview-report-btn" 
          onClick={handleContinue}
          style={{ 
            background: 'var(--accent)', 
            color: '#000', 
            border: 'none', 
            height: '36px',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0
          }}
        >
          Attack Next Batch ({status.total_endpoints - status.scanned_index} remaining) <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Overview tab ──────────────────────────────────── */
function OverviewTab({ status, endpoints, vulns, logs }) {
  const isIdle    = !status.phase || status.phase === 'idle';
  const isScanning = status.isScanning;
  const isDone    = status.isDone;
  const topFindings = vulns.slice().sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[(a.severity||'').toLowerCase()] ?? 4) - (order[(b.severity||'').toLowerCase()] ?? 4);
  }).slice(0, 4);

  return (
    <div className="dash-tab">

      {/* Header */}
      <div className="dash-tab__header">
        <p className="dash-tab__label">Overview</p>
        <div className="dash-overview-head">
          <div>
            <h1 className="dash-tab__title">
              {isIdle ? 'Security Dashboard' : isDone ? 'Scan Complete' : 'Scan in Progress'}
            </h1>
            <p className="dash-tab__sub">
              {isIdle
                ? 'Configure and launch a scan to see real-time results.'
                : isDone
                ? `Completed — ${vulns.length} vulnerabilities confirmed across ${endpoints.length} endpoints.`
                : `${status.current_action || `Phase: ${status.phase}`}`}
            </p>
          </div>
          {isDone && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {status.scanned_index < status.total_endpoints && (
                <BatchAction status={status} />
              )}
              <Link to="/report" className="dash-overview-report-btn" style={{ height: '36px' }}>
                Download Report <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <StatsOverview endpoints={endpoints} vulns={vulns} progress={status.progress} phase={status.phase} />

      {/* Idle */}
      {isIdle && endpoints.length === 0 && vulns.length === 0 && (
        <div className="dash-idle">
          <div className="dash-idle__inner">
            <Activity size={36} strokeWidth={1.5} style={{ color: 'var(--accent)', marginBottom: 16 }} />
            <h2 className="dash-idle__title">No scan running</h2>
            <p className="dash-idle__desc">Configure a target URL and credentials to begin. Results populate in real time as each AI agent works through the pipeline.</p>
            <Link to="/scan" className="dash-idle__cta">Configure a scan <ArrowRight size={15} /></Link>
          </div>
        </div>
      )}

      {/* Live two-column: findings + activity */}
      {(isScanning || vulns.length > 0 || endpoints.length > 0) && (
        <div className="dash-overview__grid">

          {/* Left: priority findings */}
          <div className="dash-overview__main">
            {/* Live findings drop-in (only while scanning) */}
            {isScanning && vulns.length > 0 && (
              <div className="dash-live-findings">
                <div className="dash-section-head">
                  <span className="dash-section-label">Live Findings</span>
                  <span className="dash-live-pill">
                    <span className="dash-live-dot" /> {vulns.length} found
                  </span>
                </div>
                {vulns.slice(-6).reverse().map((v, i) => <FindingBadge key={v.id || i} vuln={v} idx={i} />)}
              </div>
            )}

            {/* Priority findings (static) */}
            {topFindings.length > 0 && (
              <div>
                <div className="dash-section-head">
                  <span className="dash-section-label">Priority Findings</span>
                  {vulns.length > 4 && (
                    <Link to="/dashboard/vulns" className="dash-see-all">See all {vulns.length} <ArrowRight size={12} /></Link>
                  )}
                </div>
                {topFindings.map((v, i) => <VulnCard key={v.id || i} vuln={v} />)}
              </div>
            )}

            {/* Endpoints count */}
            {endpoints.length > 0 && (
              <div className="dash-ep-bar">
                <div className="dash-ep-bar__text">
                  <span className="dash-ep-bar__num"><AnimCounter value={endpoints.length} /></span>
                  <span className="dash-ep-bar__label">endpoints discovered</span>
                </div>
                <Link to="/dashboard/endpoints" className="dash-see-all">View all <ArrowRight size={12} /></Link>
              </div>
            )}
          </div>

          {/* Right: severity chart + agent feed mini */}
          <div className="dash-overview__sidebar">
            {vulns.length > 0 && (
              <div>
                <p className="dash-section-label" style={{ marginBottom: 14 }}>Severity Distribution</p>
                <SeverityChart vulns={vulns} />
              </div>
            )}

            {/* Mini agent feed */}
            <div>
              <p className="dash-section-label" style={{ marginBottom: 12 }}>
                Agent Activity
                {isScanning && <span className="dash-live-pill" style={{ marginLeft: 8 }}><span className="dash-live-dot" /></span>}
              </p>
              <AgentFeed logs={logs} isStreaming={isScanning} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────── */
export default function DashboardPage() {
  const status   = useScanStatus(true);
  const { logs, clear } = useLogStream(status.isScanning);
  const scanData = useScanData(status.phase);
  const targetUrl = scanData?.endpoints?.[0]?.url?.split('/').slice(0,3).join('/') || '';

  const content = (
    <Routes>
      <Route index element={
        <OverviewTab status={status} endpoints={scanData.endpoints} vulns={scanData.vulns} logs={logs} />
      }/>
      <Route path="endpoints" element={
        <div className="dash-tab">
          <TabHeader label="Discovery" title="Discovered Endpoints"
            sub={`${scanData.endpoints.length} endpoints mapped by the Playwright crawler`} />
          <EndpointTable endpoints={scanData.endpoints} />
        </div>
      }/>
      <Route path="vulns" element={
        <div className="dash-tab">
          <TabHeader label="Security Analysis" title="Confirmed Vulnerabilities"
            sub={`${scanData.vulns.length} findings validated by the analyzer and FP-reduction agents`} />
          <VulnList vulns={scanData.vulns} />
        </div>
      }/>
      <Route path="graph" element={
        <div className="dash-tab">
          <TabHeader label="Attack Graph" title="Live Attack DAG"
            sub="A directed acyclic graph that grows in real time as the crawler discovers endpoints and the attacker tests them" />
          <LiveDAG
            logs={logs}
            vulns={scanData.vulns}
            targetUrl={targetUrl}
            isLive={status.isScanning}
          />
        </div>
      }/>
      <Route path="logs" element={
        <div className="dash-tab">
          <TabHeader label="Agent Activity" title="Claude-Style Agent Feed"
            sub="Each of VEGA's five AI agents reports its reasoning, tool calls, and findings in real time" />
          <AgentFeed logs={logs} isStreaming={status.isScanning} />
        </div>
      }/>
      <Route path="report" element={
        <div className="dash-tab">
          <TabHeader label="Reporting" title="Executive Report"
            sub="AI-narrated vulnerability report — download as PDF or print" />
          <ReportViewer
            markdown={scanData.report}
            vulns={scanData.vulns}
            endpoints={scanData.endpoints}
          />
        </div>
      }/>
    </Routes>
  );

  return (
    <DashboardLayout status={status} scanData={scanData}>
      {content}
    </DashboardLayout>
  );
}
