const IDLE = {
  form: 0.12,
  wave: 0.08,
  skin: 0.1,
  total: 0.1,
  label: 'Quiet',
  note: 'The water stays almost still.',
  otherTotal: null,
};

function Bar({ label, value, hint }) {
  const hot = value > 0.55;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-white">{label}</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/50">
          {hint}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-950/70">
        <div
          className={`h-full rounded-full ${hot ? 'bg-amber-300' : 'bg-cyan-300'}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function DragMeter({ drag, compare = false }) {
  const report = drag ?? IDLE;
  const pct = Math.round((report.total ?? 0) * 100);
  return (
    <aside
      data-testid="drag-meter"
      className="absolute right-3 top-4 z-10 w-48 rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-white backdrop-blur md:right-5 md:top-5"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-100/70">
          Drag
        </p>
        <p className="text-lg tabular-nums leading-none">{pct}</p>
      </div>
      <p className={`mt-1 text-sm ${report.label === 'Noisy' ? 'text-amber-200' : 'text-cyan-200'}`}>
        {report.label}
      </p>
      <div className="mt-3 grid gap-2.5">
        <Bar label="Form" value={report.form} hint="shape" />
        <Bar label="Wave" value={report.wave} hint="surface" />
        <Bar label="Skin" value={report.skin} hint="friction" />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-300">{report.note}</p>
      {compare && report.otherTotal != null ? (
        <p className="mt-2 text-xs tabular-nums text-slate-400">
          Quiet {pct} · rushed {Math.round(report.otherTotal * 100)}
        </p>
      ) : null}
    </aside>
  );
}
