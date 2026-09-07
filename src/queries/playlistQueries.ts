import { useQuery } from "@tanstack/react-query";

import { spotifyApi } from "../auth";
import { Playlist, Track } from "../types";
import { getTrackAndArtistFeatures } from "../utils/requestUtils";
import { fetchOffsetPages } from "../utils/spotifyFetch";

const HOUR = 1000 * 60 * 60;

export const playlistKey = (id: string) => ["playlist", id] as const;
export const playlistTracksKey = (id: string, snapshotId: string) =>
  ["playlist", "tracks", id, snapshotId] as const;

// Verify snapshot_id on mount before selecting the track cache.
export const usePlaylist = (id: string | null) =>
  useQuery({
    queryKey: playlistKey(id ?? ""),
    // Only fetch automatically once a non-empty playlist ID is available.
    enabled: !!id,
    staleTime: 0,
    queryFn: async (): Promise<Playlist> => {
      const response = await spotifyApi.get(`playlists/${encodeURIComponent(id!)}`);

      return response.data;
    },
  });

async function fetchPlaylistTracks(id: string): Promise<Track[]> {
  const allRawItems = await fetchOffsetPages<{ [key: string]: any }>(async (offset, limit) => {
    const response = await spotifyApi.get(
      `playlists/${encodeURIComponent(id)}/tracks?offset=${offset}&limit=${limit}`
    );

    return { items: response.data.items, total: response.data.total ?? 0 };
  });

  const rawTracks = allRawItems.filter((item) => item.track);

  return getTrackAndArtistFeatures(rawTracks);
}

// snapshot_id excludes enrichment; 24h freshness bounds that drift.
export const usePlaylistTracks = (id: string | null, snapshotId: string | undefined) =>
  useQuery({
    queryKey: playlistTracksKey(id ?? "", snapshotId ?? ""),
    // Wait for metadata to supply the snapshot before fetching tracks.
    enabled: !!id && !!snapshotId,
    staleTime: 24 * HOUR,
    queryFn: () => fetchPlaylistTracks(id!),
  });

export const useUserPlaylists = () =>
  useQuery({
    queryKey: ["playlists"] as const,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<Playlist[]> =>
      fetchOffsetPages<Playlist>(async (offset, limit) => {
        const response = await spotifyApi.get(`me/playlists?limit=${limit}&offset=${offset}`);

        return { items: response.data.items, total: response.data.total ?? 0 };
      }),
  });
