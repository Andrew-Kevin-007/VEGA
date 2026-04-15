import { Routes, Route, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScanStatus } from '../hooks/useScanStatus';
import { useLogStream } from '../hooks/useLogStream';
import { useScanData } from '../hooks/useScanData';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsOverview from '../components/dashboard/StatsOverview';
import EndpointTable from '../components/dashboard/EndpointTable';
import VulnList from '../components/dashboard/VulnList';
import AttackGraph from '../components/dashboard/AttackGraph';
import LogTerminal from '../components/dashboard/LogTerminal';
import ReportViewer from '../components/dashboard/ReportViewer';
import SeverityChart from '../components/dashboard/SeverityChart';
import ScanProgress from '../components/scanner/ScanProgress';
import VulnCard from '../components/dashboard/VulnCard';
import './DashboardPage.css';

/* ── Reusable tab header ───────────────────────────── */
function TabHeader({ label, title, sub }) {
  return (
    <div className="dash-tab__header">
      <p className="dash-tab__label">{label}</p>
      <h1 className="dash-tab__title">{title}</h1>
      {sub && <p className="dash-tab__sub">{sub}</p>}
    </div>
  );
}

/* ── Overview tab ──────────────────────────────────── */
function OverviewTab({ status, endpoints, vulns }) {
  const isIdle = status.phase === 'idle';
  const topCritical = vulns.filter(v => (v.severity||'').toLowerCase() === 'critical').slice(0, 3);
  const topHigh = vulns.filter(v => (v.severity||'').toLowerCase() === 'high').slice(0, 2);
  const topFindings = [...topCritical, ...topHigh].slice(0, 4);

  return (
    <div className="dash-tab">
      {/* ── Header ── */}
      <div className="dash-tab__header">
        <p className="dash-tab__label">Overview</p>
        <div className="dash-overview-head">
          <div>
            <h1 className="dash-tab__title">Scan Summary</h1>
            {status.phase && status.phase !== 'idle' && (
              <p className="dash-tab__sub">
                {status.isScanning
                  ? `Scanning in progress — ${status.current_action || 'Initializing…'}`
                  : status.isDone
                  ? 'Scan complete. All findings confirmed and scored.'
                  : status.isError ? 'Scan encountered an error.' : ''}
              </p>
            )}
          </div>
          {status.isDone && (
            <Link to="/dashboard/report" className="dash-overview-report-btn">
              Download Report <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <StatsOverview
        endpoints={endpoints}
        vulns={vulns}
        progress={status.progress}
        phase={status.phase}
      />

      {/* ── Active scan progress ── */}
      {status.isScanning && (
        <div className="dash-tab__progress-box">
          <ScanProgress
            phase={status.phase}
            progress={status.progress}
            currentAction={status.current_action}
          />
        </div>
      )}

      {/* ── Idle prompt ── */}
      {isIdle && endpoints.length === 0 && vulns.length === 0 && (
        <div className="dash-idle">
          <div className="dash-idle__inner">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="dash-idle__logo">
              <path d="M20 2L4 14v12l16 12 16-12V14L20 2z" stroke="var(--border)" strokeWidth="2"/>
              <path d="M20 8l-10 7v8l10 7 10-7v-8L20 8z" stroke="var(--accent)" strokeWidth="1.5"/>
              <circle cx="20" cy="20" r="3" fill="var(--accent)"/>
            </svg>
            <h2 className="dash-idle__title">No scan running</h2>
            <p className="dash-idle__desc">
              Configure a target URL and role credentials to begin scanning.
              Results populate in real-time as the agents work.
            </p>
            <Link to="/scan" className="dash-idle__cta">
              Configure a scan <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Two-column: findings + chart ── */}
      {vulns.length > 0 && (
        <div className="dash-overview__grid">
          <div className="dash-overview__findings">
            <div className="dash-overview__section-head">
              <h2 className="dash-tab__section-title">Priority Findings</h2>
              {vulns.length > 4 && (
                <Link to="/dashboard/vulns" className="dash-overview__see-all">
                  See all {vulns.length} <ArrowRight size={13} />
                </Link>
              )}
            </div>
            {topFindings.length === 0 ? (
              <div className="dash-tab__empty">No high-priority findings yet.</div>
            ) : (
              topFindings.map(v => <VulnCard key={v.id} vuln={v} />)
            )}
          </div>

          <div className="dash-overview__sidebar">
            <h2 className="dash-tab__section-title" style={{ marginBottom: '16px' }}>
              Severity Distribution
            </h2>
            <SeverityChart vulns={vulns} />

            {endpoints.length > 0 && (
              <div className="dash-overview__ep-summary">
                <div className="dash-overview__ep-head">
                  <h2 className="dash-tab__section-title">Attack Surface</h2>
                  <Link to="/dashboard/endpoints" className="dash-overview__see-all">
                    View all <ArrowRight size={13} />
                  </Link>
                </div>
                <div className="dash-overview__ep-stats">
                  {['GET','POST','PUT','DELETE'].map(method => {
                    const count = endpoints.filter(e => e.method === method).length;
                    if (count === 0) return null;
                    return (
                      <div key={method} className="dash-overview__ep-stat">
                        <span className={`dash-overview__ep-method dash-overview__ep-method--${method.toLowerCase()}`}>
                          {method}
                        </span>
                        <span className="dash-overview__ep-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

  const content = (
    <Routes>
      <Route
        path="/dashboard"
        element={<OverviewTab status={status} endpoints={scanData.endpoints} vulns={scanData.vulns} />}
      />
      <Route
        path="/dashboard/endpoints"
        element={
          <div className="dash-tab">
            <TabHeader label="Discovery" title="Discovered Endpoints" sub={`${scanData.endpoints.length} endpoints mapped by the Playwright crawler`} />
            <EndpointTable endpoints={scanData.endpoints} />
          </div>
        }
      />
      <Route
        path="/dashboard/vulns"
        element={
          <div className="dash-tab">
            <TabHeader label="Security Analysis" title="Confirmed Vulnerabilities" sub={`${scanData.vulns.length} findings validated by the analyzer and false-positive reduction agents`} />
            <VulnList vulns={scanData.vulns} />
          </div>
        }
      />
      <Route
        path="/dashboard/graph"
        element={
          <div className="dash-tab">
            <TabHeader label="Attack Graph" title="Exploitation Map" sub="Force-directed graph of vulnerability-to-endpoint relationships and attack chains" />
            <AttackGraph graphData={scanData.graph} />
          </div>
        }
      />
      <Route
        path="/dashboard/logs"
        element={
          <div className="dash-tab">
            <TabHeader label="Event Stream" title="Live Logs" sub="Real-time output from all five AI agents piped via Server-Sent Events" />
            <LogTerminal logs={logs} isStreaming={status.isScanning} onClear={clear} />
          </div>
        }
      />
      <Route
        path="/dashboard/report"
        element={
          <div className="dash-tab">
            <TabHeader label="Reporting" title="Executive Report" sub="AI-narrated vulnerability report — download as PDF or print" />
            <ReportViewer
              markdown={scanData.report}
              vulns={scanData.vulns}
              endpoints={scanData.endpoints}
            />
          </div>
        }
      />
    </Routes>
  );

  return (
    <DashboardLayout status={status} scanData={scanData}>
      {content}
    </DashboardLayout>
  );
}
