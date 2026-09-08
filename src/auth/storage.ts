import Cookies from "js-cookie";

// Single source of truth for auth persistence. The whole session lives in one
// JSON cookie plus the transient PKCE values in localStorage.

const AUTH_COOKIE = "spotify_auth";
export const PKCE_VERIFIER_KEY = "pkce_code_verifier";
export const OAUTH_STATE_KEY = "oauth_state";

const AUTH_COOKIE_BASE = {
  path: "/",
  secure: import.meta.env.PROD,
  sameSite: "lax" as const,
};

// Refresh slightly before the access token actually expires.
export const TOKEN_EXPIRY_BUFFER_MS = 60_000;

// Shape persisted in the cookie (absolute expiry, not relative).
export type StoredAuth = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

// Shape returned by the token endpoint (relative expiry in seconds).
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export const readAuthCookie = (): StoredAuth | null => {
  const raw = Cookies.get(AUTH_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return parsed as StoredAuth;
  } catch {
    return null;
  }
};

export const writeAuthCookie = (tokens: TokenPair) => {
  const stored: StoredAuth = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  };
  // NOTE: a backendless SPA cannot use HttpOnly cookies, so the long-lived
  // refresh token is necessarily readable by JS. This is an accepted tradeoff
  // of the no-server architecture (see AGENTS.md). Cookie lifetime tracks the
  // refresh token (7 days); access-token validity is the inner `expiresAt`.
  Cookies.set(AUTH_COOKIE, JSON.stringify(stored), { ...AUTH_COOKIE_BASE, expires: 7 });
};

export const clearAuthStorage = () => {
  Cookies.remove(AUTH_COOKIE, { path: "/" });
  localStorage.removeItem(PKCE_VERIFIER_KEY);
  localStorage.removeItem(OAUTH_STATE_KEY);
};

export const isAccessTokenValid = (stored: StoredAuth | null): stored is StoredAuth => {
  return !!stored?.accessToken && Date.now() < stored.expiresAt - TOKEN_EXPIRY_BUFFER_MS;
};

export const getInitialAccessToken = (): string => {
  const stored = readAuthCookie();
  return isAccessTokenValid(stored) ? stored.accessToken : "";
};
