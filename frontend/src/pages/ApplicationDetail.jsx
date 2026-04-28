import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import './ApplicationDetail.css';

const STAGES = ['applied', 'screen', 'interview', 'final', 'offer', 'rejected', 'withdrawn'];
const STAGE_LABELS = {
  applied: 'Applied', screen: 'Phone Screen', interview: 'Interview',
  final: 'Final Round', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn',
};
const STAGE_COLORS = {
  applied: 'stage-applied', screen: 'stage-screen', interview: 'stage-interview',
  final: 'stage-final', offer: 'stage-offer', rejected: 'stage-rejected', withdrawn: 'stage-withdrawn',
};
const REMOTE_TYPES = ['remote', 'hybrid', 'onsite'];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Editable field — shows value as text, switches to input on click
function EditableField({ label, value, name, type = 'text', onSave, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (draft === (value ?? '')) { setEditing(false); return; }
    setSaving(true);
    await onSave(name, draft || null);
    setSaving(false);
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'Escape') { setDraft(value ?? ''); setEditing(false); }
  }

  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      {editing ? (
        <input
          className="detail-field-input"
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={saving}
          placeholder={placeholder}
        />
      ) : (
        <span
          className={`detail-field-value ${!value ? 'detail-field-empty' : ''}`}
          onClick={() => { setDraft(value ?? ''); setEditing(true); }}
          title="Click to edit"
        >
          {type === 'date' ? formatDate(value) : (value || placeholder || '—')}
        </span>
      )}
    </div>
  );
}

function EditableSelect({ label, name, value, options, labelMap, onSave }) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    setSaving(true);
    await onSave(name, e.target.value || null);
    setSaving(false);
  }

  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <select
        className="detail-field-select"
        value={value ?? ''}
        onChange={handleChange}
        disabled={saving}
      >
        {!options.includes(value) && <option value="">— select —</option>}
        {options.map((o) => (
          <option key={o} value={o}>{labelMap ? labelMap[o] : o.charAt(0).toUpperCase() + o.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}

function EditableTextarea({ label, value, name, onSave, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (draft === (value ?? '')) { setEditing(false); return; }
    setSaving(true);
    await onSave(name, draft || null);
    setSaving(false);
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setDraft(value ?? ''); setEditing(false); }
  }

  return (
    <div className="detail-field detail-field-full">
      <span className="detail-field-label">{label}</span>
      {editing ? (
        <textarea
          className="detail-field-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={saving}
          rows={5}
          placeholder={placeholder}
        />
      ) : (
        <span
          className={`detail-field-value detail-field-pre ${!value ? 'detail-field-empty' : ''}`}
          onClick={() => { setDraft(value ?? ''); setEditing(true); }}
          title="Click to edit"
        >
          {value || placeholder || '—'}
        </span>
      )}
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then(setApp)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(field, value) {
    const updated = await api.patch(`/applications/${id}`, { [field]: value });
    setApp(updated);
  }

  if (loading) return <div className="detail-page"><p className="detail-status">Loading…</p></div>;
  if (error) return <div className="detail-page"><p className="detail-status detail-error">{error}</p></div>;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <Link to="/applications" className="detail-back">← Applications</Link>
        <div className="detail-title-row">
          <div>
            <h1 className="detail-title">{app.job_title}</h1>
            <p className="detail-company">{app.company_name}</p>
          </div>
          <span className={`stage-badge stage-badge-lg ${STAGE_COLORS[app.stage]}`}>
            {STAGE_LABELS[app.stage]}
          </span>
        </div>
      </div>

      <div className="detail-body">
        <section className="detail-section">
          <h2 className="detail-section-title">Status</h2>
          <div className="detail-grid">
            <EditableSelect
              label="Stage"
              name="stage"
              value={app.stage}
              options={STAGES}
              labelMap={STAGE_LABELS}
              onSave={handleSave}
            />
            <EditableField label="Date applied" name="date_applied" value={app.date_applied} type="date" onSave={handleSave} />
            <EditableField label="Date posted" name="date_posted" value={app.date_posted} type="date" onSave={handleSave} placeholder="Unknown" />
          </div>
        </section>

        <section className="detail-section">
          <h2 className="detail-section-title">Job details</h2>
          <div className="detail-grid">
            <EditableField label="Job title" name="job_title" value={app.job_title} onSave={handleSave} placeholder="Job title" />
            <EditableField label="Company" name="company_name" value={app.company_name} onSave={handleSave} placeholder="Company" />
            <EditableField label="Location" name="location" value={app.location} onSave={handleSave} placeholder="Location" />
            <EditableSelect
              label="Work type"
              name="remote_type"
              value={app.remote_type}
              options={REMOTE_TYPES}
              onSave={handleSave}
            />
            <EditableField label="Salary range" name="salary_range" value={app.salary_range} onSave={handleSave} placeholder="e.g. $80k–$100k" />
            <EditableField label="Job URL" name="job_url" value={app.job_url} type="url" onSave={handleSave} placeholder="https://..." />
          </div>
        </section>

        <section className="detail-section">
          <h2 className="detail-section-title">Notes</h2>
          <EditableTextarea label="Notes" name="notes" value={app.notes} onSave={handleSave} placeholder="Click to add notes…" />
        </section>

        <section className="detail-section">
          <h2 className="detail-section-title">Job description</h2>
          <EditableTextarea label="Description" name="job_description" value={app.job_description} onSave={handleSave} placeholder="Click to add job description…" />
        </section>
      </div>
    </div>
  );
}
