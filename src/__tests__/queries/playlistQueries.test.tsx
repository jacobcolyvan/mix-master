// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { usePlaylist, usePlaylistTracks, useUserPlaylists } from "../../queries/playlistQueries";
import { createQueryTestContext } from "../helpers/queryTestContext";
import { mockSpotify } from "../helpers/spotifyHttp";
import { audioFeatures, playlistFactory, rawTrack } from "../helpers/testFixtures";

it("returns the user's playlists without requiring a profile", async () => {
  const playlists = [playlistFactory({ id: "night", name: "Night Set" })];
  const requests = mockSpotify((url) => {
    if (url.pathname === "/v1/me/playlists") return { items: playlists, total: 1 };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();

  const { result } = renderHook(() => useUserPlaylists(), { wrapper });

  await waitFor(() => expect(result.current.data).toEqual(playlists));
  expect(requests).toEqual(["/v1/me/playlists?limit=50&offset=0"]);
});

it("returns enriched playlist tracks and skips unavailable items", async () => {
  mockSpotify((url) => {
    if (url.pathname === "/v1/playlists/night/tracks") {
      return { items: [{ track: rawTrack() }, { track: null }], total: 2 };
    }
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();

  const { result } = renderHook(() => usePlaylistTracks("night", "snapshot-one"), { wrapper });

  await waitFor(() =>
    expect(result.current.data).toMatchObject([
      { id: "track-one", name: "Midnight Signal", tempo: "124", artists: ["Night Artist"] },
    ])
  );
});

it("reuses tracks for the same snapshot and fetches tracks for a changed snapshot", async () => {
  let spotifySnapshotId = "snapshot-one";
  let metadataRequestCount = 0;
  let trackRequestCount = 0;
  mockSpotify((url) => {
    if (url.pathname === "/v1/playlists/cached") {
      metadataRequestCount += 1;
      return playlistFactory({
        id: "cached",
        name: "Night Set",
        snapshot_id: spotifySnapshotId,
      });
    }
    if (url.pathname === "/v1/playlists/cached/tracks") {
      trackRequestCount += 1;
      return { items: [{ track: rawTrack({ name: spotifySnapshotId }) }], total: 1 };
    }
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();
  const usePlaylistWithTracks = () => {
    const playlist = usePlaylist("cached");
    const tracks = usePlaylistTracks("cached", playlist.data?.snapshot_id);
    return { tracks: tracks.data, isFetchingPlaylist: playlist.isFetching };
  };

  // First visit fetches the playlist and its tracks.
  const initialVisit = renderHook(usePlaylistWithTracks, { wrapper });

  await waitFor(() => expect(initialVisit.result.current.tracks?.[0].name).toBe("snapshot-one"));
  expect(trackRequestCount).toBe(1);
  initialVisit.unmount();

  // Revisiting refreshes metadata but reuses the unchanged snapshot's tracks.
  const unchangedVisit = renderHook(usePlaylistWithTracks, { wrapper });

  await waitFor(() => {
    expect(metadataRequestCount).toBe(2);
    expect(unchangedVisit.result.current.isFetchingPlaylist).toBe(false);
  });
  expect(unchangedVisit.result.current.tracks?.[0].name).toBe("snapshot-one");
  expect(trackRequestCount).toBe(1);
  unchangedVisit.unmount();

  // Editing the playlist changes its snapshot and triggers a new tracks request.
  spotifySnapshotId = "snapshot-two";
  const editedVisit = renderHook(usePlaylistWithTracks, { wrapper });

  await waitFor(() => expect(editedVisit.result.current.tracks?.[0].name).toBe("snapshot-two"));
  expect(trackRequestCount).toBe(2);
});
