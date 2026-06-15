// The auth source of truth. Self-contained: imports only the OAuth helpers and
// the storage layer — nothing from app/ or slices/ — so it sits at the bottom of
// the dependency graph and breaks the old store <-> slice cycle. Redux merely
// mirrors the token via subscribe() (see index.tsx).

import {
  buildAuthorizeUrl,
  createSpotifyApi,
  exchangeCodeForToken,
  refreshAccessToken,
  SpotifyTokenPair,
} from "./oauth";
import { LogoutReason } from "./reasons";
import {
  clearAuthStorage,
  getInitialAuthState,
  isAccessTokenValid,
  readAuthCookie,
  writeAuthCookie,
} from "./storage";

const setLogoutReasonInUrl = (reason: LogoutReason) => {
  const url = new URL(window.location.href);
  url.pathname = "/";
  url.searchParams.set("reason", reason);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
};

const hadActiveSession = () => !!accessToken || !!readAuthCookie();

// In-memory access token, seeded synchronously at module load so the common
// (already-logged-in) path renders without a Loading flash.
let accessToken = getInitialAuthState().spotifyToken;

// Tiny observer so consumers (Redux) can mirror token changes for re-render.
type Listener = (token: string) => void;
const listeners = new Set<Listener>();

export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => {
  listeners.forEach((listener) => listener(accessToken));
};

const setToken = (token: string) => {
  accessToken = token;
  notify();
};

// Persist a freshly minted token pair to cookie + in-memory state.
const setSession = (tokens: SpotifyTokenPair) => {
  writeAuthCookie(tokens);
  setToken(tokens.accessToken);
};

// Single-flight: every caller (interceptor, bootstrap, dev button) shares one
// in-flight refresh so concurrent requests can't race on refresh-token rotation.
let refreshPromise: Promise<string | null> | null = null;

export const refresh = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = readAuthCookie()?.refreshToken;
    if (!refreshToken) {
      logout("session_expired");
      return null;
    }

    const tokens = await refreshAccessToken(refreshToken);
    if (!tokens) {
      logout("session_expired");
      return null;
    }

    setSession(tokens);
    return tokens.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const bootstrap = async (): Promise<void> => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    const tokens = await exchangeCodeForToken(code, params.get("state"));
    // Strip the ?code= regardless of outcome so a reload never reuses a dead code.
    window.history.replaceState({}, "", window.location.pathname);
    if (tokens) {
      setSession(tokens);
      return;
    }
    // Exchange failed — fall through to any still-valid cookie session.
  }

  const stored = readAuthCookie();
  if (!stored) return;
  const { accessToken, refreshToken } = stored;

  if (isAccessTokenValid(stored)) {
    setToken(accessToken);
  } else if (refreshToken) {
    await refresh();
  } else {
    logout("session_expired");
  }
};

export const login = async () => {
  window.location.href = await buildAuthorizeUrl();
};

// UI-agnostic: clears auth state only. Username/UI concerns are handled by the
// subscribe listener in index.tsx. Logouts with a reason set ?reason= on / for
// the login screen to read.
export const logout = (reason?: LogoutReason) => {
  if (reason && hadActiveSession()) {
    setLogoutReasonInUrl(reason);
  }
  clearAuthStorage();
  setToken("");
};

// The single authenticated Spotify client. Defined after the functions above so
// the auth provider closes over them.
export const spotifyApi = createSpotifyApi({
  getAccessToken: () => accessToken,
  refreshAccessToken: refresh,
  onAuthFailure: () => logout("unauthorized"),
});
