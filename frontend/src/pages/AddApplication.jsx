import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { STAGES, STAGE_LABELS, REMOTE_TYPES } from '../constants/stages';
import '../components/Navbar.css';
import './AddApplication.css';

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
  job_description: '',
};

export default function AddApplication() {
  const navigate = useNavigate();

  // URL import state
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Manual form state
  const [showManual, setShowManual] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [manualError, setManualError] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  async function handleImport(e) {
    e.preventDefault();
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError('');
    try {
      await api.post('/applications/from-url', { url: importUrl });
      navigate('/app');
    } catch (err) {
      setImportError(err.message || 'Import failed — try again or add manually.');
    } finally {
      setImporting(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    setManualError('');
    setManualLoading(true);
    try {
      await api.post('/applications', form);
      navigate('/app');
    } catch (err) {
      setManualError(err.message);
    } finally {
      setManualLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-main">
        <div className="add-header">
          <Link to="/app" className="add-back">← Overview</Link>
          <h1 className="add-title">Add application</h1>
        </div>

        <div className="add-content">

          {/* ── Primary: URL import ── */}
          <section className="add-section add-import">
            <div className="add-section-lbl">Import from URL</div>
            <p className="add-import-hint">
              Paste a job listing URL — we'll scrape the details and save the application instantly.
              You can edit anything on the next screen.
            </p>
            <form onSubmit={handleImport} className="add-scrape-row">
              <input
                className="add-scrape-input"
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://boards.greenhouse.io/..."
                disabled={importing}
                autoFocus
              />
              <button
                type="submit"
                className="add-import-btn"
                disabled={importing || !importUrl.trim()}
              >
                {importing ? 'Importing…' : 'Import job'}
              </button>
            </form>
            {importError && (
              <p className="add-notice warn">⚠ {importError}</p>
            )}
          </section>

          {/* ── Divider ── */}
          <div className="add-divider">
            <span>or</span>
          </div>

          {/* ── Secondary: manual form toggle ── */}
          <button
            className="add-manual-toggle"
            onClick={() => setShowManual((v) => !v)}
            type="button"
          >
            {showManual ? '↑ Hide manual form' : '↓ Fill in manually'}
          </button>

          {showManual && (
            <form onSubmit={handleManualSubmit} className="add-form">
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

              {manualError && (
                <div className="add-error">
                  <p>{manualError}</p>
                </div>
              )}

              <div className="add-actions">
                <Link to="/app" className="add-cancel">Cancel</Link>
                <button type="submit" className="add-submit" disabled={manualLoading}>
                  {manualLoading ? 'Saving…' : 'Save application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
