import ReactMarkdown from 'react-markdown';
import { Download, FileText } from 'lucide-react';
import './ReportViewer.css';

export default function ReportViewer({ markdown }) {
  const handlePrint = () => {
    window.print();
  };

  if (!markdown) {
    return (
      <div className="reportv__empty">
        <FileText size={48} strokeWidth={1} className="reportv__empty-icon" />
        <p>No report generated.</p>
        <span>The report is compiled automatically when the scan is complete.</span>
      </div>
    );
  }

  return (
    <div className="reportv">
      <div className="reportv__header no-print">
        <h3 className="reportv__title">Executive Report</h3>
        <button className="reportv__print" onClick={handlePrint}>
          <Download size={16} />
          Export PDF
        </button>
      </div>

      <div className="reportv__content">
        <div className="reportv__document markdown-body">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
