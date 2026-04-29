import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import './MainApp.css';

const STAGES = ['applied', 'screen', 'interview', 'final', 'offer', 'rejected', 'withdrawn'];
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
  { key: 'stage', label: 'Stage', noSort: true },
  { key: 'location', label: 'Location' },
  { key: 'date_applied', label: 'Date applied' },
];
const SKELETON_WIDTHS = [80, 65, 75, 55, 70];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatCard({ label, value, sub }) {
  return (
    <div className="main-stat-card">
      <span className="main-stat-value">{value}</span>
      <span className="main-stat-label">{label}</span>
      {sub && <span className="main-stat-sub">{sub}</span>}
    </div>
  );
}

function StageCell({ app, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    setSaving(true);
    await onUpdate(app.id, e.target.value);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <select
        className="main-inline-select"
        value={app.stage}
        onChange={handleChange}
        disabled={saving}
        autoFocus
        onBlur={() => setEditing(false)}
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>{STAGE_LABELS[s]}</option>
        ))}
      </select>
    );
  }

  return (
    <span
      className={`stage-badge ${STAGE_COLORS[app.stage]}`}
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      title="Click to change stage"
    >
      {STAGE_LABELS[app.stage] ?? app.stage}
    </span>
  );
}

function StatsSkeleton() {
  return (
    <div className="main-stat-grid">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="main-stat-card">
          <span className="skeleton" style={{ height: 36, width: 64, marginBottom: 6 }} />
          <span className="skeleton" style={{ height: 14, width: 120 }} />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="main-table-wrap">
      <table className="main-table">
        <thead>
          <tr>{COLUMNS.map((col) => <th key={col.key} className="main-th">{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {SKELETON_WIDTHS.map((w, i) => (
            <tr key={i} className="main-row">
              <td className="main-td"><span className="skeleton" style={{ height: 14, width: `${w}%` }} /></td>
              <td className="main-td"><span className="skeleton" style={{ height: 14, width: `${w - 10}%` }} /></td>
              <td className="main-td"><span className="skeleton" style={{ height: 22, width: 80, borderRadius: 99 }} /></td>
              <td className="main-td"><span className="skeleton" style={{ height: 14, width: '55%' }} /></td>
              <td className="main-td"><span className="skeleton" style={{ height: 14, width: '60%' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MainApp() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sortKey, setSortKey] = useState('date_applied');
  const [sortAsc, setSortAsc] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, apps] = await Promise.all([
        api.get('/applications/stats'),
        api.get('/applications'),
      ]);
      setStats(s);
      setApplications(apps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleStageUpdate(id, stage) {
    const updated = await api.patch(`/applications/${id}`, { stage });
    setApplications((prev) => prev.map((a) => a.id === id ? updated : a));
    api.get('/applications/stats').then(setStats).catch(() => {});
  }

  function handleSort(key) {
    if (key === sortKey) setSortAsc((prev) => !prev);
    else { setSortKey(key); setSortAsc(true); }
  }

  const filtered = applications
    .filter((a) => {
      if (stageFilter && a.stage !== stageFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.company_name?.toLowerCase().includes(q) || a.job_title?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const addBtn = <Link to="/app/new" className="app-header-btn-add">+ Add application</Link>;

  return (
    <div className="main-page">
      <AppHeader actions={addBtn} />

      <main className="main-content">
        {loading ? <StatsSkeleton /> : stats && (
          <div className="main-stat-grid">
            <StatCard label="Total applications" value={stats.total} />
            <StatCard label="Active" value={stats.active_count} sub="in pipeline" />
            <StatCard label="Response rate" value={`${stats.response_rate}%`} sub="got a reply" />
            <StatCard label="Interview rate" value={`${stats.interview_rate}%`} sub="reached interview" />
          </div>
        )}

        {!loading && error && (
          <div className="main-error-box">
            <p className="main-error-msg">Could not load applications — {error}</p>
            <button className="main-retry-btn" onClick={load}>Try again</button>
          </div>
        )}

        {!loading && !error && (
          <div className="main-toolbar">
            <div className="main-search-wrap">
              <svg className="main-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="#9ca3af" strokeWidth="1.5" />
                <path d="M14.5 14.5L18 18" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                className="main-search"
                type="text"
                placeholder="Search companies, job titles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="main-search-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>
              )}
            </div>
            <select
              className="main-stage-filter"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="">All stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
              ))}
            </select>
            <span className="main-count">
              {filtered.length !== applications.length
                ? `${filtered.length} of ${applications.length}`
                : applications.length} application{applications.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {loading && <TableSkeleton />}

        {!loading && !error && applications.length === 0 && (
          <div className="main-empty">
            <p>No applications yet.</p>
            <Link to="/app/new" className="main-btn-primary">+ Add your first application</Link>
          </div>
        )}

        {!loading && !error && applications.length > 0 && filtered.length === 0 && (
          <div className="main-empty">
            <p>No applications match your filters.</p>
            <button className="main-btn-ghost" onClick={() => { setSearch(''); setStageFilter(''); }}>
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="main-table-wrap">
            <table className="main-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`main-th${sortKey === col.key ? ' main-th-active' : ''}${col.noSort ? ' main-th-nosort' : ''}`}
                      onClick={!col.noSort ? () => handleSort(col.key) : undefined}
                    >
                      {col.label}
                      {!col.noSort && (
                        <span className="main-sort-icon">
                          {sortKey === col.key ? (sortAsc ? ' ↑' : ' ↓') : ' ↕'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    className="main-row main-row-clickable"
                    onClick={() => navigate(`/app/${app.id}`)}
                  >
                    <td className="main-td main-td-company">{app.company_name}</td>
                    <td className="main-td">{app.job_title}</td>
                    <td className="main-td" onClick={(e) => e.stopPropagation()}>
                      <StageCell app={app} onUpdate={handleStageUpdate} />
                    </td>
                    <td className="main-td main-td-muted">{app.location || '—'}</td>
                    <td className="main-td main-td-muted">{formatDate(app.date_applied)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
