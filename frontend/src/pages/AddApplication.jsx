import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import './AddApplication.css';

const STAGES = ['applied', 'screen', 'interview', 'final', 'offer', 'rejected', 'withdrawn'];
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
      setScrapeNotice(data.scrape_error
        ? 'Could not extract details from that page — fill in manually.'
        : 'Details filled in — review and save.');
    } catch (err) {
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

  return (
    <div className="add-app-page">
      <div className="add-app-header">
        <Link to="/app" className="add-app-back">← Applications</Link>
        <h1>Add application</h1>
      </div>

      {/* URL scraper bar */}
      <div className="add-app-section add-app-scrape-section">
        <h2>Paste a job listing URL</h2>
        <p className="add-app-scrape-hint">We'll try to fill in the details automatically.</p>
        <form onSubmit={handleScrape} className="add-app-scrape-row">
          <input
            className="add-app-input add-app-scrape-input"
            type="url"
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="https://boards.greenhouse.io/..."
            disabled={scraping}
          />
          <button type="submit" className="add-app-scrape-btn" disabled={scraping || !scrapeUrl.trim()}>
            {scraping ? 'Fetching… (may take a few seconds)' : 'Fetch details'}
          </button>
        </form>
        {scrapeNotice && (
          <p className={`add-app-scrape-notice ${scrapeNotice.includes('Could not') || scrapeNotice.includes('failed') ? 'notice-warn' : 'notice-ok'}`}>
            {scrapeNotice}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="add-app-form">
        <div className="add-app-section">
          <h2>Job details</h2>
          <div className="add-app-row">
            <label className="add-app-label">
              Job title <span className="required">*</span>
              <input
                className="add-app-input"
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
                required
                placeholder="e.g. Software Engineer"
              />
            </label>
            <label className="add-app-label">
              Company <span className="required">*</span>
              <input
                className="add-app-input"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
                placeholder="e.g. Acme Corp"
              />
            </label>
          </div>

          <div className="add-app-row">
            <label className="add-app-label">
              Job URL
              <input
                className="add-app-input"
                name="job_url"
                type="url"
                value={form.job_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>
            <label className="add-app-label">
              Salary range
              <input
                className="add-app-input"
                name="salary_range"
                value={form.salary_range}
                onChange={handleChange}
                placeholder="e.g. $80k–$100k"
              />
            </label>
          </div>

          <div className="add-app-row">
            <label className="add-app-label">
              Location
              <input
                className="add-app-input"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. New York, NY"
              />
            </label>
            <label className="add-app-label">
              Work type
              <select className="add-app-input" name="remote_type" value={form.remote_type} onChange={handleChange}>
                <option value="">— select —</option>
                {REMOTE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="add-app-section">
          <h2>Application status</h2>
          <div className="add-app-row">
            <label className="add-app-label">
              Stage
              <select className="add-app-input" name="stage" value={form.stage} onChange={handleChange}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </label>
            <label className="add-app-label">
              Date applied
              <input
                className="add-app-input"
                name="date_applied"
                type="date"
                value={form.date_applied}
                onChange={handleChange}
              />
            </label>
            <label className="add-app-label">
              Date posted
              <input
                className="add-app-input"
                name="date_posted"
                type="date"
                value={form.date_posted}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        <div className="add-app-section">
          <h2>Notes</h2>
          <textarea
            className="add-app-input add-app-textarea"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any notes about this application…"
            rows={4}
          />
        </div>

        {error && (
          <div className="add-app-error-box">
            <p className="add-app-error-msg">{error}</p>
          </div>
        )}

        <div className="add-app-actions">
          <Link to="/app" className="add-app-cancel">Cancel</Link>
          <button type="submit" className="add-app-submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save application'}
          </button>
        </div>
      </form>
    </div>
  );
}
