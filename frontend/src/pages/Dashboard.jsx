import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import './Dashboard.css';

const STAGE_LABELS = {
  applied: 'Applied', screen: 'Phone Screen', interview: 'Interview',
  final: 'Final Round', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn',
};
const STAGE_COLORS = {
  applied: '#2563eb', screen: '#7c3aed', interview: '#d97706',
  final: '#db2777', offer: '#16a34a', rejected: '#dc2626', withdrawn: '#9ca3af',
};
const STAGES = ['applied', 'screen', 'interview', 'final', 'offer', 'rejected', 'withdrawn'];
const SKELETON_WIDTHS = [60, 40, 75, 30, 20, 45, 15];

function StatCard({ label, value, sub }) {
  return (
    <div className="dash-stat-card">
      <span className="dash-stat-value">{value}</span>
      <span className="dash-stat-label">{label}</span>
      {sub && <span className="dash-stat-sub">{sub}</span>}
    </div>
  );
}

function StageBar({ by_stage, total }) {
  if (!total) return <p className="dash-empty">No data yet.</p>;
  const max = Math.max(...Object.values(by_stage));
  return (
    <div className="dash-bar-chart">
      {STAGES.map((stage) => {
        const count = by_stage[stage] || 0;
        const pct = max ? Math.round((count / max) * 100) : 0;
        return (
          <div key={stage} className="dash-bar-row">
            <span className="dash-bar-label">{STAGE_LABELS[stage]}</span>
            <div className="dash-bar-track">
              <div className="dash-bar-fill" style={{ width: `${pct}%`, background: STAGE_COLORS[stage] }} />
            </div>
            <span className="dash-bar-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <section className="dash-section">
        <div className="dash-stat-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="dash-stat-card">
              <span className="skeleton" style={{ height: 36, width: 64, marginBottom: 6 }} />
              <span className="skeleton" style={{ height: 14, width: 120 }} />
            </div>
          ))}
        </div>
      </section>
      <div className="dash-two-col">
        <section className="dash-section">
          <h2 className="dash-section-title">Applications by stage</h2>
          <div className="dash-bar-chart">
            {STAGES.map((s, i) => (
              <div key={s} className="dash-bar-row">
                <span className="skeleton" style={{ height: 12, width: 80 }} />
                <div className="dash-bar-track">
                  <span className="skeleton" style={{ width: `${SKELETON_WIDTHS[i]}%`, height: '100%', borderRadius: 99 }} />
                </div>
                <span className="skeleton" style={{ height: 12, width: 16 }} />
              </div>
            ))}
          </div>
        </section>
        <section className="dash-section">
          <h2 className="dash-section-title">Recent activity</h2>
          <ul className="dash-recent-list">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="dash-recent-item">
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="skeleton" style={{ height: 14, width: '65%' }} />
                  <span className="skeleton" style={{ height: 11, width: '40%' }} />
                </div>
                <span className="skeleton" style={{ height: 22, width: 64, borderRadius: 99 }} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, apps] = await Promise.all([
        api.get('/applications/stats'),
        api.get('/applications'),
      ]);
      setStats(s);
      setRecent(apps.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="dash-page">
      <AppHeader active="dashboard" />

      <main className="dash-main">
        {loading && <DashboardSkeleton />}

        {!loading && error && (
          <div className="dash-error-box">
            <p className="dash-error-msg">Could not load dashboard — {error}</p>
            <button className="dash-retry-btn" onClick={load}>Try again</button>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            <section className="dash-section">
              <div className="dash-stat-grid">
                <StatCard label="Total applications" value={stats.total} />
                <StatCard label="Active" value={stats.active_count} sub="in progress" />
                <StatCard label="Response rate" value={`${stats.response_rate}%`} sub="got a reply" />
                <StatCard label="Interview rate" value={`${stats.interview_rate}%`} sub="reached interview" />
              </div>
            </section>

            <div className="dash-two-col">
              <section className="dash-section">
                <h2 className="dash-section-title">Applications by stage</h2>
                <StageBar by_stage={stats.by_stage} total={stats.total} />
              </section>

              <section className="dash-section">
                <h2 className="dash-section-title">Recent activity</h2>
                {recent.length === 0 ? (
                  <p className="dash-empty">No applications yet. <Link to="/applications/new">Add one →</Link></p>
                ) : (
                  <ul className="dash-recent-list">
                    {recent.map((app) => (
                      <li key={app.id} className="dash-recent-item">
                        <Link to={`/applications/${app.id}`} className="dash-recent-link">
                          <span className="dash-recent-title">{app.job_title}</span>
                          <span className="dash-recent-company">{app.company_name}</span>
                        </Link>
                        <span
                          className="dash-recent-stage"
                          style={{ background: `${STAGE_COLORS[app.stage]}22`, color: STAGE_COLORS[app.stage] }}
                        >
                          {STAGE_LABELS[app.stage]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/applications" className="dash-view-all">View all →</Link>
              </section>
            </div>

            {stats.total === 0 && (
              <div className="dash-onboarding">
                <p>You haven't tracked any applications yet.</p>
                <Link to="/applications/new" className="dash-btn-add">+ Add your first application</Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
