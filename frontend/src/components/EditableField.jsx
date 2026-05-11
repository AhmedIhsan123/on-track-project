import { useState } from 'react';
import { formatDate } from '../utils/format';

export function EditableField({ label, value, name, type = 'text', onSave, placeholder }) {
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
    if (e.key === 'Enter' && type !== 'date') e.target.blur();
    if (e.key === 'Escape') { setDraft(value ?? ''); setEditing(false); }
  }

  return (
    <div className="detail-field">
      <span className="detail-field-lbl">{label}</span>
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
          className={`detail-field-val ${!value ? 'empty' : ''}`}
          onClick={() => { setDraft(value ?? ''); setEditing(true); }}
          title="Click to edit"
        >
          {type === 'date' ? formatDate(value) : (value || placeholder || '—')}
        </span>
      )}
    </div>
  );
}
