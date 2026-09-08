import { queryOptions, useQuery } from "@tanstack/react-query";

import { spotifyApi } from "../auth";
import { Album, Playlist, Track } from "../types";
import { createSpotifySearchUrl, getTrackAndArtistFeatures } from "../utils/requestUtils";
import { SearchQuery } from "../utils/searchRoute";
import { fetchOffsetPages } from "../utils/spotifyFetch";
import { EPHEMERAL_GC_TIME } from "./queryClient";

export type SearchResultData =
  | { kind: "track"; tracks: Track[] }
  | { kind: "album"; albums: Album[] }
  | { kind: "playlist"; playlists: Playlist[] };

export const searchQueryOptions = (query: SearchQuery | null) =>
  queryOptions({
    queryKey: ["search", query] as const,
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    gcTime: EPHEMERAL_GC_TIME,
    queryFn: async (): Promise<SearchResultData> => {
      const response = await spotifyApi.get(createSpotifySearchUrl(query!));

      switch (query!.kind) {
        case "track":
          return {
            kind: "track",
            tracks: await getTrackAndArtistFeatures(response.data.tracks.items),
          };
        case "album":
          return { kind: "album", albums: response.data.albums.items };
        case "playlist":
          return { kind: "playlist", playlists: response.data.playlists.items };
      }
    },
  });

export const useSearchResults = (query: SearchQuery | null) => useQuery(searchQueryOptions(query));

async function fetchAlbumTracks(albumId: string): Promise<{ albumName: string; tracks: Track[] }> {
  const [albumResponse, tracklist] = await Promise.all([
    spotifyApi.get(`albums/${encodeURIComponent(albumId)}`),
    fetchOffsetPages(async (offset, limit) => {
      const response = await spotifyApi.get(
        `albums/${encodeURIComponent(albumId)}/tracks?offset=${offset}&limit=${limit}`
      );

      return { items: response.data.items, total: response.data.total ?? 0 };
    }),
  ]);

  const album: Album = albumResponse.data;
  const artistNames = album.artists.slice(0, 2).map((artist) => artist.name);

  return {
    albumName: `${album.name} – ${artistNames.join(", ")}`,
    tracks: await getTrackAndArtistFeatures(tracklist),
  };
}

export const useAlbumTracks = (albumId: string | null) =>
  useQuery({
    queryKey: ["album", albumId] as const,
    enabled: !!albumId,
    staleTime: 60 * 60 * 1000,
    queryFn: () => fetchAlbumTracks(albumId!),
  });
