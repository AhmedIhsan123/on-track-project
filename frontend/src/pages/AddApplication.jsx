import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import './AddApplication.css';

const STAGES = ['applied', 'screen', 'interview', 'final', 'offer', 'rejected', 'withdrawn'];
const REMOTE_TYPES = ['remote', 'hybrid', 'onsite'];

const today = new Date().toISOString().slice(0, 10);

export default function AddApplication() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
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
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/applications', form);
      navigate('/applications');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-app-page">
      <div className="add-app-header">
        <Link to="/applications" className="add-app-back">← Applications</Link>
        <h1>Add application</h1>
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

        {error && <p className="add-app-error">{error}</p>}

        <div className="add-app-actions">
          <Link to="/applications" className="add-app-cancel">Cancel</Link>
          <button type="submit" className="add-app-submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save application'}
          </button>
        </div>
      </form>
    </div>
  );
}
