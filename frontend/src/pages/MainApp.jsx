import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import '../components/Sidebar.css';
import './MainApp.css';

const STAGES = ['applied', 'screen', 'interview', 'final', 'offer', 'rejected', 'withdrawn'];
const STAGE_LABELS = {
  applied: 'Applied', screen: 'Phone Screen', interview: 'Interview',
  final: 'Final Round', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn',
};
const STAGE_PILL = {
  applied: 'stage-applied', screen: 'stage-screen', interview: 'stage-interview',
  final: 'stage-final', offer: 'stage-offer', rejected: 'stage-rejected', withdrawn: 'stage-withdrawn',
};
const STAGE_HEX = {
  applied: '#3b82f6', screen: '#8b5cf6', interview: '#f59e0b',
  final: '#fb923c',   offer: '#22c55e',  rejected: '#ef4444', withdrawn: '#6b7280',
};

const FILTER_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'offers',    label: 'Offers' },
  { key: 'interview', label: 'Interview' },
  { key: 'rejected',  label: 'Rejected' },
];

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtMonth(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/* ─── Donut chart (conic-gradient) ─── */
function DonutChart({ apps }) {
  const counts = {};
  STAGES.forEach((s) => (counts[s] = 0));
  apps.forEach((a) => {
    counts[a.stage] = (counts[a.stage] || 0) + 1;
  });
  const total = apps.length;

  let accum = 0;
  const segs = STAGES
    .map((s) => {
      const cnt = counts[s] || 0;
      const pct = total ? (cnt / total) * 100 : 0;
      const start = accum;
      accum += pct;
      return { s, cnt, pct, start };
    })
    .filter((x) => x.cnt > 0);

  const grad = segs
    .map((x) => `${STAGE_HEX[x.s]} ${x.start.toFixed(2)}% ${(x.start + x.pct).toFixed(2)}%`)
    .join(', ');

  return (
    <div className="donut-wrap">
      <div className="donut-ring">
        <div
          className="donut-ring-fill"
          style={{ background: total ? `conic-gradient(${grad})` : 'var(--b1)' }}
        />
        <div className="donut-hole">
          <span className="donut-hole-val">{total}</span>
          <span className="donut-hole-lbl">Total</span>
        </div>
      </div>
      <div className="donut-legend">
        {segs.length === 0 ? (
          <span className="donut-empty">No data yet.</span>
        ) : (
          segs.map((x) => (
            <div key={x.s} className="donut-legend-row">
              <span className="donut-legend-dot" style={{ background: STAGE_HEX[x.s] }} />
              <span className="donut-legend-txt">
                {x.cnt} {STAGE_LABELS[x.s]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Weekly bar chart ─── */
function WeeklyChart({ apps }) {
  // Group apps by ISO week (Monday-start) of date_applied for the last 6 weeks
  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  const today = new Date();
  const todayMonday = getMonday(today);
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const monday = new Date(todayMonday);
    monday.setDate(todayMonday.getDate() - i * 7);
    buckets.push({
      key: monday.toISOString().slice(0, 10),
      label: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }

  apps.forEach((a) => {
    if (!a.date_applied) return;
    const monday = getMonday(new Date(a.date_applied));
    const key = monday.toISOString().slice(0, 10);
    const b = buckets.find((bb) => bb.key === key);
    if (b) b.count += 1;
  });

  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="weekly-bars">
      {buckets.map((b) => (
        <div key={b.key} className="bar-col" title={`${b.count} application${b.count !== 1 ? 's' : ''}`}>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(b.count / max) * 100}%` }}
            />
          </div>
          <span className="bar-lbl">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Skeletons ─── */
function StatsSkeleton() {
  return (
    <div className="stats-row">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="stat-card">
          <span className="skeleton" style={{ height: 11, width: 60, marginBottom: 12 }} />
          <span className="skeleton" style={{ height: 32, width: 50, marginBottom: 6 }} />
          <span className="skeleton" style={{ height: 11, width: 80 }} />
        </div>
      ))}
    </div>
  );
}
function ChartsSkeleton() {
  return (
    <div className="charts-row">
      <div className="chart-card">
        <span className="skeleton" style={{ height: 11, width: 70, marginBottom: 16 }} />
        <span className="skeleton" style={{ height: 96, width: 96, borderRadius: '50%' }} />
      </div>
      <div className="chart-card">
        <span className="skeleton" style={{ height: 11, width: 130, marginBottom: 16 }} />
        <span className="skeleton" style={{ height: 80, width: '100%' }} />
      </div>
    </div>
  );
}
function TableSkeleton() {
  return (
    <div className="apps-section">
      <div className="apps-header">
        <span className="apps-heading">Applications</span>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Company</th><th>Role</th><th>Stage</th>
              <th>Applied</th><th>Location</th><th>Salary</th><th />
            </tr>
          </thead>
          <tbody>
            {[80, 65, 75, 55, 70].map((w, i) => (
              <tr key={i}>
                <td><span className="skeleton" style={{ height: 14, width: `${w}%` }} /></td>
                <td><span className="skeleton" style={{ height: 14, width: `${w - 10}%` }} /></td>
                <td><span className="skeleton" style={{ height: 18, width: 70, borderRadius: 3 }} /></td>
                <td><span className="skeleton" style={{ height: 12, width: '60%' }} /></td>
                <td><span className="skeleton" style={{ height: 12, width: '50%' }} /></td>
                <td><span className="skeleton" style={{ height: 12, width: '70%' }} /></td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Stage cell with inline edit ─── */
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
        className="stage-inline-select"
        value={app.stage}
        onChange={handleChange}
        disabled={saving}
        autoFocus
        onBlur={() => setEditing(false)}
        onClick={(e) => e.stopPropagation()}
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>{STAGE_LABELS[s]}</option>
        ))}
      </select>
    );
  }

  return (
    <span
      className={`stage-badge ${STAGE_PILL[app.stage]}`}
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      title="Click to change stage"
    >
      {STAGE_LABELS[app.stage] ?? app.stage}
    </span>
  );
}

export default function MainApp() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

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
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    api.get('/applications/stats').then(setStats).catch(() => {});
  }

  const filtered = applications.filter((a) => {
    if (filter === 'active')    return ['applied', 'screen', 'interview', 'final'].includes(a.stage);
    if (filter === 'offers')    return a.stage === 'offer';
    if (filter === 'interview') return ['interview', 'final'].includes(a.stage);
    if (filter === 'rejected')  return a.stage === 'rejected';
    return true;
  });

  const total      = stats?.total ?? 0;
  const active     = stats?.active_count ?? 0;
  const offers     = stats?.by_stage?.offer ?? 0;
  const interviews = (stats?.by_stage?.interview ?? 0) + (stats?.by_stage?.final ?? 0);

  // Apps added this week for the "X this week" sub-label
  const thisWeek = (() => {
    if (!applications.length) return 0;
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    return applications.filter((a) => a.date_applied && new Date(a.date_applied) >= monday).length;
  })();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <div className="page-header">
          <div>
            <div className="page-title">Overview</div>
            <div className="page-sub">
              {applications.length > 0
                ? `${fmtMonth(new Date().toISOString())} · ${applications.length} application${applications.length !== 1 ? 's' : ''} tracked`
                : 'Get started by adding your first application'}
            </div>
          </div>
          <Link to="/app/new" className="btn-add-header">+ Add Application</Link>
        </div>

        <div className="content">
          {loading && (
            <>
              <StatsSkeleton />
              <ChartsSkeleton />
              <TableSkeleton />
            </>
          )}

          {!loading && error && (
            <div className="error-box">
              <p className="error-msg">Could not load applications — {error}</p>
              <button className="error-retry" onClick={load}>Try again</button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Stats */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-lbl">Total</div>
                  <div className="stat-val">{total}</div>
                  <div className="stat-sub">{thisWeek} this week</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Active</div>
                  <div className="stat-val">{active}</div>
                  <div className="stat-sub">in progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Offers</div>
                  <div className="stat-val green">{offers}</div>
                  <div className="stat-sub">awaiting decision</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Interviews</div>
                  <div className="stat-val blue">{interviews}</div>
                  <div className="stat-sub">interview / final</div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-row">
                <div className="chart-card">
                  <div className="chart-heading">By Stage</div>
                  <DonutChart apps={applications} />
                </div>
                <div className="chart-card">
                  <div className="chart-heading">Applications / Week</div>
                  <WeeklyChart apps={applications} />
                </div>
              </div>

              {/* Applications */}
              <div className="apps-section">
                <div className="apps-header">
                  <span className="apps-heading">Applications</span>
                  <div className="filter-tabs">
                    {FILTER_TABS.map((t) => (
                      <button
                        key={t.key}
                        className={`ftab${filter === t.key ? ' on' : ''}`}
                        onClick={() => setFilter(t.key)}
                      >
                        {t.label}
                      </button>
                    ))}
                    <span className="ftab-count">{filtered.length}</span>
                  </div>
                </div>

                {applications.length === 0 ? (
                  <div className="empty">
                    <p>No applications yet.</p>
                    <Link to="/app/new" className="btn-primary">+ Add your first application</Link>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="empty">
                    <p>No applications match this filter.</p>
                    <button className="btn-ghost" onClick={() => setFilter('all')}>Clear filter</button>
                  </div>
                ) : (
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Role</th>
                          <th>Stage</th>
                          <th>Applied</th>
                          <th>Location</th>
                          <th>Salary</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((app) => (
                          <tr key={app.id} onClick={() => navigate(`/app/${app.id}`)}>
                            <td className="td-co">{app.company_name}</td>
                            <td className="td-role">{app.job_title}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <StageCell app={app} onUpdate={handleStageUpdate} />
                            </td>
                            <td className="td-mono">{fmtDate(app.date_applied)}</td>
                            <td className="td-mono">{app.location || '—'}</td>
                            <td className="td-mono">{app.salary_range || '—'}</td>
                            <td className="td-arr">→</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
