// @vitest-environment jsdom
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { PersistedClient } from "@tanstack/react-query-persist-client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { startCacheLifecycle } from "../queries/cacheLifecycle";
import { CACHE_BUSTER, CacheStorage, createCachePersister } from "../queries/persister";
import { deferred } from "./helpers/deferred";

const savedCache = (): PersistedClient => {
  const client = new QueryClient();
  client.setQueryData(["playlists"], ["Saved private playlist"]);
  client.setQueryData(["currentUser"], { display_name: "Saved DJ" });
  const saved = { buster: CACHE_BUSTER, timestamp: Date.now(), clientState: dehydrate(client) };
  client.clear();
  return saved;
};

// Replace IndexedDB, but keep the real persister and QueryClient behaviour.
const memoryStorage = (initial?: PersistedClient) => {
  let value = initial;
  const storage: CacheStorage = {
    get: async () => value,
    set: async (next) => {
      value = next;
    },
    remove: async () => {
      value = undefined;
    },
  };
  return storage;
};

// Only model token notifications here; session.test.ts exercises real refresh/exchange behaviour.
const authSession = (token = "token") => {
  const listeners = new Set<(token: string) => void>();
  const emit = (nextToken: string) => listeners.forEach((listener) => listener(nextToken));
  return {
    bootstrap: async () => {
      if (token) emit(token);
    },
    subscribe: (listener: (token: string) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    logout: () => emit(""),
  };
};

const cleanups: (() => void | Promise<void>)[] = [];
const startTestLifecycle = (storage: CacheStorage, auth = authSession()) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  const lifecycle = startCacheLifecycle({
    client,
    persister: createCachePersister(storage),
    auth,
  });
  cleanups.push(async () => {
    await lifecycle.dispose();
    client.clear();
  });
  return { ...lifecycle, client };
};

beforeEach(() => {
  // Keep tests isolated from real channels; the multi-tab test supplies its own browser stub.
  vi.stubGlobal("BroadcastChannel", undefined);
});

afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("does not expose saved data on signed-out startup", async () => {
  const storage = memoryStorage(savedCache());
  const session = startTestLifecycle(storage, authSession(""));

  await session.ready;

  expect(session.client.getQueryCache().getAll()).toEqual([]);
  expect(await storage.get()).toBeUndefined();
});

it("restores successful profile data with media data", async () => {
  const storage = memoryStorage(savedCache());
  const session = startTestLifecycle(storage);

  await session.ready;

  expect(session.client.getQueryData(["playlists"])).toEqual(["Saved private playlist"]);
  expect(session.client.getQueryData(["currentUser"])).toEqual({ display_name: "Saved DJ" });
});

it("discards restoration that finishes after logout", async () => {
  const read = deferred<PersistedClient | undefined>();
  const reading = deferred<void>();
  const saved = savedCache();
  const storage = memoryStorage(saved);
  storage.get = () => {
    reading.resolve();
    return read.promise;
  };
  const auth = authSession();
  const session = startTestLifecycle(storage, auth);
  await reading.promise;

  auth.logout();
  read.resolve(saved);
  await session.ready;

  expect(session.client.getQueryCache().getAll()).toEqual([]);
});

it("drains an active save and cancels its successor before deleting on logout", async () => {
  vi.useFakeTimers();
  const write = deferred<void>();
  const deleted = deferred<void>();
  const storage = memoryStorage();
  const set = storage.set;
  const remove = storage.remove;
  storage.set = async (snapshot) => {
    await write.promise;
    await set(snapshot);
  };
  storage.remove = async () => {
    await remove();
    deleted.resolve();
  };
  const auth = authSession();
  const session = startTestLifecycle(storage, auth);
  await session.ready;
  session.client.setQueryData(["playlists"], ["Private one"]);
  await vi.advanceTimersByTimeAsync(1000);
  session.client.setQueryData(["playlist", "two"], "Private two");

  try {
    auth.logout();

    expect(session.client.getQueryCache().getAll()).toEqual([]);

    write.resolve();
    await deleted.promise;
    await vi.advanceTimersByTimeAsync(5000);

    // Assert before disposal: disposal also cancels pending saves and could hide a broken logout.
    expect(await storage.get()).toBeUndefined();
  } finally {
    write.resolve();
  }
});

it("coalesces saves to the latest snapshot and excludes ephemeral results", async () => {
  vi.useFakeTimers();
  const storage = memoryStorage();
  const save = vi.spyOn(storage, "set");
  const session = startTestLifecycle(storage);
  await session.ready;

  session.client.setQueryData(["playlists"], ["Old"]);
  session.client.setQueryData(["playlists"], ["Latest"]);
  session.client.setQueryData(["currentUser"], { display_name: "Night DJ" });
  session.client.setQueryData(["search", { kind: "track" }], ["Search"]);
  session.client.setQueryData(["recommendations", "seed"], ["Random"]);

  expect(save).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(5000);

  expect(save).toHaveBeenCalledTimes(1);
  const saved = await storage.get();
  expect(saved?.clientState.queries.map((query) => [query.queryKey, query.state.data])).toEqual([
    [["playlists"], ["Latest"]],
    [["currentUser"], { display_name: "Night DJ" }],
  ]);
});

it("coordinates active-tab logout without rebroadcast and closes channels", async () => {
  const channels = new Set<FakeLogoutChannel>();
  const messages: string[] = [];

  // Deliver to peers synchronously for deterministic coordination; cap recursion if rebroadcast breaks.
  class FakeLogoutChannel {
    onmessage: ((event: MessageEvent) => void) | null = null;

    constructor() {
      channels.add(this);
    }

    postMessage(data: string) {
      messages.push(data);
      if (messages.length > 2) throw new Error("Broadcast loop");
      for (const peer of channels) {
        if (peer !== this) peer.onmessage?.({ data } as MessageEvent);
      }
    }

    close() {
      channels.delete(this);
    }
  }

  vi.stubGlobal("BroadcastChannel", FakeLogoutChannel);
  const storage = memoryStorage(savedCache());
  const auth = authSession();
  const first = startTestLifecycle(storage, auth);
  const peer = startTestLifecycle(storage, authSession());
  await Promise.all([first.ready, peer.ready]);

  auth.logout();

  expect(peer.client.getQueryCache().getAll()).toEqual([]);

  expect(messages).toEqual(["logout"]);

  await Promise.all([first.dispose(), peer.dispose()]);

  expect(channels.size).toBe(0);
});

it("keeps in-memory data usable when cache reads and deletion fail", async () => {
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  const storage: CacheStorage = {
    get: async () => {
      throw new Error("IndexedDB blocked");
    },
    set: async () => {},
    remove: async () => {
      throw new Error("IndexedDB blocked");
    },
  };
  const auth = authSession();
  const session = startTestLifecycle(storage, auth);
  await session.ready;

  session.client.setQueryData(["playlists"], ["In memory"]);

  expect(session.client.getQueryData(["playlists"])).toEqual(["In memory"]);

  auth.logout();

  expect(session.client.getQueryCache().getAll()).toEqual([]);
  await session.dispose();
  expect(warning).toHaveBeenCalled();
});
