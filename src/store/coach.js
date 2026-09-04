import { create } from 'zustand';
import { DRILLS } from '../data/drills';
import { IDLE_DRAG } from '../lib/swim/drag';

export const PROGRESS_KEY = 'swim-visual-coach-progress-v3';
export const ONBOARD_KEY = 'swim-visual-coach-onboard-v1';

export const useCoach = create((set, get) => ({
  drill: 'superman',
  mode: 'correct',
  playing: true,
  speed: 1,
  camera: 'quarter',
  ghost: false,
  guides: true,
  audio: false,
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
    let completed = {};
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) completed = JSON.parse(raw);
    } catch {
      completed = {};
    }
    set({
      hydrated: true,
      completed,
      showOnboarding: localStorage.getItem(ONBOARD_KEY) !== '1',
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
  togglePlaying: () => set({ playing: !get().playing }),
  setSpeed: (speed) => set({ speed }),
  setCamera: (camera) => set({ camera }),
  setGhost: (ghost) => set({ ghost }),
  setGuides: (guides) => set({ guides }),
  setAudio: (audio) => set({ audio }),
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
