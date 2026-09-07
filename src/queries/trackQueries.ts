import { useQuery } from "@tanstack/react-query";

import { spotifyApi } from "../auth";
import { SeedAttributes, Track } from "../types";
import {
  generateRecommendedTrackUrl,
  getTrackAndArtistFeatures,
  getTracksFromSpotify,
} from "../utils/requestUtils";
import { EPHEMERAL_GC_TIME, queryClient } from "./queryClient";

const recommendationRequestUrls = (
  seedTrack: Track | null | undefined,
  seedAttributes: SeedAttributes,
  matchKey: boolean
) => {
  if (!seedTrack) return [];
  if (!matchKey) return [generateRecommendedTrackUrl(seedTrack.id, seedAttributes, 40)];

  // Each request targets one key/mode: blend same-key and relative major/minor tracks
  // for harmonic compatibility, favouring the seed's own key with a 25/15 split.
  const sameKeyUrl = generateRecommendedTrackUrl(
    seedTrack.id,
    seedAttributes,
    25,
    seedTrack.key,
    seedTrack.mode
  );
  const relativeKeyUrl = generateRecommendedTrackUrl(
    seedTrack.id,
    seedAttributes,
    15,
    ...seedTrack.parsedKeys[2]
  );
  return [sameKeyUrl, relativeKeyUrl];
};

export const useRecommendedTracks = (
  seedTrack: Track | null | undefined,
  seedAttributes: SeedAttributes,
  matchRecsToSeedTrackKey: boolean
) => {
  const urls = recommendationRequestUrls(seedTrack, seedAttributes, matchRecsToSeedTrackKey);
  return useQuery({
    queryKey: ["recommendations", ...urls] as const,
    enabled: !!seedTrack,
    staleTime: 60 * 60 * 1000,
    gcTime: EPHEMERAL_GC_TIME,
    queryFn: async (): Promise<Track[]> => {
      const rawTracks: any[] = (await Promise.all(urls.map(getTracksFromSpotify))).flat();

      // remove duplicates (result of multiple calls)
      const filteredRawTracks = rawTracks.reduce((accumulator, current) => {
        if (current && !accumulator.find((el) => el.id === current.id)) accumulator.push(current);
        return accumulator;
      }, []);

      return getTrackAndArtistFeatures(filteredRawTracks);
    },
  });
};

export const seedTrackKey = (id: string) => ["track", id] as const;

// Null means Spotify has no audio analysis, not a failed request.
export const useSeedTrack = (trackId: string | null) =>
  useQuery({
    queryKey: seedTrackKey(trackId ?? ""),
    enabled: !!trackId,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async (): Promise<Track | null> => {
      const response = await spotifyApi.get(`tracks/${encodeURIComponent(trackId!)}`);
      const [track] = await getTrackAndArtistFeatures([response.data]);
      return track ?? null;
    },
  });

/** Prime the seed-track cache from a Track we already hold, before navigating. */
export const cacheSeedTrack = (track: Track) => {
  queryClient.setQueryData(seedTrackKey(track.id), track);
};
