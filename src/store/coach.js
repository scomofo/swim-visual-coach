import { create } from 'zustand';
import { DRILLS, DRILL_ORDER } from '../data/drills';
import { IDLE_DRAG } from '../lib/swim/drag';
import { loadStoredVoice, storeVoice } from '../lib/narration';

export const PROGRESS_KEY = 'swim-visual-coach-progress-v3';
export const LEGACY_PROGRESS_KEY = 'swim-visual-coach-progress-v2';
export const ONBOARD_KEY = 'swim-visual-coach-onboard-v1';

function readProgress(key) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(key));
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
    return Object.fromEntries(
      DRILL_ORDER.filter((id) => stored[id] === true).map((id) => [id, true]),
    );
  } catch {
    return {};
  }
}

export const useCoach = create((set, get) => ({
  drill: 'superman',
  mode: 'correct',
  playing: true,
  reducedMotion: false,
  speed: 1,
  camera: 'quarter',
  ghost: false,
  guides: true,
  audio: false,
  voice: null,
  focus: false,
  highlight: null,
  completed: {},
  showOnboarding: false,
  celebration: false,
  hudPhase: 'Streamline',
  hudSpl: 0,
  hudDrag: IDLE_DRAG,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated || typeof window === 'undefined') return;
    // Keep v2 as a recovery copy, and merge it with mastery earned since the
    // redesign. The old v1 records included drills that were merely opened.
    const completed = { ...readProgress(LEGACY_PROGRESS_KEY), ...readProgress(PROGRESS_KEY) };
    let showOnboarding = true;
    try {
      showOnboarding = window.localStorage.getItem(ONBOARD_KEY) !== '1';
    } catch {
      // Storage restrictions must not prevent practice in memory.
    }
    set({
      hydrated: true,
      completed,
      showOnboarding: localStorage.getItem(ONBOARD_KEY) !== '1',
      voice: loadStoredVoice(),
    });
  },
  setDrill: (id) =>
    set({
      drill: id,
      highlight: null,
      camera: id === 'comparison' ? 'quarter' : get().camera,
    }),
  setMode: (mode) => set({ mode }),
  setPlaying: (playing) => set({ playing }),
  setReducedMotion: (reducedMotion) =>
    set({ reducedMotion, ...(reducedMotion ? { playing: false } : {}) }),
  togglePlaying: () => set({ playing: !get().playing }),
  setSpeed: (speed) => set({ speed }),
  setCamera: (camera) => set({ camera }),
  setGhost: (ghost) => set({ ghost }),
  setGuides: (guides) => set({ guides }),
  setAudio: (audio) => set({ audio }),
  setVoice: (voice) => {
    const next = voice || null;
    set({ voice: next });
    storeVoice(next);
  },
  setFocus: (focus) => set({ focus }),
  setHighlight: (cue) => set({ highlight: cue }),
  markComplete: (id) => {
    const key = id ?? get().drill;
    const already = Boolean(get().completed[key]);
    const completed = { ...get().completed, [key]: true };
    set({ completed, celebration: !already });
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
    } catch {
      /* ignore quota */
    }
    if (!already) {
      window.setTimeout(() => {
        if (useCoach.getState().celebration) {
          useCoach.setState({ celebration: false });
        }
      }, 2200);
    }
  },
  closeOnboarding: () => {
    set({ showOnboarding: false });
    try {
      localStorage.setItem(ONBOARD_KEY, '1');
    } catch {
      /* ignore quota */
    }
  },
  setHud: (hudPhase, hudSpl, hudDrag) => set({ hudPhase, hudSpl, hudDrag }),
}));

export function currentDrill() {
  return DRILLS[useCoach.getState().drill];
}
