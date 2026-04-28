import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
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
              <div
                className="dash-bar-fill"
                style={{ width: `${pct}%`, background: STAGE_COLORS[stage] }}
              />
            </div>
            <span className="dash-bar-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/applications/stats'),
      api.get('/applications'),
    ])
      .then(([s, apps]) => {
        setStats(s);
        setRecent(apps.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dash-page">
      <header className="dash-header">
        <div className="dash-header-left">
          <h1>On-Track</h1>
          <nav className="dash-nav">
            <Link to="/dashboard" className="dash-nav-link dash-nav-active">Dashboard</Link>
            <Link to="/applications" className="dash-nav-link">Applications</Link>
          </nav>
        </div>
        <div className="dash-header-right">
          <span className="dash-user-email">{user?.email}</span>
          <button onClick={signOut} className="dash-btn-signout">Sign out</button>
        </div>
      </header>

      <main className="dash-main">
        {loading && <p className="dash-status">Loading…</p>}
        {error && <p className="dash-status dash-error">{error}</p>}

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
          </>
        )}

        {!loading && !error && stats?.total === 0 && (
          <div className="dash-onboarding">
            <p>You haven't tracked any applications yet.</p>
            <Link to="/applications/new" className="dash-btn-add">+ Add your first application</Link>
          </div>
        )}
      </main>
    </div>
  );
}
