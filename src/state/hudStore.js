import { useSyncExternalStore } from 'react';
import { IDLE_DRAG } from '../lib/swim/drag';

// Tiny external store for hydrodynamic HUD.
// PoolCanvas publishes at ~7.5Hz; subscribers re-render independently
// so App no longer re-renders the whole tree on every HUD tick.

let snapshot = { drag: IDLE_DRAG, phase: null, spl: null, updatedAt: 0 };
const listeners = new Set();
let lastPublish = 0;

const MIN_INTERVAL_MS = 350;
const MIN_DELTA = 0.015;

function notify() {
  for (const listener of listeners) listener();
}

export function publishHudDrag(drag, phase = null, spl = null) {
  if (!drag) return;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const prevTotal = snapshot.drag?.total ?? 0;
  const nextTotal = drag.total ?? 0;
  const delta = Math.abs(nextTotal - prevTotal);
  const phaseChanged = phase !== snapshot.phase;

  if (!phaseChanged && delta < MIN_DELTA && now - lastPublish < MIN_INTERVAL_MS) {
    return;
  }
  lastPublish = now;
  snapshot = { drag, phase, spl, updatedAt: now };
  notify();
}

export function getHudSnapshot() {
  return snapshot;
}

export function subscribeHud(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useHud() {
  return useSyncExternalStore(subscribeHud, getHudSnapshot, getHudSnapshot);
}

export function useHudDrag() {
  return useHud().drag ?? IDLE_DRAG;
}

export function resetHudForTests() {
  snapshot = { drag: IDLE_DRAG, phase: null, spl: null, updatedAt: 0 };
  lastPublish = 0;
}
