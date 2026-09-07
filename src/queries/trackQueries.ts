import { useQuery } from "@tanstack/react-query";

import { spotifyApi } from "../auth";
import { SeedAttributes, Track } from "../types";
import {
  generateRecommendedTrackUrl,
  getTrackAndArtistFeatures,
  getTracksFromSpotify,
} from "../utils/requestUtils";
import { EPHEMERAL_GC_TIME, queryClient } from "./queryClient";

export const useRecommendedTracks = (
  seedTrack: Track | null | undefined,
  seedAttributes: SeedAttributes,
  matchRecsToSeedTrackKey: boolean
) =>
  useQuery({
    queryKey: ["recommendations", seedTrack?.id, seedAttributes, matchRecsToSeedTrackKey] as const,
    enabled: !!seedTrack,
    staleTime: 60 * 60 * 1000,
    gcTime: EPHEMERAL_GC_TIME,
    queryFn: async (): Promise<Track[]> => {
      const track = seedTrack!;
      let rawTracks: any[] = [];

      if (matchRecsToSeedTrackKey) {
        const sameKeyUrl = generateRecommendedTrackUrl(
          track.id,
          seedAttributes,
          25,
          track.key,
          track.mode
        );
        const relativeKeyUrl = generateRecommendedTrackUrl(
          track.id,
          seedAttributes,
          15,
          track.parsedKeys[2][0],
          track.parsedKeys[2][1]
        );

        const [sameKeyTracks, relativeKeyTracks] = await Promise.all([
          getTracksFromSpotify(sameKeyUrl),
          getTracksFromSpotify(relativeKeyUrl),
        ]);
        rawTracks = [...sameKeyTracks, ...relativeKeyTracks];
      } else {
        rawTracks = await getTracksFromSpotify(
          `recommendations?market=AU&seed_tracks=${track.id}&limit=40`
        );
      }

      // remove duplicates (result of multiple calls)
      const filteredRawTracks = rawTracks.reduce((accumulator, current) => {
        if (current && !accumulator.find((el) => el.id === current.id)) accumulator.push(current);
        return accumulator;
      }, []);

      return getTrackAndArtistFeatures(filteredRawTracks);
    },
  });

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
