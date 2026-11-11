// js/auth.js
import { api, setTokens, refreshTokens, getRefreshToken } from './api.js';

export async function register(username, email, password) {
  setTokens(await api('/auth/register', {
    method: 'POST',
    body: { username, email, password },
    auth: false,
  }));
}

export async function login(email, password) {
  setTokens(await api('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  }));
}

export async function logout() {
  const refresh_token = getRefreshToken();
  if (refresh_token) {
    await api('/auth/logout', { method: 'POST', body: { refresh_token }, auth: false }).catch(() => {});
  }
  setTokens(null);
}

export async function bootstrap() {
  if (!(await refreshTokens())) return null;
  return api('/me');
}

export const getMe = () => api('/me');
export const updateMe = (changes) => api('/me', { method: 'PATCH', body: changes });