import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { OAUTH_STATE_KEY, PKCE_VERIFIER_KEY } from "./storage";

// ----------------------------------------------------------------------------
// PKCE / OAuth token exchange

const scopes = ["user-read-private", "playlist-read-private", "user-library-read", "user-top-read"];

const generateCodeVerifier = (length = 128) => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const generateCodeChallenge = async (verifier: string) => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export type SpotifyTokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export const buildAuthorizeUrl = async () => {
  const codeVerifier = generateCodeVerifier();
  const state = generateCodeVerifier(32);
  localStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
  localStorage.setItem(OAUTH_STATE_KEY, state);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return (
    `https://accounts.spotify.com/authorize?response_type=code` +
    `&client_id=${import.meta.env.VITE_SPOTIFY_CLIENT_ID || ""}` +
    `&scope=${scopes.join("%20")}` +
    `&redirect_uri=${encodeURIComponent(import.meta.env.VITE_SPOTIFY_CALLBACK_URI || "")}` +
    `&code_challenge_method=S256` +
    `&code_challenge=${codeChallenge}` +
    `&state=${state}` +
    `&show_dialog=false`
  );
};

// Single entry point for both grant types — same endpoint, headers and error
// handling; callers only differ in the grant-specific form fields.
const postTokenRequest = async (params: Record<string, string>) => {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Spotify token request failed:", err.error_description ?? err);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error("Spotify token request network error:", err);
    return null;
  }
};

export const exchangeCodeForToken = async (
  code: string,
  state: string | null
): Promise<SpotifyTokenPair | null> => {
  const storedState = localStorage.getItem(OAUTH_STATE_KEY);
  if (!state || !storedState || state !== storedState) return null;

  const codeVerifier = localStorage.getItem(PKCE_VERIFIER_KEY);
  if (!codeVerifier) return null;

  try {
    const data = await postTokenRequest({
      grant_type: "authorization_code",
      code,
      redirect_uri: import.meta.env.VITE_SPOTIFY_CALLBACK_URI || "",
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID || "",
      code_verifier: codeVerifier,
    });
    if (!data?.access_token || !data?.refresh_token) return null;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in || 3600,
    };
  } finally {
    localStorage.removeItem(PKCE_VERIFIER_KEY);
    localStorage.removeItem(OAUTH_STATE_KEY);
  }
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<SpotifyTokenPair | null> => {
  const data = await postTokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID || "",
  });
  if (!data?.access_token) return null;
  return {
    accessToken: data.access_token,
    // Spotify may or may not rotate the refresh token; keep the old one if not.
    refreshToken: data.refresh_token ?? refreshToken,
    expiresIn: data.expires_in || 3600,
  };
};

// ----------------------------------------------------------------------------
// Authenticated API client

export type SpotifyApiAuth = {
  getAccessToken: () => string;
  // Returns a fresh access token, or null if the session can't be renewed.
  // Concurrency/single-flight is the caller's responsibility (see the slice).
  refreshAccessToken: () => Promise<string | null>;
  onAuthFailure: () => void;
};

export const createSpotifyApi = (auth: SpotifyApiAuth): AxiosInstance => {
  const instance = axios.create({
    baseURL: "https://api.spotify.com/v1/",
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = auth.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status !== 401 || !originalRequest) {
        return Promise.reject(error);
      }

      // Already retried with a fresh token and still got 401 → give up & sign out.
      if (originalRequest._retry) {
        auth.onAuthFailure();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const newToken = await auth.refreshAccessToken();
      if (!newToken) {
        auth.onAuthFailure();
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return instance.request(originalRequest);
    }
  );

  return instance;
};
