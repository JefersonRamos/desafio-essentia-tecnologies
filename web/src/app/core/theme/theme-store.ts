import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { applyTheme, readTheme, writeTheme, type Theme } from './theme-storage';

export const ThemeStore = signalStore(
  { providedIn: 'root' },

  withState<{ theme: Theme }>({ theme: readTheme() }),

  withComputed(({ theme }) => ({
    isDark: computed(() => theme() === 'dark'),
  })),

  withMethods((store) => ({
    toggle(): void {
      const next: Theme = store.theme() === 'dark' ? 'light' : 'dark';

      writeTheme(next);
      applyTheme(next);
      patchState(store, { theme: next });
    },
  })),

  withHooks({
    onInit(store) {
      applyTheme(store.theme());
    },
  }),
);
