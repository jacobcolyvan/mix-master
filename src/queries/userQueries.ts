import { useQuery } from "@tanstack/react-query";

import { spotifyApi } from "../auth";
import { CurrentUser } from "../types";

// Profile names change infrequently. Successful reads share the persisted 24h cache.
export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"] as const,
    staleTime: 1000 * 60 * 60,
    queryFn: async ({ signal }): Promise<CurrentUser> => {
      const response = await spotifyApi.get<CurrentUser>("me/", { signal });
      return { display_name: response.data.display_name };
    },
  });
