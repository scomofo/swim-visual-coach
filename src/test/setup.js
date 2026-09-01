import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

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

// jsdom ships no ResizeObserver; SwimmerScene uses one to size its SVG viewBox.
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.matchMedia = createMatchMedia(false);
});
