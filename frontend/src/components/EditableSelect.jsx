import { useState } from 'react';

export function EditableSelect({ label, name, value, options, labelMap, onSave }) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    setSaving(true);
    await onSave(name, e.target.value || null);
    setSaving(false);
  }

  return (
    <div className="detail-field">
      <span className="detail-field-lbl">{label}</span>
      <select
        className="detail-field-select"
        value={value ?? ''}
        onChange={handleChange}
        disabled={saving}
      >
        {!options.includes(value) && <option value="">— select —</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {labelMap ? labelMap[o] : o.charAt(0).toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
