import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './SeverityChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SeverityChart({ vulns }) {
  const counts = {
    Critical: vulns.filter(v => (v.severity || '').toLowerCase() === 'critical').length,
    High: vulns.filter(v => (v.severity || '').toLowerCase() === 'high').length,
    Medium: vulns.filter(v => (v.severity || '').toLowerCase() === 'medium').length,
    Low: vulns.filter(v => (v.severity || '').toLowerCase() === 'low').length,
    Info: vulns.filter(v => (v.severity || '').toLowerCase() === 'info').length,
  };

  const hasData = Object.values(counts).some(v => v > 0);

  const data = {
    labels: ['Critical', 'High', 'Medium', 'Low', 'Info'],
    datasets: [
      {
        data: [counts.Critical, counts.High, counts.Medium, counts.Low, counts.Info],
        backgroundColor: [
          '#e5484d', // Critical (red)
          '#f76b15', // High (orange)
          '#e5a100', // Medium (yellow)
          '#46a758', // Low (green)
          '#3b82f6', // Info (blue)
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { family: "'Inter', sans-serif", size: 12 },
          color: '#5c5c5c',
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#191a1a',
        titleFont: { family: "'Inter', sans-serif", size: 13 },
        bodyFont: { family: "'Inter', sans-serif", size: 13 },
        padding: 12,
        cornerRadius: 6,
        displayColors: true,
      },
    },
    cutout: '75%',
  };

  return (
    <div className="sevchart">
      <h3 className="sevchart__title">Vulnerabilities by Severity</h3>
      <div className="sevchart__container">
        {hasData ? (
          <Doughnut data={data} options={options} />
        ) : (
          <div className="sevchart__empty">
            <div className="sevchart__empty-circle" />
            <p>No vulnerabilities found yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
