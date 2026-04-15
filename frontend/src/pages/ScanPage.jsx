import { useNavigate } from 'react-router-dom';
import ScanConfig from '../components/scanner/ScanConfig';

export default function ScanPage() {
  const navigate = useNavigate();

  const handleScanStarted = (scanId) => {
    // Navigate to dashboard when scan starts
    navigate('/dashboard');
  };

  return (
    <main style={{ paddingTop: 'calc(var(--nav-height) + var(--space-4xl))', minHeight: '100vh', paddingBottom: 'var(--space-3xl)' }}>
      <div className="container">
        <div style={{ maxWidth: '640px', margin: '0 auto', marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '16px' }}>Configure Scan</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Enter your target application and provide role-based credentials. 
            VEGA will automatically map the application and test for authorization bypasses.
          </p>
        </div>
        
        <ScanConfig onScanStarted={handleScanStarted} />
      </div>
    </main>
  );
}
