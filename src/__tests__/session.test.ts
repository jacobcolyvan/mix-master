// @vitest-environment jsdom
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { bootstrap, isSignedIn, logout, subscribe } from "../auth/session";
import {
  OAUTH_STATE_KEY,
  PKCE_VERIFIER_KEY,
  readAuthCookie,
  writeAuthCookie,
} from "../auth/storage";
import { startCacheLifecycle } from "../queries/cacheLifecycle";
import { CACHE_BUSTER, createCachePersister } from "../queries/persister";
import { deferred } from "./helpers/deferred";

beforeEach(() => {
  // Exercise real auth without sending logout messages outside this test.
  vi.stubGlobal("BroadcastChannel", undefined);
  logout();
  window.history.replaceState({}, "", "/");
});
afterEach(() => {
  logout();
  vi.unstubAllGlobals();
});

// Hold only the HTTP response so real auth/storage code runs on both sides of logout.
const delayedTokenResponse = () => {
  const response = deferred<Response>();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => response.promise)
  );
  return () =>
    response.resolve(
      new Response(
        JSON.stringify({
          access_token: "new-access",
          refresh_token: "new-refresh",
          expires_in: 3600,
        }),
        { status: 200 }
      )
    );
};

it.each(["refresh", "code exchange"])(
  "does not revive auth when a %s finishes after logout",
  async (operation) => {
    const finish = delayedTokenResponse();
    if (operation === "refresh") {
      writeAuthCookie({ accessToken: "expired", refreshToken: "refresh", expiresIn: -1 });
    } else {
      window.history.replaceState({}, "", "/?code=code&state=state");
      localStorage.setItem(OAUTH_STATE_KEY, "state");
      localStorage.setItem(PKCE_VERIFIER_KEY, "verifier");
    }
    const tokens: string[] = [];
    const unsubscribe = subscribe((token) => tokens.push(token));

    try {
      const bootstrapping = bootstrap();
      logout();
      finish();
      await bootstrapping;

      expect(readAuthCookie()).toBeNull();
      expect(isSignedIn()).toBe(false);
      expect(tokens).toEqual([""]);
    } finally {
      unsubscribe();
    }
  }
);

it("restores the cache after an expired-cookie bootstrap successfully refreshes", async () => {
  writeAuthCookie({ accessToken: "expired", refreshToken: "refresh", expiresIn: -1 });
  const finish = delayedTokenResponse();
  const previous = new QueryClient();
  previous.setQueryData(["playlists"], ["Returning user's playlist"]);
  const saved = { buster: CACHE_BUSTER, timestamp: Date.now(), clientState: dehydrate(previous) };
  previous.clear();
  const client = new QueryClient();
  const lifecycle = startCacheLifecycle({
    client,
    // Supply an existing disk snapshot without opening IndexedDB in jsdom.
    persister: createCachePersister({
      get: async () => saved,
      set: async () => {},
      remove: async () => {},
    }),
    auth: { bootstrap, subscribe, logout },
  });

  try {
    expect(client.getQueryData(["playlists"])).toBeUndefined();

    finish();
    await lifecycle.ready;

    expect(isSignedIn()).toBe(true);
    expect(client.getQueryData(["playlists"])).toEqual(["Returning user's playlist"]);
  } finally {
    await lifecycle.dispose();
    client.clear();
  }
});
