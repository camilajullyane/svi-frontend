import type { User } from '../types/auth';

const TOKEN_KEY = 'svi.auth.token';
const USER_KEY = 'svi.auth.user';

export interface StoredSession {
  token: string | null;
  user: User | null;
}

export function readStoredSession(): StoredSession {
  const token = window.localStorage.getItem(TOKEN_KEY);
  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!token || !rawUser) {
    return { token: null, user: null };
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser) as User,
    };
  } catch {
    clearStoredSession();
    return { token: null, user: null };
  }
}

export function persistSession(session: { token: string; user: User }) {
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearStoredSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}
