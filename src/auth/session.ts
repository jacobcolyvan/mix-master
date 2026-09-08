// Credentials live only here and in the auth cookie. This module stays independent
// of React, Redux and Query; consumers observe session changes via subscribe().

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
  getInitialAccessToken,
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

// Seed the in-memory token from a still-valid cookie before async bootstrap.
let accessToken = getInitialAccessToken();
let logoutGeneration = 0;

export const isSignedIn = (): boolean => !!accessToken;
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

  const generation = logoutGeneration;
  refreshPromise = (async () => {
    const refreshToken = readAuthCookie()?.refreshToken;
    if (!refreshToken) {
      logout("session_expired");
      return null;
    }

    const tokens = await refreshAccessToken(refreshToken);
    if (generation !== logoutGeneration) return null;
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
  const generation = logoutGeneration;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    const tokens = await exchangeCodeForToken(code, params.get("state"));
    if (generation !== logoutGeneration) return;
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

// Clears auth state and notifies subscribers. A reason sets ?reason= on / for
// the login screen to read.
export const logout = (reason?: LogoutReason) => {
  // A late refresh or code exchange must not sign this tab back in.
  logoutGeneration += 1;
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
