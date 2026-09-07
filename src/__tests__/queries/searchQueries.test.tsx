// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { useAlbumTracks, useSearchResults } from "../../queries/searchQueries";
import { createQueryTestContext } from "../helpers/queryTestContext";
import { mockSpotify } from "../helpers/spotifyHttp";
import { audioFeatures, playlistFactory, rawTrack } from "../helpers/testFixtures";

it("returns enriched tracks for a track search", async () => {
  const requests = mockSpotify((url) => {
    if (url.pathname === "/v1/search") return { tracks: { items: [rawTrack()] } };
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();

  const { result } = renderHook(
    () => useSearchResults({ kind: "track", track: "Midnight", artist: "Night Artist" }),
    { wrapper }
  );

  await waitFor(() =>
    expect(result.current.data).toMatchObject({
      kind: "track",
      tracks: [
        {
          id: "track-one",
          name: "Midnight Signal",
          artists: ["Night Artist"],
          artist_genres: ["House"],
          tempo: "124",
          energy: "0.72",
        },
      ],
    })
  );
  const searchUrl = new URL(requests[0], "https://api.spotify.com");
  expect(searchUrl.searchParams.get("q")).toBe("track:Midnight artist:Night Artist");
  expect(searchUrl.searchParams.get("type")).toBe("track");
});

it("returns album search results without requesting audio analysis", async () => {
  const album = {
    id: "album-one",
    name: "Night Album",
    artists: [{ name: "Night Artist" }],
    images: [],
    release_date: "2026-01-01",
  };
  const requests = mockSpotify((url) => {
    if (url.pathname === "/v1/search") return { albums: { items: [album] } };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();

  const { result } = renderHook(
    () => useSearchResults({ kind: "album", album: "Night", artist: "" }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.data).toEqual({ kind: "album", albums: [album] }));
  expect(requests).toHaveLength(1);
});

it("returns playlist search results", async () => {
  const playlist = playlistFactory({ name: "Night Set" });
  mockSpotify((url) => {
    if (url.pathname === "/v1/search") return { playlists: { items: [playlist] } };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();

  const { result } = renderHook(() => useSearchResults({ kind: "playlist", playlist: "Night" }), {
    wrapper,
  });

  await waitFor(() =>
    expect(result.current.data).toEqual({ kind: "playlist", playlists: [playlist] })
  );
});

it("returns an album label and its enriched tracks", async () => {
  mockSpotify((url) => {
    if (url.pathname === "/v1/albums/album-one")
      return { name: "Night Album", artists: [{ name: "Night Artist" }, { name: "Guest" }] };
    if (url.pathname === "/v1/albums/album-one/tracks") return { items: [rawTrack()], total: 1 };
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();

  const { result } = renderHook(() => useAlbumTracks("album-one"), { wrapper });

  await waitFor(() =>
    expect(result.current.data).toMatchObject({
      albumName: "Night Album – Night Artist, Guest",
      tracks: [{ id: "track-one", name: "Midnight Signal", tempo: "124" }],
    })
  );
});
