// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { useRecommendedTracks, useSeedTrack } from "../../queries/trackQueries";
import { SeedAttributes } from "../../types";
import { createQueryTestContext } from "../helpers/queryTestContext";
import { mockSpotify } from "../helpers/spotifyHttp";
import { audioFeatures, rawTrack, trackFactory } from "../helpers/testFixtures";

const emptyAttributes = (): SeedAttributes => ({
  tempo: { value: "", maxOrMinFilter: "target" },
  duration: { value: "", maxOrMinFilter: "target" },
  popularity: { value: "", maxOrMinFilter: "target" },
  liveness: { value: "", maxOrMinFilter: "target" },
  energy: { value: "", maxOrMinFilter: "target" },
  intrumentalness: { value: "", maxOrMinFilter: "target" },
  valence: { value: "", maxOrMinFilter: "target" },
  danceability: { value: "", maxOrMinFilter: "target" },
  speechiness: { value: "", maxOrMinFilter: "target" },
  acousticness: { value: "", maxOrMinFilter: "target" },
  genre: { value: "", maxOrMinFilter: "target" },
});

it("returns an enriched seed track", async () => {
  mockSpotify((url) => {
    if (url.pathname === "/v1/tracks/track-one") return rawTrack();
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();

  const { result } = renderHook(() => useSeedTrack("track-one"), { wrapper });

  await waitFor(() =>
    expect(result.current.data).toMatchObject({
      id: "track-one",
      name: "Midnight Signal",
      tempo: "124",
      artist_genres: ["House"],
    })
  );
});

it("returns null for unavailable seed analysis and leaves recommendations disabled", async () => {
  const requests = mockSpotify((url) => {
    if (url.pathname === "/v1/tracks/no-analysis") return rawTrack({ id: "no-analysis" });
    if (url.pathname === "/v1/audio-features/") return { audio_features: [null] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: [] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();
  const attributes = emptyAttributes();

  const { result } = renderHook(
    () => {
      const seed = useSeedTrack("no-analysis");
      const recommendations = useRecommendedTracks(seed.data, attributes, false);
      return { seed, recommendations };
    },
    { wrapper }
  );

  await waitFor(() => expect(result.current.seed.isSuccess).toBe(true));
  expect(result.current.seed.data).toBeNull();
  expect(result.current.recommendations.data).toBeUndefined();
  expect(requests.some((url) => url.startsWith("/v1/recommendations"))).toBe(false);
});

it("returns recommendations without key constraints when matching is off", async () => {
  const requests = mockSpotify((url) => {
    if (url.pathname === "/v1/recommendations") return { tracks: [rawTrack()] };
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();
  const seed = trackFactory({ id: "seed" });

  const { result } = renderHook(() => useRecommendedTracks(seed, emptyAttributes(), false), {
    wrapper,
  });

  await waitFor(() =>
    expect(result.current.data).toMatchObject([{ id: "track-one", name: "Midnight Signal" }])
  );
  const recommendations = requests
    .filter((request) => request.startsWith("/v1/recommendations"))
    .map((request) => Object.fromEntries(new URL(request, "https://api.spotify.com").searchParams));
  expect(recommendations).toEqual([{ market: "AU", seed_tracks: "seed", limit: "40" }]);
});

it("combines same-key and relative-key recommendations without duplicates", async () => {
  const requests = mockSpotify((url) => {
    if (url.pathname === "/v1/recommendations") return { tracks: [rawTrack(), rawTrack()] };
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { wrapper } = createQueryTestContext();
  const seed = trackFactory({
    id: "seed",
    key: "0",
    mode: "1",
    parsedKeys: ["8B", "C", ["9", "0"]],
  });
  const attributes = emptyAttributes();
  attributes.tempo = { value: "126", maxOrMinFilter: "target" };

  const { result } = renderHook(() => useRecommendedTracks(seed, attributes, true), { wrapper });

  await waitFor(() =>
    expect(result.current.data).toMatchObject([{ id: "track-one", tempo: "124" }])
  );
  const recommendations = requests
    .filter((request) => request.startsWith("/v1/recommendations"))
    .map((request) => Object.fromEntries(new URL(request, "https://api.spotify.com").searchParams));
  expect(recommendations).toEqual([
    {
      market: "AU",
      seed_tracks: "seed",
      target_key: "0",
      target_mode: "1",
      limit: "25",
      target_tempo: "126",
    },
    {
      market: "AU",
      seed_tracks: "seed",
      target_key: "9",
      target_mode: "0",
      limit: "15",
      target_tempo: "126",
    },
  ]);
  expect(requests.filter((url) => url.startsWith("/v1/audio-features/"))).toEqual([
    "/v1/audio-features/?ids=track-one",
  ]);
});
