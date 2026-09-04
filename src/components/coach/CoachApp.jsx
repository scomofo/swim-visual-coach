import { useEffect } from 'react';
import { Waves } from 'lucide-react';
import { DRILLS, DRILL_ORDER } from '../../data/drills';
import { cancelSpeech, speak } from '../../lib/narration';
import { cn } from '../../lib/utils';
import { useCoach } from '../../store/coach';
import { LaneView } from './LaneView';
import { Onboarding } from './Onboarding';
import { PlaybackDock } from './PlaybackDock';
import { DrillRail } from './DrillRail';
import { DragMeter } from './DragMeter';

function useNarration() {
  const audio = useCoach((s) => s.audio);
  const voice = useCoach((s) => s.voice);
  const drill = useCoach((s) => s.drill);

  useEffect(() => {
    if (!audio) return;
    speak(DRILLS[drill].narration, { voiceURI: voice });
    return () => cancelSpeech();
  }, [audio, voice, drill]);
}

function useHotkeys() {
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const s = useCoach.getState();
      if (e.code === 'Space') {
        e.preventDefault();
        s.togglePlaying();
      } else if (e.key === '1') s.setCamera('side');
      else if (e.key === '2') s.setCamera('quarter');
      else if (e.key === '3') s.setCamera('overhead');
      else if (e.key === '4') s.setCamera('front');
      else if (e.key === '5') s.setCamera('under');
      else if (e.key === 'g' || e.key === 'G') s.setGhost(!s.ghost);
      else if (e.key === 'c' || e.key === 'C') s.setMode('correct');
      else if (e.key === 'e' || e.key === 'E') s.setMode('error');
      else if (e.key === 'ArrowRight') {
        const next = DRILL_ORDER[DRILL_ORDER.indexOf(s.drill) + 1];
        if (next) s.setDrill(next);
      } else if (e.key === 'ArrowLeft') {
        const prev = DRILL_ORDER[DRILL_ORDER.indexOf(s.drill) - 1];
        if (prev) s.setDrill(prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

function useReducedMotionPause() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      if (media.matches) useCoach.getState().setPlaying(false);
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);
}

export function CoachApp() {
  const hydrate = useCoach((s) => s.hydrate);
  const drillId = useCoach((s) => s.drill);
  const drill = DRILLS[drillId];
  const highlight = useCoach((s) => s.highlight);
  const setHighlight = useCoach((s) => s.setHighlight);
  const focus = useCoach((s) => s.focus);
  const celebration = useCoach((s) => s.celebration);
  const ghost = useCoach((s) => s.ghost);
  const mode = useCoach((s) => s.mode);
  const idx = DRILL_ORDER.indexOf(drillId);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useNarration();
  useHotkeys();
  useReducedMotionPause();

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Onboarding />

      {celebration ? (
        <div
          role="status"
          className="pointer-events-none fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-fg shadow-[var(--shadow-border)]"
        >
          Drill mastered
        </div>
      ) : null}

      <div
        className={cn(
          'mx-auto flex min-h-dvh max-w-[1400px] flex-col gap-4 p-4 pb-6 md:gap-5 md:p-6',
          focus && 'max-w-none p-3 md:p-4',
        )}
      >
        <header
          className={cn(
            'flex flex-col gap-3 md:flex-row md:items-end md:justify-between',
            focus && 'sr-only',
          )}
        >
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Waves className="size-4" strokeWidth={1.75} />
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted">
                Swim Visual Coach
              </p>
            </div>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-fg md:text-5xl">
              {drill.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
              {drill.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md bg-surface px-3 py-2 tabular-nums text-muted">
              {String(idx + 1).padStart(2, '0')} · {drill.phase}
            </span>
          </div>
        </header>

        <section
          data-testid="visualization"
          className={cn(
            'relative min-h-[420px] overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]',
            focus ? 'h-[calc(100dvh-9.5rem)]' : 'h-[clamp(420px,58dvh,640px)]',
          )}
        >
          <LaneView />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg/50 to-transparent" />

          <blockquote className="absolute left-4 top-4 mr-52 max-w-xl rounded-lg bg-bg/55 px-4 py-3 text-sm leading-6 text-fg backdrop-blur-sm md:left-5 md:top-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Coach</p>
            <p className="mt-1 font-display text-base md:text-lg">{drill.coach}</p>
          </blockquote>

          <DragMeter />

          {ghost && drillId !== 'comparison' ? (
            <p className="absolute right-3 top-56 max-w-48 rounded-md bg-bg/55 px-3 py-2 text-xs leading-5 text-muted backdrop-blur-sm md:right-5">
              Ghost shows {mode === 'correct' ? 'the common error' : 'efficient form'}
            </p>
          ) : null}

          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 md:bottom-4 md:left-4 md:right-4">
            {drill.tags.map((tag) => {
              const on = highlight === tag.cue;
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setHighlight(on ? null : tag.cue)}
                  className={cn(
                    'h-11 rounded-md px-3 text-sm font-medium backdrop-blur-sm transition-transform duration-150 ease-out active:scale-[0.96]',
                    on ? 'bg-accent text-accent-fg' : 'bg-bg/55 text-fg hover:bg-bg/70',
                  )}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </section>

        <PlaybackDock />

        <div className={cn(focus && 'hidden')}>
          <DrillRail />
        </div>
      </div>
    </div>
  );
}
