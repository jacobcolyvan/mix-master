// Stores query-cache snapshots in IndexedDB without JSON serialisation.
// Coalesces saves and orders deletion after this tab's outstanding writes.

import { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";

import { version } from "../../package.json";

export const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24;
const IDB_KEY = "mix-master-query-cache";
const SAVE_DELAY_MS = 1000;

// Bump when persisted data shapes or query keys change.
const CACHE_SCHEMA_VERSION = 1;
export const CACHE_BUSTER = `mix-master-${version}-${CACHE_SCHEMA_VERSION}`;

export interface CacheStorage {
  get: () => Promise<PersistedClient | undefined>;
  set: (snapshot: PersistedClient) => Promise<void>;
  remove: () => Promise<void>;
}

const indexedDbStorage: CacheStorage = {
  get: () => get<PersistedClient>(IDB_KEY),
  set: (snapshot) => set(IDB_KEY, snapshot),
  remove: () => del(IDB_KEY),
};

export const reportCacheFailure = () => {
  console.warn("Local cache storage unavailable; continuing without saved data.");
};

export const createCachePersister = (
  storage: CacheStorage = indexedDbStorage,
  onError: () => void = reportCacheFailure
) => {
  let acceptingSaves = false;
  let pendingSnapshot: PersistedClient | undefined;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  // Saves and deletion share one queue so they cannot overtake each other.
  let storageQueue = Promise.resolve();

  const queuePendingSave = () => {
    saveTimer = undefined;
    storageQueue = storageQueue
      .then(async () => {
        const snapshot = pendingSnapshot;
        pendingSnapshot = undefined;
        if (acceptingSaves && snapshot) await storage.set(snapshot);
      })
      .catch(onError);
  };

  // Discard pending saves, but let an already-started write finish.
  const stop = () => {
    acceptingSaves = false;
    clearTimeout(saveTimer);
    saveTimer = undefined;
    pendingSnapshot = undefined;
    return storageQueue;
  };

  const persister: Persister = {
    persistClient: (snapshot) => {
      if (!acceptingSaves) return;

      pendingSnapshot = snapshot;

      if (saveTimer === undefined) {
        saveTimer = setTimeout(queuePendingSave, SAVE_DELAY_MS);
      }
    },
    restoreClient: async () => {
      try {
        return await storage.get();
      } catch {
        onError();
        return undefined;
      }
    },
    removeClient: () => {
      stop();
      // Deletion is ordered after this tab's active write, never before it.
      storageQueue = storageQueue.then(() => storage.remove()).catch(onError);
      return storageQueue;
    },
  };

  return {
    ...persister,
    start: () => {
      acceptingSaves = true;
    },
    stop,
  };
};

export type CachePersister = ReturnType<typeof createCachePersister>;
