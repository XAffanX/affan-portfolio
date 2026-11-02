'use client';

import { useSyncExternalStore } from 'react';
import type { CategoryId } from '@/data/projects';

export interface UIState {
  hovered: CategoryId | null;   // chip under the pointer (board or nav)
  selected: CategoryId | null;  // category whose panel is open
  project: string | null;       // project detail open inside the panel
  pulseTick: number;            // bumps when a chip is clicked, for a burst of signal
  resetTick: number;            // bumps when the camera should return to the default view
}

let state: UIState = { hovered: null, selected: null, project: null, pulseTick: 0, resetTick: 0 };
const listeners = new Set<() => void>();

function set(patch: Partial<UIState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const store = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  hover: (id: CategoryId | null) => {
    if (state.hovered !== id) set({ hovered: id });
  },
  select: (id: CategoryId) => set({ selected: id, project: null, pulseTick: state.pulseTick + 1 }),
  openProject: (slug: string) => set({ project: slug }),
  back: () => set({ project: null }),
  close: () => set({ selected: null, project: null, resetTick: state.resetTick + 1 }),
};

export function useUI<T>(pick: (s: UIState) => T): T {
  return useSyncExternalStore(store.subscribe, () => pick(state), () => pick(state));
}
