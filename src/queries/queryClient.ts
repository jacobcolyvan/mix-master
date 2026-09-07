import { QueryClient } from "@tanstack/react-query";

// Keep unused queries in memory for 24 hours; must stay >= persistence maxAge.
export const DEFAULT_GC_TIME = 1000 * 60 * 60 * 24;

// Search and recommendations are memory-only; discard them after 30 minutes unused.
export const EPHEMERAL_GC_TIME = 1000 * 60 * 30;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // spotifyApi already handles 401/429 retries.
      retry: false,
      refetchOnWindowFocus: false,
      gcTime: DEFAULT_GC_TIME,
    },
  },
});
