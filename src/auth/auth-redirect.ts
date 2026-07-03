const AUTH_REDIRECT_KEY = 'svi.auth.redirectTo';

function isSafeRedirect(value: string | null) {
  return Boolean(value?.startsWith('/') && !value.startsWith('//'));
}

export function setAuthRedirect(value: string) {
  if (isSafeRedirect(value) && value !== '/login' && value !== '/register') {
    window.sessionStorage.setItem(AUTH_REDIRECT_KEY, value);
  }
}

export function consumeAuthRedirect() {
  const value = window.sessionStorage.getItem(AUTH_REDIRECT_KEY);
  window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);

  return isSafeRedirect(value) ? value : null;
}
