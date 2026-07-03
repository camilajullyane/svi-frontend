import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loginRequest, registerRequest } from '../api/auth';
import {
  clearStoredSession,
  persistSession,
  readStoredSession,
  type StoredSession,
} from './auth-storage';
import { AuthContext, type AuthContextValue } from './AuthContext';
import type { LoginPayload, RegisterPayload } from '../types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession>(() => readStoredSession());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsInitializing(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const auth = await loginRequest(payload);
    persistSession(auth);
    setSession(auth);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const auth = await registerRequest(payload);
    persistSession(auth);
    setSession(auth);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession({ token: null, user: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session.user,
      token: session.token,
      isAuthenticated: Boolean(session.user && session.token),
      isInitializing,
      login,
      register,
      logout,
    }),
    [isInitializing, login, logout, register, session.token, session.user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
