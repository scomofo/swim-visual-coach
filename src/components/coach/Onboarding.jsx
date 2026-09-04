import { Waves } from 'lucide-react';
import { useCoach } from '../../store/coach';

const STEPS = [
  {
    title: 'Slow down',
    body: 'Quiet water and patient timing matter more than force.',
  },
  {
    title: 'Watch the bodyline',
    body: 'Eyes down, chest pressed, hips high. Balance before propulsion.',
  },
  {
    title: 'Stay relaxed',
    body: 'Tension creates drag. Switch views, freeze a phase, and compare form.',
  },
];

export function Onboarding() {
  const open = useCoach((s) => s.showOnboarding);
  const close = useCoach((s) => s.closeOnboarding);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-labelledby="onboard-title"
        className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8"
      >
        <div className="flex items-center gap-2 text-accent">
          <Waves className="size-4" strokeWidth={1.75} />
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted">
            Total Immersion
          </p>
        </div>
        <h2
          id="onboard-title"
          className="mt-4 font-display text-3xl font-medium tracking-tight text-fg"
        >
          Swim calmly. Learn visually.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          A 3D coaching lane that teaches freestyle through motion, balance, and
          rhythm — not a pile of cues.
        </p>
        <div className="mt-6 grid gap-3">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-lg bg-surface-2 px-4 py-3">
              <div className="text-sm font-medium text-fg">{step.title}</div>
              <p className="mt-1 text-sm leading-6 text-muted">{step.body}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={close}
          className="mt-7 h-12 w-full rounded-md bg-accent text-sm font-medium text-accent-fg transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          Begin practice
        </button>
      </div>
    </div>
  );
}
