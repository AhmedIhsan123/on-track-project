import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import './Applications.css';

const STAGE_LABELS = {
  applied: 'Applied', screen: 'Phone Screen', interview: 'Interview',
  final: 'Final Round', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn',
};

const STAGE_COLORS = {
  applied: 'stage-applied', screen: 'stage-screen', interview: 'stage-interview',
  final: 'stage-final', offer: 'stage-offer', rejected: 'stage-rejected', withdrawn: 'stage-withdrawn',
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

function TableSkeleton() {
  const widths = [80, 65, 75, 55, 70];
  return (
    <div className="apps-table-wrap">
      <table className="apps-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} className="apps-th">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {widths.map((w, i) => (
            <tr key={i} className="apps-row">
              <td className="apps-td"><span className="skeleton" style={{ height: 15, width: `${w}%` }} /></td>
              <td className="apps-td"><span className="skeleton" style={{ height: 15, width: `${w - 10}%` }} /></td>
              <td className="apps-td"><span className="skeleton" style={{ height: 22, width: 80, borderRadius: 99 }} /></td>
              <td className="apps-td"><span className="skeleton" style={{ height: 15, width: '55%' }} /></td>
              <td className="apps-td"><span className="skeleton" style={{ height: 15, width: '60%' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('date_applied');
  const [sortAsc, setSortAsc] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/applications');
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const addBtn = (
    <Link to="/applications/new" className="app-header-btn-add">+ Add application</Link>
  );

  return (
    <div className="apps-page">
      <AppHeader active="applications" actions={addBtn} />

      <main className="apps-main">
        {loading && <TableSkeleton />}

        {!loading && error && (
          <div className="apps-error-box">
            <p className="apps-error-msg">Could not load applications — {error}</p>
            <button className="apps-retry-btn" onClick={load}>Try again</button>
          </div>
        )}

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
                  <tr
                    key={app.id}
                    className="apps-row apps-row-clickable"
                    onClick={() => navigate(`/applications/${app.id}`)}
                  >
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
