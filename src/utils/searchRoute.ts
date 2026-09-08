import { CurrentSearchQueryOptions } from "../types";

export type SearchQuery =
  | { kind: "track"; track: string; artist: string }
  | { kind: "album"; album: string; artist: string }
  | { kind: "playlist"; playlist: string };

export type SearchRoute = SearchQuery | { kind: "albumTracks"; albumId: string };

const readParam = (params: URLSearchParams, name: string) => params.get(name)?.trim() ?? "";

export const parseSearchRoute = (search: string): SearchRoute | null => {
  const params = new URLSearchParams(search);

  if (params.get("view") === "album") {
    const albumId = readParam(params, "albumId");
    return albumId ? { kind: "albumTracks", albumId } : null;
  }

  switch (params.get("type")) {
    case "track": {
      const track = readParam(params, "track");
      const artist = readParam(params, "artist");
      return track || artist ? { kind: "track", track, artist } : null;
    }
    case "album": {
      const album = readParam(params, "album");
      const artist = readParam(params, "artist");
      return album || artist ? { kind: "album", album, artist } : null;
    }
    case "playlist": {
      const playlist = readParam(params, "playlist");
      return playlist ? { kind: "playlist", playlist } : null;
    }
    default:
      return null;
  }
};

export const searchQueryFromForm = (queries: CurrentSearchQueryOptions): SearchQuery | null => {
  const album = queries.albumSearchQuery.trim();
  const artist = queries.artistSearchQuery.trim();
  const playlist = queries.playlistSearchQuery.trim();
  const track = queries.trackSearchQuery.trim();

  switch (queries.searchType) {
    case "track":
      return track || artist ? { kind: "track", track, artist } : null;
    case "album":
      return album || artist ? { kind: "album", album, artist } : null;
    case "playlist":
      return playlist ? { kind: "playlist", playlist } : null;
  }
};

export const searchFormFromQuery = (query: SearchQuery): CurrentSearchQueryOptions => {
  switch (query.kind) {
    case "track":
      return {
        searchType: "track",
        albumSearchQuery: "",
        artistSearchQuery: query.artist,
        playlistSearchQuery: "",
        trackSearchQuery: query.track,
      };
    case "album":
      return {
        searchType: "album",
        albumSearchQuery: query.album,
        artistSearchQuery: query.artist,
        playlistSearchQuery: "",
        trackSearchQuery: "",
      };
    case "playlist":
      return {
        searchType: "playlist",
        albumSearchQuery: "",
        artistSearchQuery: "",
        playlistSearchQuery: query.playlist,
        trackSearchQuery: "",
      };
  }
};

export const searchFormFromRoute = (route: SearchRoute | null): CurrentSearchQueryOptions => {
  // Bare, invalid and album-detail URLs have no submitted search to restore.
  if (!route || route.kind === "albumTracks") {
    return searchFormFromQuery({ kind: "track", track: "", artist: "" });
  }

  return searchFormFromQuery(route);
};

export const buildSearchUrl = (route: SearchRoute): string => {
  const params = new URLSearchParams();

  switch (route.kind) {
    case "track":
      params.set("type", "track");
      if (route.track) params.set("track", route.track);
      if (route.artist) params.set("artist", route.artist);
      break;
    case "album":
      params.set("type", "album");
      if (route.album) params.set("album", route.album);
      if (route.artist) params.set("artist", route.artist);
      break;
    case "playlist":
      params.set("type", "playlist");
      params.set("playlist", route.playlist);
      break;
    case "albumTracks":
      params.set("view", "album");
      params.set("albumId", route.albumId);
      break;
  }

  return `/search?${params.toString()}`;
};
