export type Theme = 'light' | 'dark';

const KEY = 'techx.theme';

export function readTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function writeTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme);
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset['theme'] = theme;
}
