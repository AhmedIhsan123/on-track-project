import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import './Applications.css';

const STAGE_LABELS = {
  applied: 'Applied',
  screen: 'Phone Screen',
  interview: 'Interview',
  final: 'Final Round',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const STAGE_COLORS = {
  applied: 'stage-applied',
  screen: 'stage-screen',
  interview: 'stage-interview',
  final: 'stage-final',
  offer: 'stage-offer',
  rejected: 'stage-rejected',
  withdrawn: 'stage-withdrawn',
};

const COLUMNS = [
  { key: 'company_name', label: 'Company' },
  { key: 'job_title', label: 'Job title' },
  { key: 'stage', label: 'Stage' },
  { key: 'location', label: 'Location' },
  { key: 'date_applied', label: 'Date applied' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Applications() {
  const { signOut } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('date_applied');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    api.get('/applications')
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSort(key) {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sorted = [...applications].sort((a, b) => {
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  return (
    <div className="apps-page">
      <header className="apps-header">
        <h1>On-Track</h1>
        <div className="apps-header-actions">
          <Link to="/applications/new" className="apps-btn-add">+ Add application</Link>
          <button onClick={signOut} className="apps-btn-signout">Sign out</button>
        </div>
      </header>

      <main className="apps-main">
        {loading && <p className="apps-status">Loading…</p>}
        {error && <p className="apps-status apps-error">{error}</p>}

        {!loading && !error && applications.length === 0 && (
          <div className="apps-empty">
            <p>No applications yet.</p>
            <Link to="/applications/new" className="apps-btn-add">+ Add your first application</Link>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="apps-table-wrap">
            <table className="apps-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`apps-th ${sortKey === col.key ? 'apps-th-active' : ''}`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <span className="apps-sort-icon">
                        {sortKey === col.key ? (sortAsc ? ' ↑' : ' ↓') : ' ↕'}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((app) => (
                  <tr key={app.id} className="apps-row">
                    <td className="apps-td apps-td-company">{app.company_name}</td>
                    <td className="apps-td">{app.job_title}</td>
                    <td className="apps-td">
                      <span className={`stage-badge ${STAGE_COLORS[app.stage]}`}>
                        {STAGE_LABELS[app.stage] ?? app.stage}
                      </span>
                    </td>
                    <td className="apps-td apps-td-muted">{app.location || '—'}</td>
                    <td className="apps-td apps-td-muted">{formatDate(app.date_applied)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="apps-count">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </main>
    </div>
  );
}
