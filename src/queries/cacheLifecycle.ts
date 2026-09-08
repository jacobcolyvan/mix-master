// Bootstrap auth before restoring private data, then subscribe to persistence.
// Logout clears memory and drains this tab's writes before deleting storage.
// BroadcastChannel coordinates active tabs only: suspended tabs and cross-tab
// writes are not fully covered; shared IndexedDB remains last-writer-wins.

import { defaultShouldDehydrateQuery, hydrate, QueryClient } from "@tanstack/react-query";
import { persistQueryClientSubscribe } from "@tanstack/react-query-persist-client";

import { CACHE_BUSTER, CachePersister, PERSIST_MAX_AGE, reportCacheFailure } from "./persister";

interface CacheAuth {
  bootstrap: () => Promise<void>;
  subscribe: (listener: (token: string) => void) => () => void;
  logout: () => void;
}

const openLogoutChannel = (): BroadcastChannel | undefined => {
  try {
    return typeof BroadcastChannel === "undefined"
      ? undefined
      : new BroadcastChannel("mix-master-logout");
  } catch {
    return undefined;
  }
};

interface CacheLifecycleOptions {
  client: QueryClient;
  persister: CachePersister;
  auth: CacheAuth;
}

export const startCacheLifecycle = ({ client, persister, auth }: CacheLifecycleOptions) => {
  let signedIn = false;
  let invalidated = false;
  let handlingPeerLogout = false;
  let unsubscribePersistence = () => {};
  const channel = openLogoutChannel();

  const clearSessionCache = () => {
    invalidated = true;
    unsubscribePersistence();
    client.clear();
    return persister.removeClient();
  };

  const unsubscribeAuth = auth.subscribe((token) => {
    signedIn = !!token;
    if (!signedIn) {
      clearSessionCache();
      // Notify other active tabs, unless this logout came from one of them.
      if (!handlingPeerLogout) {
        channel?.postMessage("logout");
      }
    }
  });

  // A peer logout uses our normal auth cleanup without broadcasting it back.
  if (channel) {
    channel.onmessage = (event) => {
      if (event.data !== "logout") return;
      handlingPeerLogout = true;
      try {
        auth.logout();
      } finally {
        handlingPeerLogout = false;
      }
    };
  }

  const persistenceOptions = {
    queryClient: client,
    persister,
    buster: CACHE_BUSTER,
    dehydrateOptions: {
      shouldDehydrateQuery: (query: Parameters<typeof defaultShouldDehydrateQuery>[0]) =>
        defaultShouldDehydrateQuery(query) &&
        !["search", "recommendations"].includes(String(query.queryKey[0])),
    },
  };

  async function restoreSessionCache() {
    await auth.bootstrap();
    if (invalidated) return;
    if (!signedIn) {
      await clearSessionCache();
      return;
    }
    const saved = await persister.restoreClient();
    // Local or peer logout may have invalidated the session during the storage read.
    if (invalidated) return;
    if (saved) {
      if (
        saved.buster === CACHE_BUSTER &&
        saved.timestamp &&
        Date.now() - saved.timestamp <= PERSIST_MAX_AGE
      ) {
        hydrate(client, saved.clientState);
      } else {
        await persister.removeClient();
      }
    }
    if (invalidated) return;
    persister.start();
    unsubscribePersistence = persistQueryClientSubscribe(persistenceOptions);
  }

  const ready = restoreSessionCache().catch(reportCacheFailure);

  return {
    ready,
    dispose: () => {
      invalidated = true;
      unsubscribeAuth();
      unsubscribePersistence();
      channel?.close();
      return persister.stop();
    },
  };
};
