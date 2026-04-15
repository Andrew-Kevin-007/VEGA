import Sidebar from './Sidebar';
import './DashboardLayout.css';

export default function DashboardLayout({ status, scanData, children }) {
  const targetUrl = scanData?.endpoints?.[0]?.url?.split('/').slice(0, 3).join('/') || '';

  return (
    <div className="dashlayout">
      <Sidebar
        phase={status.phase}
        progress={status.progress}
        targetUrl={targetUrl}
      />
      <main className="dashlayout__main">
        <div className="dashlayout__content">
          {children}
        </div>
      </main>
    </div>
  );
}
