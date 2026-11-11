// js/api.js
import { API_URL, SITE_KEY } from './config.js';

const REFRESH_KEY = `blog_refresh_${SITE_KEY}`;

export class ApiError extends Error {
  constructor(status, code, message, details, requestId) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

let accessToken = null;
let refreshing = null;

export function setTokens(tokens) {
  accessToken = tokens ? tokens.access_token : null;
  if (tokens) localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  else localStorage.removeItem(REFRESH_KEY);
}

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const hasSession = () => !!getRefreshToken();

export function refreshTokens() {
  if (!refreshing) {
    refreshing = (async () => {
      const refresh_token = getRefreshToken();
      if (!refresh_token) return false;

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'X-Site-Key': SITE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token }),
      });

      if (!res.ok) {
        setTokens(null);
        return false;
      }

      setTokens(await res.json());
      return true;
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

export async function api(path, opts = {}, retried = false) {
  const { body, query, auth = true, headers = {}, ...init } = opts;
  
  // ВАЖНО: склеиваем API_URL + path и используем window.location.origin как базу
  const fullUrl = API_URL + path;
  const url = new URL(fullUrl, window.location.origin);
  
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  }

  const h = { 'X-Site-Key': SITE_KEY, ...headers };
  if (body !== undefined) h['Content-Type'] = 'application/json';
  if (auth && accessToken) h.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(url, {
    ...init,
    headers: h,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !retried && hasSession()) {
    await refreshTokens();
    return api(path, opts, true);
  }

  if (!res.ok) {
    const e = await res.json().catch(() => null);
    const err = e && e.error;
    throw new ApiError(
      res.status,
      err ? err.code : 'network_error',
      err ? err.message : res.statusText,
      err ? err.details : null,
      err ? err.request_id : res.headers.get('X-Request-ID'),
    );
  }

  return res.status === 204 ? null : res.json();
}

export const etagOf = (article) => `"${article.version}"`;