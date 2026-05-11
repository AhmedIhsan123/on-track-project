import { useState } from 'react';

export function EditableTextarea({ label, value, name, onSave, placeholder }) {
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
    <div className="detail-field full">
      <span className="detail-field-lbl">{label}</span>
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
          className={`detail-field-val pre ${!value ? 'empty' : ''}`}
          onClick={() => { setDraft(value ?? ''); setEditing(true); }}
          title="Click to edit"
        >
          {value || placeholder || '—'}
        </span>
      )}
    </div>
  );
}
