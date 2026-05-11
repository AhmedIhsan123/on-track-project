import { useState } from 'react';
import { STAGES, STAGE_LABELS, STAGE_PILL } from '../constants/stages';

export function StageCell({ app, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    setSaving(true);
    await onUpdate(app.id, e.target.value);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <select
        className="stage-inline-select"
        value={app.stage}
        onChange={handleChange}
        disabled={saving}
        autoFocus
        onBlur={() => setEditing(false)}
        onClick={(e) => e.stopPropagation()}
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>{STAGE_LABELS[s]}</option>
        ))}
      </select>
    );
  }

  return (
    <span
      className={`stage-badge ${STAGE_PILL[app.stage]}`}
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      title="Click to change stage"
    >
      {STAGE_LABELS[app.stage] ?? app.stage}
    </span>
  );
}
