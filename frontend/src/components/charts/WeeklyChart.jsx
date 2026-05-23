export function WeeklyChart({ apps }) {
  function parseLocal(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function localKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const today = new Date();
  const todayMonday = getMonday(today);
  const buckets = [];

  for (let i = 5; i >= 0; i--) {
    const monday = new Date(todayMonday);
    monday.setDate(todayMonday.getDate() - i * 7);
    buckets.push({
      key: localKey(monday),
      label: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }

  apps.forEach((a) => {
    if (!a.date_applied) return;
    const monday = getMonday(parseLocal(a.date_applied));
    const key = localKey(monday);
    const b = buckets.find((bb) => bb.key === key);
    if (b) b.count += 1;
  });

  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="weekly-bars">
      {buckets.map((b) => (
        <div key={b.key} className="bar-col" title={`${b.count} application${b.count !== 1 ? 's' : ''}`}>
          <div className="bar-track">
            <div className="bar-fill" style={{ height: `${(b.count / max) * 100}%` }} />
          </div>
          <span className="bar-lbl">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
