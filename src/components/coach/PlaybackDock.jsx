import {
  AudioLines,
  Eye,
  Ghost,
  Maximize2,
  Minimize2,
  Pause,
  Play,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCoach } from '../../store/coach';

const SPEEDS = [0.25, 0.5, 1, 1.5];
const CAMERAS = [
  { id: 'side', label: 'Side' },
  { id: 'quarter', label: '3/4' },
  { id: 'overhead', label: 'Overhead' },
  { id: 'front', label: 'Head-on' },
  { id: 'under', label: 'Under' },
];

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-11 shrink-0 rounded-md px-3 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]',
        active ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-fg hover:bg-border-strong/20',
      )}
    >
      {children}
    </button>
  );
}

export function PlaybackDock() {
  const playing = useCoach((s) => s.playing);
  const speed = useCoach((s) => s.speed);
  const camera = useCoach((s) => s.camera);
  const mode = useCoach((s) => s.mode);
  const ghost = useCoach((s) => s.ghost);
  const guides = useCoach((s) => s.guides);
  const audio = useCoach((s) => s.audio);
  const focus = useCoach((s) => s.focus);
  const phase = useCoach((s) => s.hudPhase);
  const spl = useCoach((s) => s.hudSpl);
  const dragTotal = useCoach((s) => s.hudDrag.total);
  const drill = useCoach((s) => s.drill);

  const setPlaying = useCoach((s) => s.setPlaying);
  const setSpeed = useCoach((s) => s.setSpeed);
  const setCamera = useCoach((s) => s.setCamera);
  const setMode = useCoach((s) => s.setMode);
  const setGhost = useCoach((s) => s.setGhost);
  const setGuides = useCoach((s) => s.setGuides);
  const setAudio = useCoach((s) => s.setAudio);
  const setFocus = useCoach((s) => s.setFocus);

  const compare = drill === 'comparison';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-accent-fg transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          {playing ? (
            <Pause className="size-4" strokeWidth={1.75} />
          ) : (
            <Play className="ml-px size-4" strokeWidth={1.75} />
          )}
        </button>

        {SPEEDS.map((s) => (
          <Chip key={s} active={speed === s} onClick={() => setSpeed(s)}>
            {s}x
          </Chip>
        ))}

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        {!compare ? (
          <>
            <Chip active={mode === 'correct'} onClick={() => setMode('correct')}>
              Efficient
            </Chip>
            <Chip active={mode === 'error'} onClick={() => setMode('error')}>
              Common error
            </Chip>
          </>
        ) : (
          <span className="px-2 text-sm text-muted">Far lane quiet · near lane rushed</span>
        )}

        <div className="ml-auto flex items-center gap-2 text-sm tabular-nums text-muted">
          <span className="rounded-md bg-surface-2 px-3 py-2 text-fg">{phase}</span>
          {spl > 0 ? <span>SPL ~{spl}</span> : null}
          <span className="rounded-md bg-surface-2 px-3 py-2 text-fg">
            Drag {Math.round(dragTotal * 100)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CAMERAS.map((cam) => (
          <Chip key={cam.id} active={camera === cam.id} onClick={() => setCamera(cam.id)}>
            {cam.label}
          </Chip>
        ))}

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <Chip active={ghost && !compare} onClick={() => setGhost(!ghost)}>
          <span className="inline-flex items-center gap-1.5">
            <Ghost className="size-3.5" strokeWidth={1.75} />
            Ghost
          </span>
        </Chip>
        <Chip active={guides} onClick={() => setGuides(!guides)}>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-3.5" strokeWidth={1.75} />
            Guides
          </span>
        </Chip>
        <Chip active={audio} onClick={() => setAudio(!audio)}>
          <span className="inline-flex items-center gap-1.5">
            <AudioLines className="size-3.5" strokeWidth={1.75} />
            Narrate
          </span>
        </Chip>
        <Chip active={focus} onClick={() => setFocus(!focus)}>
          <span className="inline-flex items-center gap-1.5">
            {focus ? (
              <Minimize2 className="size-3.5" strokeWidth={1.75} />
            ) : (
              <Maximize2 className="size-3.5" strokeWidth={1.75} />
            )}
            {focus ? 'Exit focus' : 'Focus'}
          </span>
        </Chip>
      </div>
    </div>
  );
}
