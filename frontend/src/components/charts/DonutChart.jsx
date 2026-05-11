import { STAGES, STAGE_LABELS, STAGE_HEX } from '../../constants/stages';

export function DonutChart({ apps }) {
  const counts = {};
  STAGES.forEach((s) => (counts[s] = 0));
  apps.forEach((a) => { counts[a.stage] = (counts[a.stage] || 0) + 1; });
  const total = apps.length;

  let accum = 0;
  const segs = STAGES
    .map((s) => {
      const cnt = counts[s] || 0;
      const pct = total ? (cnt / total) * 100 : 0;
      const start = accum;
      accum += pct;
      return { s, cnt, pct, start };
    })
    .filter((x) => x.cnt > 0);

  const grad = segs
    .map((x) => `${STAGE_HEX[x.s]} ${x.start.toFixed(2)}% ${(x.start + x.pct).toFixed(2)}%`)
    .join(', ');

  return (
    <div className="donut-wrap">
      <div className="donut-ring">
        <div
          className="donut-ring-fill"
          style={{ background: total ? `conic-gradient(${grad})` : 'var(--b1)' }}
        />
        <div className="donut-hole">
          <span className="donut-hole-val">{total}</span>
          <span className="donut-hole-lbl">Total</span>
        </div>
      </div>
      <div className="donut-legend">
        {segs.length === 0 ? (
          <span className="donut-empty">No data yet.</span>
        ) : (
          segs.map((x) => (
            <div key={x.s} className="donut-legend-row">
              <span className="donut-legend-dot" style={{ background: STAGE_HEX[x.s] }} />
              <span className="donut-legend-txt">{x.cnt} {STAGE_LABELS[x.s]}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
