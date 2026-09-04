import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { IDLE_DRAG } from '../lib/swim/drag';
import { useCoach } from '../store/coach';

vi.mock('../components/pool/PoolCanvas', () => ({
  PoolCanvas: () => null,
}));

export function createMatchMedia(matches = false) {
  return vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: createMatchMedia(false),
});

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.matchMedia = createMatchMedia(false);
  useCoach.setState({
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
  });
});
