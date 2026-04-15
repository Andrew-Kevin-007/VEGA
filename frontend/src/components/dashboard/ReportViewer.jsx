import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, FileText, Loader, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ReportViewer.css';

function generatePDF(contentRef, setExporting) {
  setExporting(true);
  const el = contentRef.current;
  if (!el) { setExporting(false); return; }

  html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW  = pdf.internal.pageSize.getWidth();
    const pageH  = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const printW = pageW - margin * 2;
    const imgH   = (canvas.height * printW) / canvas.width;

    let yOffset = 0;
    let page = 0;

    while (yOffset < imgH) {
      if (page > 0) pdf.addPage();
      pdf.addImage(
        imgData, 'PNG',
        margin, margin - yOffset,
        printW, imgH
      );
      yOffset += pageH - margin * 2;
      page++;
    }

    const date = new Date().toISOString().slice(0, 10);
    pdf.save(`vega-report-${date}.pdf`);
    setExporting(false);
  }).catch(() => setExporting(false));
}

export default function ReportViewer({ markdown, vulns = [], endpoints = [] }) {
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef(null);

  const critical = vulns.filter(v => (v.severity||'').toLowerCase() === 'critical').length;
  const high     = vulns.filter(v => (v.severity||'').toLowerCase() === 'high').length;
  const medium   = vulns.filter(v => (v.severity||'').toLowerCase() === 'medium').length;
  const low      = vulns.filter(v => (v.severity||'').toLowerCase() === 'low').length;

  const overallRisk = critical > 0 ? 'Critical' : high > 0 ? 'High' : medium > 0 ? 'Medium' : low > 0 ? 'Low' : 'Unknown';
  const riskColor = { Critical: 'var(--critical)', High: 'var(--high)', Medium: 'var(--medium)', Low: 'var(--low)', Unknown: 'var(--text-tertiary)' }[overallRisk];

  if (!markdown) {
    return (
      <div className="reportv__empty">
        <FileText size={48} strokeWidth={1} className="reportv__empty-icon" />
        <p>Report not yet generated.</p>
        <span>The narration agent compiles the report automatically once the scan completes.</span>
      </div>
    );
  }

  return (
    <div className="reportv">
      {/* ── Toolbar ── */}
      <div className="reportv__toolbar no-print">
        <div className="reportv__toolbar-left">
          <h3 className="reportv__toolbar-title">Executive Security Report</h3>
          <div className="reportv__badges">
            <span className="reportv__badge" style={{ color: riskColor, borderColor: `${riskColor}40`, background: `${riskColor}0d` }}>
              <Shield size={12} />
              Overall Risk: {overallRisk}
            </span>
            <span className="reportv__badge">
              {vulns.length} findings · {endpoints.length} endpoints
            </span>
          </div>
        </div>
        <div className="reportv__toolbar-right">
          <button className="reportv__btn-print" onClick={() => window.print()}>
            Print
          </button>
          <button
            className="reportv__btn-export"
            onClick={() => generatePDF(contentRef, setExporting)}
            disabled={exporting}
          >
            {exporting ? <Loader size={15} className="spin" /> : <Download size={15} />}
            {exporting ? 'Generating PDF…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="reportv__summary no-print">
        <div className="reportv__sum-card">
          <AlertTriangle size={16} style={{ color: 'var(--critical)' }} />
          <div>
            <span className="reportv__sum-num" style={{ color: 'var(--critical)' }}>{critical}</span>
            <span className="reportv__sum-label">Critical</span>
          </div>
        </div>
        <div className="reportv__sum-card">
          <AlertTriangle size={16} style={{ color: 'var(--high)' }} />
          <div>
            <span className="reportv__sum-num" style={{ color: 'var(--high)' }}>{high}</span>
            <span className="reportv__sum-label">High</span>
          </div>
        </div>
        <div className="reportv__sum-card">
          <AlertTriangle size={16} style={{ color: 'var(--medium)' }} />
          <div>
            <span className="reportv__sum-num" style={{ color: 'var(--medium)' }}>{medium}</span>
            <span className="reportv__sum-label">Medium</span>
          </div>
        </div>
        <div className="reportv__sum-card">
          <CheckCircle size={16} style={{ color: 'var(--low)' }} />
          <div>
            <span className="reportv__sum-num" style={{ color: 'var(--low)' }}>{low}</span>
            <span className="reportv__sum-label">Low</span>
          </div>
        </div>
        <div className="reportv__sum-card">
          <FileText size={16} style={{ color: 'var(--info)' }} />
          <div>
            <span className="reportv__sum-num" style={{ color: 'var(--info)' }}>{endpoints.length}</span>
            <span className="reportv__sum-label">Endpoints</span>
          </div>
        </div>
      </div>

      {/* ── THE PRINTABLE DOCUMENT ── */}
      <div className="reportv__scroll-area">
        <div className="reportv__document" ref={contentRef}>
          {/* Cover area */}
          <div className="reportv__cover">
            <div className="reportv__cover-brand">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <path d="M20 2L4 14v12l16 12 16-12V14L20 2z" stroke="#191a1a" strokeWidth="2.2"/>
                <circle cx="20" cy="20" r="3.5" fill="#d97757"/>
              </svg>
              <span>VEGA Security Report</span>
            </div>
            <p className="reportv__cover-date">
              Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="reportv__cover-risk" style={{ borderColor: riskColor, color: riskColor }}>
              Overall Risk Level: {overallRisk}
            </div>
            <div className="reportv__cover-stats">
              <div className="reportv__cover-stat">
                <span style={{ color: 'var(--critical)' }}>{critical}</span>Critical
              </div>
              <div className="reportv__cover-stat">
                <span style={{ color: 'var(--high)' }}>{high}</span>High
              </div>
              <div className="reportv__cover-stat">
                <span style={{ color: 'var(--medium)' }}>{medium}</span>Medium
              </div>
              <div className="reportv__cover-stat">
                <span style={{ color: 'var(--low)' }}>{low}</span>Low
              </div>
              <div className="reportv__cover-stat">
                <span style={{ color: 'var(--info)' }}>{endpoints.length}</span>Endpoints
              </div>
            </div>
          </div>

          <div className="reportv__body markdown-body">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
