import { useState } from 'react';
import { Search } from 'lucide-react';
import './EndpointTable.css';

export default function EndpointTable({ endpoints }) {
  const [filter, setFilter] = useState('');

  const filtered = endpoints.filter((e) =>
    e.url.toLowerCase().includes(filter.toLowerCase()) ||
    e.method.toLowerCase().includes(filter.toLowerCase())
  );

  if (!endpoints.length) {
    return (
      <div className="eptable__empty">
        <p>No endpoints discovered yet.</p>
        <span>The crawler is still navigating the target application.</span>
      </div>
    );
  }

  return (
    <div className="eptable">
      <div className="eptable__header">
        <h3 className="eptable__title">Discovered Endpoints</h3>
        <div className="eptable__search">
          <Search size={14} className="eptable__search-icon" />
          <input
            type="text"
            placeholder="Filter URLs or methods..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="eptable__container">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>URL Path</th>
              <th>Parameters</th>
              <th>Roles Allowed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ep, i) => (
              <tr key={ep.id || i}>
                <td>
                  <span className={`eptable__method eptable__method--${ep.method.toLowerCase()}`}>
                    {ep.method}
                  </span>
                </td>
                <td className="eptable__url">{ep.url}</td>
                <td>
                  {ep.params && ep.params.length > 0 ? (
                    <div className="eptable__params">
                      {ep.params.map((p, j) => (
                        <span key={j} className="eptable__param">{p}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="eptable__none">—</span>
                  )}
                </td>
                <td>
                  {ep.roles_allowed && ep.roles_allowed.length > 0 ? (
                    <div className="eptable__roles">
                      {ep.roles_allowed.map((r, j) => (
                        <span key={j} className="eptable__role">{r}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="eptable__none">Unknown</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="eptable__empty-filter">
            <p>No endpoints match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
