import { useCoach } from '../../store/coach';
import useVoices from '../../hooks/useVoices';
import { hasSpeech, pickDefaultVoice, speak } from '../../lib/narration';
import { DRILLS } from '../../data/drills';

function voiceLabel(voice) {
  const lang = voice.lang ? ` (${voice.lang})` : '';
  return `${voice.name}${lang}`;
}

export function VoicePicker() {
  const voice = useCoach((s) => s.voice);
  const setVoice = useCoach((s) => s.setVoice);
  const drill = useCoach((s) => s.drill);
  const voices = useVoices();

  if (!hasSpeech()) return null;

  const auto = pickDefaultVoice(voices);
  const known = voice && voices.some((v) => v.voiceURI === voice);

  const onChange = (e) => {
    const next = e.target.value || null;
    setVoice(next);
    speak(DRILLS[drill].narration, { voiceURI: next });
  };

  return (
    <label className="inline-flex h-11 max-w-full shrink-0 items-center gap-2 rounded-md bg-surface-2 px-3 text-sm text-fg">
      <span className="text-muted">Voice</span>
      <select
        aria-label="Narration voice"
        value={known ? voice : ''}
        onChange={onChange}
        className="max-w-[14rem] truncate bg-transparent text-sm font-medium text-fg outline-none"
      >
        <option value="">{auto ? `Auto · ${auto.name}` : 'Auto'}</option>
        {voices.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {voiceLabel(v)}
          </option>
        ))}
      </select>
    </label>
  );
}
