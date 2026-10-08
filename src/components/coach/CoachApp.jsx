import { useEffect } from 'react';
import { ArrowUpRight, Check, Keyboard, Waves } from 'lucide-react';
import { DRILLS, DRILL_ORDER } from '../../data/drills';
import { cancelSpeech, speak } from '../../lib/narration';
import { cn } from '../../lib/utils';
import { useCoach } from '../../store/coach';
import { LaneView } from './LaneView';
import { Onboarding } from './Onboarding';
import { PlaybackDock } from './PlaybackDock';
import { DrillRail } from './DrillRail';
import { DragMeter } from './DragMeter';
import { LessonPanel } from './LessonPanel';

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
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const s = useCoach.getState();
      if (s.showOnboarding) return;
      if (e.key === 'Escape' && s.focus) { s.setFocus(false); return; }
      if (e.target instanceof Element && e.target.closest(
        'button, a[href], input, textarea, select, [role="button"], [role="slider"], [role="tab"], [contenteditable]:not([contenteditable="false"])',
      )) return;
      if (e.repeat) {
        if (e.code === 'Space') e.preventDefault();
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        s.togglePlaying();
      } else if (e.key === '1') s.setCamera('side');
      else if (e.key === '2') s.setCamera('quarter');
      else if (e.key === '3') s.setCamera('overhead');
      else if (e.key === '4') s.setCamera('front');
      else if (e.key === '5') s.setCamera('under');
      else if ((e.key === 'g' || e.key === 'G') && s.drill !== 'comparison') s.setGhost(!s.ghost);
      else if (e.key === 'c' || e.key === 'C') s.setMode('correct');
      else if (e.key === 'e' || e.key === 'E') s.setMode('error');
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = DRILL_ORDER[DRILL_ORDER.indexOf(s.drill) + 1];
        if (next) s.setDrill(next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
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
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      useCoach.getState().setReducedMotion(media.matches);
    };
    apply();
    if (media.addEventListener) {
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    }
    media.addListener(apply);
    return () => media.removeListener(apply);
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
  const camera = useCoach((s) => s.camera);
  const playing = useCoach((s) => s.playing);
  const completed = useCoach((s) => s.completed);
  const showOnboarding = useCoach((s) => s.showOnboarding);
  const idx = DRILL_ORDER.indexOf(drillId);
  const doneCount = DRILL_ORDER.filter((id) => completed[id]).length;
  const cameraLabel = { side: 'Side view', quarter: 'Three-quarter view', overhead: 'Overhead view', front: 'Head-on view', under: 'Underwater view' }[camera];
  useEffect(() => { hydrate(); }, [hydrate]);
  useNarration();
  useHotkeys();
  useReducedMotionPause();

  return (
    <div className="coach-app min-h-dvh bg-bg text-fg">
      <Onboarding />
      {celebration && <div role="status" className="mastery-toast pointer-events-none fixed left-1/2 top-6 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-fg"><Check className="size-4" aria-hidden="true" />Drill mastered</div>}
      <div inert={showOnboarding || undefined} className={cn('coach-shell', focus && 'is-focused')}>
        <header hidden={focus} className="app-header">
          <div className="brand-lockup">
            <span className="brand-icon"><Waves className="size-6" strokeWidth={1.5} aria-hidden="true" /></span>
            <div><p className="brand-name">Swim <span>Visual Coach</span></p><p className="brand-caption">Find your flow.</p></div>
          </div>
          <div className="header-right">
            <span className="method-label">Balance. Streamline. Rhythm.</span>
            <div className="course-progress" aria-label={`${doneCount} of ${DRILL_ORDER.length} drills mastered`}>
              <span className="progress-ring" style={{ '--progress': `${doneCount / DRILL_ORDER.length * 100}%` }}><Waves className="size-4" aria-hidden="true" /></span>
              <div><span className="eyebrow">Your practice</span><p>{Math.round(doneCount / DRILL_ORDER.length * 100)}% complete</p></div>
            </div>
          </div>
        </header>
        <div className="workspace">
          <div hidden={focus} className="curriculum-column"><DrillRail /></div>
          <main className="practice-column" aria-labelledby="practice-title">
            <div className={cn('practice-heading', focus && 'sr-only')}>
              <div>
                <p className="eyebrow text-accent">Lesson {String(idx + 1).padStart(2, '0')} <span className="text-muted">/ {String(DRILL_ORDER.length).padStart(2, '0')} &nbsp; · &nbsp; {drill.phase}</span></p>
                <h1 id="practice-title" tabIndex={-1}>{drill.title}</h1>
                <p className="practice-subtitle">Watch the movement. Notice the difference. Take one cue to the water.</p>
              </div>
              <span className="lesson-badge">{completed[drillId] ? <><Check className="size-3.5" aria-hidden="true" />Mastered</> : <><span className="status-dot" />In practice</>}</span>
            </div>
            <section data-testid="visualization" aria-label="Interactive swimming demonstration" className="lane-stage">
              <LaneView />
              <div className="lane-vignette pointer-events-none" />
              <div className="lane-topline pointer-events-none">
                <span className="view-label"><span className={cn('status-dot', !playing && 'is-paused')} />{cameraLabel}</span>
                <span className={cn('form-label', mode === 'error' && drillId !== 'comparison' && 'is-error')}>{drillId === 'comparison' ? 'Efficient vs rushed' : mode === 'correct' ? 'Efficient form' : 'Common error'}</span>
              </div>
              {(ghost || drillId === 'comparison') && <div className="lane-legend pointer-events-none">{drillId === 'comparison' ? <><span><i className="legend-dot" />Far lane · efficient</span><span><i className="legend-dot error" />Near lane · rushed</span></> : <span><i className="legend-dot ghost" />Ghost shows {mode === 'correct' ? 'the common error' : 'efficient form'}</span>}</div>}
              <div className="lane-cues">
                <span className="eyebrow">Explore a focal point<ArrowUpRight className="size-3.5" aria-hidden="true" /></span>
                <div className="flex flex-wrap gap-2">{drill.tags.map((tag) => {
                  const on = highlight === tag.cue;
                  return <button key={tag.label} type="button" aria-pressed={on} onClick={() => setHighlight(on ? null : tag.cue)} className={cn('cue-button', on && 'is-active')}>{tag.label}</button>;
                })}</div>
              </div>
            </section>
            <PlaybackDock />
            <div className="workspace-footer">
              <span><span className="status-dot" />A quieter stroke starts with one small change.</span>
              <details className="shortcut-help">
                <summary><Keyboard className="size-4" aria-hidden="true" />Keyboard shortcuts</summary>
                <div className="shortcut-popover"><p><kbd>Space</kbd>Play / pause</p><p><kbd>1–5</kbd>Camera views</p><p><kbd>C / E</kbd>Efficient / common error</p><p><kbd>G</kbd>Ghost comparison</p><p><kbd>← / →</kbd>Previous / next lesson</p><p><kbd>Esc</kbd>Exit focus</p></div>
              </details>
            </div>
          </main>
          <div hidden={focus} className="insight-column"><LessonPanel key={drillId} /><DragMeter /></div>
        </div>
      </div>
    </div>
  );
}
