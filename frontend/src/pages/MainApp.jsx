import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { StageCell } from '../components/StageCell';
import { DonutChart } from '../components/charts/DonutChart';
import { WeeklyChart } from '../components/charts/WeeklyChart';
import { fmtDate, fmtMonth } from '../utils/format';
import '../components/Sidebar.css';
import './MainApp.css';

const FILTER_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'offers',    label: 'Offers' },
  { key: 'interview', label: 'Interview' },
  { key: 'rejected',  label: 'Rejected' },
];

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
