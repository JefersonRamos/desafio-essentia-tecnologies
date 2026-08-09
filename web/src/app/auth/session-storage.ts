import type { Session } from './auth.model';

const KEY = 'techx.session';

export function readSession(): Session | null {
  try {
    const stored = localStorage.getItem(KEY);

    return stored ? (JSON.parse(stored) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}
