import { expect, it } from "vitest";

import {
  emptyRecommendationAttributes,
  parseRecommendationSearch,
  serialiseRecommendationSearch,
  validateRecommendationTuning,
} from "../utils/recommendationTuning";
import { generateRecommendedTrackUrl } from "../utils/requestUtils";

it("saves tuning and sorting in a link and restores them", () => {
  const attributes = emptyRecommendationAttributes();
  attributes.tempo = { value: " 0126.0 ", maxOrMinFilter: "min" };
  attributes.energy = { value: ".72", maxOrMinFilter: "max" };
  attributes.genre.value = " HOUSE ";

  const search = serialiseRecommendationSearch(
    "seed & one",
    { attributes, matchKey: true },
    "tempoThenKey"
  );
  const restored = parseRecommendationSearch(search);

  expect(Object.fromEntries(new URLSearchParams(search))).toEqual({
    id: "seed & one",
    matchKey: "true",
    tempo: "min:126",
    energy: "max:0.72",
    genre: "house",
    sort: "tempoThenKey",
  });
  expect(restored.id).toBe("seed & one");
  expect(restored.applied.attributes.tempo).toEqual({ value: "126", maxOrMinFilter: "min" });
  expect(restored.applied.matchKey).toBe(true);
  expect(restored.sort).toBe("tempoThenKey");
  expect(
    serialiseRecommendationSearch("fresh", {
      attributes: emptyRecommendationAttributes(),
      matchKey: false,
    })
  ).toBe("?id=fresh");
});

it("keeps valid URL values and ignores invalid or unknown ones", () => {
  const view = parseRecommendationSearch(
    "?id=seed&tempo=min:126oops&energy=max:0.7&duration=bad:60&genre=unknown-genre&loudness=min:-20&matchKey=yes&sort=unknown"
  );

  expect(view.applied.attributes.tempo.value).toBe("");
  expect(view.applied.attributes.duration.value).toBe("");
  expect(view.applied.attributes.genre.value).toBe("");
  expect(view.applied.attributes.energy).toEqual({ value: "0.7", maxOrMinFilter: "max" });
  expect(view.applied.matchKey).toBe(false);
  expect(view.sort).toBe("default");
});

it.each(["126oops", "0", "480", "1e2"])("rejects invalid tempo input: %s", (value) => {
  const attributes = emptyRecommendationAttributes();
  attributes.tempo.value = value;

  const result = validateRecommendationTuning({ attributes, matchKey: false });

  expect(result.valid).toBe(false);
  expect(result.errors.tempo).toBe("Invalid range value");
});

it("sends tuning to Spotify with duration in milliseconds", () => {
  const attributes = emptyRecommendationAttributes();
  attributes.duration = { value: "180", maxOrMinFilter: "min" };
  attributes.instrumentalness = { value: "0.80", maxOrMinFilter: "target" };
  attributes.genre.value = " house ";

  const url = new URL(
    generateRecommendedTrackUrl("seed&one", attributes, 40),
    "https://api.spotify.com/v1/"
  );

  expect(Object.fromEntries(url.searchParams)).toEqual({
    market: "AU",
    seed_tracks: "seed&one",
    limit: "40",
    min_duration_ms: "180000",
    target_instrumentalness: "0.8",
    seed_genres: "house",
  });
});
