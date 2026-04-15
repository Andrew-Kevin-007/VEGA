import { Routes, Route } from 'react-router-dom';
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

function TabHeader({ label, title, sub }) {
  return (
    <div className="dash-tab__header">
      <p className="dash-tab__label">{label}</p>
      <h1 className="dash-tab__title">{title}</h1>
      {sub && <p className="dash-tab__sub">{sub}</p>}
    </div>
  );
}

function OverviewTab({ status, endpoints, vulns }) {
  const top5 = vulns.slice(0, 5);
  return (
    <div className="dash-tab">
      <TabHeader label="Overview" title="Scan Summary" />
      <StatsOverview endpoints={endpoints} vulns={vulns} progress={status.progress} />

      {status.isScanning && (
        <div className="dash-tab__progress-box">
          <p className="dash-tab__progress-label">
            {status.current_action || 'Scanning in progress…'}
          </p>
          <ScanProgress
            phase={status.phase}
            progress={status.progress}
            currentAction={status.current_action}
          />
        </div>
      )}

      <div className="dash-overview__grid">
        <div>
          <h2 className="dash-tab__section-title">Latest Findings</h2>
          {top5.length === 0 ? (
            <div className="dash-tab__empty">No vulnerabilities confirmed yet.</div>
          ) : (
            top5.map(v => <VulnCard key={v.id} vuln={v} />)
          )}
        </div>
        <div>
          <h2 className="dash-tab__section-title">Severity Distribution</h2>
          <SeverityChart vulns={vulns} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const status = useScanStatus(true);
  const { logs, clear } = useLogStream(status.isScanning);
  const scanData = useScanData(status.phase);

  const content = (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <OverviewTab
            status={status}
            endpoints={scanData.endpoints}
            vulns={scanData.vulns}
          />
        }
      />
      <Route
        path="/dashboard/endpoints"
        element={
          <div className="dash-tab">
            <TabHeader
              label="Discovery"
              title="Discovered Endpoints"
              sub={`${scanData.endpoints.length} endpoints mapped`}
            />
            <EndpointTable endpoints={scanData.endpoints} />
          </div>
        }
      />
      <Route
        path="/dashboard/vulns"
        element={
          <div className="dash-tab">
            <TabHeader
              label="Security"
              title="Vulnerabilities"
              sub={`${scanData.vulns.length} confirmed findings`}
            />
            <VulnList vulns={scanData.vulns} />
          </div>
        }
      />
      <Route
        path="/dashboard/graph"
        element={
          <div className="dash-tab">
            <TabHeader
              label="Attack Graph"
              title="Exploitation Map"
              sub="Force-directed visualization of attack chains"
            />
            <AttackGraph graphData={scanData.graph} />
          </div>
        }
      />
      <Route
        path="/dashboard/logs"
        element={
          <div className="dash-tab">
            <TabHeader
              label="Events"
              title="Live Event Stream"
              sub="Real-time logs from the scanning engine"
            />
            <LogTerminal
              logs={logs}
              isStreaming={status.isScanning}
              onClear={clear}
            />
          </div>
        }
      />
      <Route
        path="/dashboard/report"
        element={
          <div className="dash-tab">
            <TabHeader
              label="Reporting"
              title="Executive Report"
              sub="AI-generated vulnerability narrative"
            />
            <ReportViewer markdown={scanData.report} />
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
