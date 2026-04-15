import { useState } from 'react';
import { Plus, Trash2, ArrowRight, Globe, User } from 'lucide-react';
import { vegaApi } from '../../api/vegaApi';
import VulnSelector, { ALL_VULNS } from './VulnSelector';
import './ScanConfig.css';

export default function ScanConfig({ onScanStarted }) {
  const [targetUrl, setTargetUrl]   = useState('');
  const [roles, setRoles]           = useState([{ username: '', password: '', role: 'user' }]);
  const [selectedVulns, setSelectedVulns] = useState(ALL_VULNS.map(v => v.id)); // all by default
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const addRole    = () => setRoles([...roles, { username: '', password: '', role: 'user' }]);
  const removeRole = (i) => { if (roles.length <= 1) return; setRoles(roles.filter((_, idx) => idx !== i)); };
  const updateRole = (i, field, value) => {
    const updated = [...roles];
    updated[i] = { ...updated[i], [field]: value };
    setRoles(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!targetUrl.trim()) { setError('Please enter a target URL.'); return; }
    try { new URL(targetUrl); } catch { setError('Please enter a valid URL (e.g. http://localhost:3000).'); return; }
    const validRoles = roles.filter(r => r.username && r.password);
    if (validRoles.length === 0) { setError('Add at least one credential with username and password.'); return; }

    setLoading(true);
    try {
      const res = await vegaApi.startScan(targetUrl, validRoles, selectedVulns);
      if (onScanStarted) onScanStarted(res.scan_id);
    } catch {
      setError('Failed to start scan. Is the backend running on localhost:8000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="scanconfig" onSubmit={handleSubmit}>

      {/* Target URL */}
      <div className="scanconfig__section">
        <label className="scanconfig__label">
          <Globe size={14} strokeWidth={2} />
          Target URL
        </label>
        <input
          type="text"
          className="scanconfig__input scanconfig__input--mono"
          placeholder="http://localhost:3000"
          value={targetUrl}
          onChange={e => setTargetUrl(e.target.value)}
          autoFocus
        />
      </div>

      {/* Credentials */}
      <div className="scanconfig__section">
        <label className="scanconfig__label">
          <User size={14} strokeWidth={2} />
          Role Credentials
        </label>
        <div className="scanconfig__roles">
          {roles.map((role, i) => (
            <div key={i} className="scanconfig__role-row">
              <div className="scanconfig__role-field">
                <span className="scanconfig__field-label">Username</span>
                <input type="text" className="scanconfig__input" placeholder="admin@example.com" value={role.username} onChange={e => updateRole(i, 'username', e.target.value)} />
              </div>
              <div className="scanconfig__role-field">
                <span className="scanconfig__field-label">Password</span>
                <input type="password" className="scanconfig__input" placeholder="••••••••" value={role.password} onChange={e => updateRole(i, 'password', e.target.value)} />
              </div>
              <div className="scanconfig__role-field scanconfig__role-field--sm">
                <span className="scanconfig__field-label">Role</span>
                <select className="scanconfig__input scanconfig__select" value={role.role} onChange={e => updateRole(i, 'role', e.target.value)}>
                  <option value="admin">admin</option>
                  <option value="user">user</option>
                  <option value="guest">guest</option>
                </select>
              </div>
              {roles.length > 1 && (
                <button type="button" className="scanconfig__remove" onClick={() => removeRole(i)} aria-label="Remove role">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="scanconfig__add" onClick={addRole}>
          <Plus size={14} /> Add another role
        </button>
      </div>

      {/* Vulnerability selector */}
      <VulnSelector selected={selectedVulns} onChange={setSelectedVulns} />

      {error && <p className="scanconfig__error">{error}</p>}

      <button type="submit" className="scanconfig__submit" disabled={loading}>
        {loading ? <span className="scanconfig__spinner" /> : <><span>Launch scan</span><ArrowRight size={16} strokeWidth={2} /></>}
      </button>

    </form>
  );
}
