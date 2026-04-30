import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import '../components/Sidebar.css';
import './AddApplication.css';

const STAGES = ['applied', 'screen', 'interview', 'final', 'offer', 'rejected', 'withdrawn'];
const STAGE_LABELS = {
  applied: 'Applied', screen: 'Phone Screen', interview: 'Interview',
  final: 'Final Round', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn',
};
const REMOTE_TYPES = ['remote', 'hybrid', 'onsite'];

const today = new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  job_title: '',
  company_name: '',
  job_url: '',
  location: '',
  remote_type: '',
  salary_range: '',
  stage: 'applied',
  date_applied: today,
  date_posted: '',
  notes: '',
};

export default function AddApplication() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeNotice, setScrapeNotice] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleScrape(e) {
    e.preventDefault();
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    setScrapeNotice('');
    setError('');
    try {
      const data = await api.post('/scraper', { url: scrapeUrl });
      setForm((prev) => ({
        ...prev,
        job_title: data.job_title || prev.job_title,
        company_name: data.company_name || prev.company_name,
        location: data.location || prev.location,
        remote_type: data.remote_type || prev.remote_type,
        job_url: data.job_url || prev.job_url,
      }));
      setScrapeNotice(
        data.scrape_error
          ? 'Could not extract details from that page — fill in manually.'
          : 'Details filled in — review and save.',
      );
    } catch {
      setScrapeNotice('Scraping failed — fill in manually.');
    } finally {
      setScraping(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/applications', form);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const noticeWarn =
    scrapeNotice.includes('Could not') || scrapeNotice.includes('failed');

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <div className="add-header">
          <Link to="/app" className="add-back">← Overview</Link>
          <h1 className="add-title">Add application</h1>
        </div>

        <div className="add-content">
          {/* URL scraper */}
          <section className="add-section add-scrape">
            <div className="add-section-lbl">Auto-fill from URL</div>
            <p className="add-scrape-hint">
              Paste a job listing URL — we'll extract the details for you.
            </p>
            <form onSubmit={handleScrape} className="add-scrape-row">
              <input
                className="add-scrape-input"
                type="url"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                placeholder="https://boards.greenhouse.io/..."
                disabled={scraping}
              />
              <button
                type="submit"
                className="add-scrape-btn"
                disabled={scraping || !scrapeUrl.trim()}
              >
                {scraping ? 'Fetching…' : 'Fetch details'}
              </button>
            </form>
            {scrapeNotice && (
              <p className={`add-notice ${noticeWarn ? 'warn' : 'ok'}`}>
                {noticeWarn ? '⚠' : '✓'} {scrapeNotice}
              </p>
            )}
          </section>

          <form onSubmit={handleSubmit} className="add-form">
            <section className="add-section">
              <div className="add-section-lbl">Job details</div>
              <div className="add-row">
                <label className="add-label">
                  Job title <span className="add-req">*</span>
                  <input
                    className="add-input"
                    name="job_title"
                    value={form.job_title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Software Engineer"
                  />
                </label>
                <label className="add-label">
                  Company <span className="add-req">*</span>
                  <input
                    className="add-input"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Acme Corp"
                  />
                </label>
              </div>
              <div className="add-row">
                <label className="add-label">
                  Job URL
                  <input
                    className="add-input"
                    name="job_url"
                    type="url"
                    value={form.job_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </label>
                <label className="add-label">
                  Salary range
                  <input
                    className="add-input"
                    name="salary_range"
                    value={form.salary_range}
                    onChange={handleChange}
                    placeholder="e.g. $80k–$100k"
                  />
                </label>
              </div>
              <div className="add-row">
                <label className="add-label">
                  Location
                  <input
                    className="add-input"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. New York, NY"
                  />
                </label>
                <label className="add-label">
                  Work type
                  <select
                    className="add-input"
                    name="remote_type"
                    value={form.remote_type}
                    onChange={handleChange}
                  >
                    <option value="">— select —</option>
                    {REMOTE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="add-section">
              <div className="add-section-lbl">Status</div>
              <div className="add-row">
                <label className="add-label">
                  Stage
                  <select
                    className="add-input"
                    name="stage"
                    value={form.stage}
                    onChange={handleChange}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                    ))}
                  </select>
                </label>
                <label className="add-label">
                  Date applied
                  <input
                    className="add-input"
                    name="date_applied"
                    type="date"
                    value={form.date_applied}
                    onChange={handleChange}
                  />
                </label>
                <label className="add-label">
                  Date posted
                  <input
                    className="add-input"
                    name="date_posted"
                    type="date"
                    value={form.date_posted}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </section>

            <section className="add-section">
              <div className="add-section-lbl">Notes</div>
              <textarea
                className="add-input add-textarea"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any notes about this application…"
                rows={4}
              />
            </section>

            {error && (
              <div className="add-error">
                <p>{error}</p>
              </div>
            )}

            <div className="add-actions">
              <Link to="/app" className="add-cancel">Cancel</Link>
              <button type="submit" className="add-submit" disabled={loading}>
                {loading ? 'Saving…' : 'Save application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
