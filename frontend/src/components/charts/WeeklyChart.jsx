export function WeeklyChart({ apps }) {
  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  const today = new Date();
  const todayMonday = getMonday(today);
  const buckets = [];

  for (let i = 5; i >= 0; i--) {
    const monday = new Date(todayMonday);
    monday.setDate(todayMonday.getDate() - i * 7);
    buckets.push({
      key: monday.toISOString().slice(0, 10),
      label: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }

  apps.forEach((a) => {
    if (!a.date_applied) return;
    const monday = getMonday(new Date(a.date_applied));
    const key = monday.toISOString().slice(0, 10);
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
