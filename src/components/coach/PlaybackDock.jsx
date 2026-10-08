import { AudioLines, Eye, Ghost, Maximize2, Minimize2, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCoach } from '../../store/coach';
import { VoicePicker } from './VoicePicker';
const SPEEDS = [0.25, 0.5, 1, 1.5];
const CAMERAS = [{ id: 'side', label: 'Side' }, { id: 'quarter', label: '3/4' }, { id: 'overhead', label: 'Overhead' }, { id: 'front', label: 'Head-on' }, { id: 'under', label: 'Under' }];
function Chip({ active, onClick, children, disabled = false, title }) {
  return <button type="button" aria-pressed={active} onClick={onClick} disabled={disabled} title={title} className={cn('control-chip', active && 'is-active')}>{children}</button>;
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
  const drill = useCoach((s) => s.drill);
  const setPlaying = useCoach((s) => s.setPlaying);
  const restartPlayback = useCoach((s) => s.restartPlayback);
  const setSpeed = useCoach((s) => s.setSpeed);
  const setCamera = useCoach((s) => s.setCamera);
  const setMode = useCoach((s) => s.setMode);
  const setGhost = useCoach((s) => s.setGhost);
  const setGuides = useCoach((s) => s.setGuides);
  const setAudio = useCoach((s) => s.setAudio);
  const setFocus = useCoach((s) => s.setFocus);
  const compare = drill === 'comparison';
  return (
    <section className="playback-dock" aria-label="Playback and view controls">
      <div className="dock-primary">
        <div className="playback-group">
          <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'} title="Play / pause · Space" className="play-button">{playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}</button>
          <button type="button" onClick={restartPlayback} aria-label="Restart demonstration" title="Restart the demonstration" className="restart-button"><RotateCcw className="size-4" aria-hidden="true" /></button>
          <div className="control-group" role="group" aria-label="Playback speed"><span className="control-label">Speed</span><div className="segmented-control">{SPEEDS.map((s) => <Chip key={s} active={speed === s} onClick={() => setSpeed(s)}>{s}x</Chip>)}</div></div>
        </div>
        <div className="control-group" role="group" aria-label="Swimming form"><span className="control-label">Compare form</span>{compare ? <span className="comparison-caption">Both forms, side by side</span> : <div className="segmented-control"><Chip active={mode === 'correct'} onClick={() => setMode('correct')}>Efficient</Chip><Chip active={mode === 'error'} onClick={() => setMode('error')}>Common error</Chip></div>}</div>
        <div className="phase-readout"><span className="control-label">Movement</span><span>{phase}</span>{spl > 0 && <small title="Illustrative profile value, not a measurement of your swimming">~{spl} strokes / length</small>}</div>
      </div>
      <div className="dock-secondary">
        <div className="control-group" role="group" aria-label="Camera view"><span className="control-label">View</span><div className="camera-options">{CAMERAS.map((cam, index) => <Chip key={cam.id} active={camera === cam.id} title={`Camera ${index + 1} · ${cam.label}`} onClick={() => setCamera(cam.id)}>{cam.label}</Chip>)}</div></div>
        <div className="display-options" role="group" aria-label="Display options">
          <Chip active={ghost && !compare} disabled={compare} title={compare ? 'This lesson already shows both forms' : 'Overlay the alternative form · G'} onClick={() => setGhost(!ghost)}><Ghost className="size-3.5" aria-hidden="true" />Ghost</Chip>
          <Chip active={guides} onClick={() => setGuides(!guides)}><Eye className="size-3.5" aria-hidden="true" />Guides</Chip>
          <Chip active={audio} onClick={() => setAudio(!audio)}><AudioLines className="size-3.5" aria-hidden="true" />Narrate</Chip>
          <Chip active={focus} onClick={() => setFocus(!focus)}>{focus ? <Minimize2 className="size-3.5" aria-hidden="true" /> : <Maximize2 className="size-3.5" aria-hidden="true" />}{focus ? 'Exit focus' : 'Focus'}</Chip>
        </div>
      </div>
      {audio && <div className="voice-row"><VoicePicker /></div>}
    </section>
  );
}
