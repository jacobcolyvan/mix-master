import { describe, expect, it } from "vitest";

import type { KeyOptionTypes, Playlist, Track, TrackSortByChoices } from "../types";
import { groupPlaylists, sortTracks } from "./collectionTransforms";
import { playlistFactory, trackFactory } from "./testFixtures";

const names = (tracks: Track[]) => tracks.map((track) => track.name);

// Camelot values (getCamelotKeyValue in commonFunctions.ts): a minor key uses
// camelotMinorKeyDict as-is; a major key adds 0.1 so it sorts after the minor
// key sharing its number.
//   C -> key 9,  minor -> minor dict 8 -> 8.0
//   A -> key 0,  major -> major dict 8 -> 8.1
//   B -> key 7,  major -> major dict 9 -> 9.1
// Standard values, ((key + 3) % 12) + 1:  C -> 1, A -> 4, B -> 11.
// Both key orderings therefore give C, A, B.
const tracks: Track[] = [
  trackFactory({
    id: "c",
    name: "C",
    tempo: "128",
    duration: "300000",
    valence: "0.9",
    energy: "0.2",
    key: "9",
    mode: "0",
  }),
  trackFactory({
    id: "a",
    name: "A",
    tempo: "90",
    duration: "100000",
    valence: "0.1",
    energy: "0.8",
    key: "0",
    mode: "1",
  }),
  trackFactory({
    id: "b",
    name: "B",
    tempo: "110",
    duration: "200000",
    valence: "0.5",
    energy: "0.5",
    key: "7",
    mode: "1",
  }),
];

type SortCase = {
  description: string;
  sortBy: TrackSortByChoices;
  keyOption: KeyOptionTypes;
  expected: string[];
};

const sortCases = [
  {
    description: "canonical order, untouched",
    sortBy: "default",
    keyOption: "camelot",
    expected: ["C", "A", "B"],
  },
  {
    description: "ascending tempo",
    sortBy: "tempo",
    keyOption: "camelot",
    expected: ["A", "B", "C"],
  },
  {
    description: "ascending duration",
    sortBy: "duration",
    keyOption: "camelot",
    expected: ["A", "B", "C"],
  },
  {
    description: "ascending valence",
    sortBy: "valence",
    keyOption: "camelot",
    expected: ["A", "B", "C"],
  },
  {
    description:
      "PRE-EXISTING BUG: reads `popularity`, field is `track_popularity`, every compare is NaN",
    sortBy: "popularity",
    keyOption: "camelot",
    expected: ["C", "A", "B"],
  },
  {
    description: "PRE-EXISTING BUG: no case in the switch, falls through to default",
    sortBy: "energy",
    keyOption: "camelot",
    expected: ["C", "A", "B"],
  },
  {
    description: "Camelot wheel order",
    sortBy: "major/minor",
    keyOption: "camelot",
    expected: ["C", "A", "B"],
  },
  {
    description: "standard key order",
    sortBy: "major/minor",
    keyOption: "standard",
    expected: ["C", "A", "B"],
  },
  {
    description: "tempo followed by Camelot key order",
    sortBy: "tempoThenKey",
    keyOption: "camelot",
    expected: ["C", "A", "B"],
  },
  {
    description: "duration followed by Camelot key order",
    sortBy: "durationThenKey",
    keyOption: "camelot",
    expected: ["C", "A", "B"],
  },
  {
    description: "valence followed by Camelot key order",
    sortBy: "valenceThenKey",
    keyOption: "camelot",
    expected: ["C", "A", "B"],
  },
  {
    description: "energy followed by Camelot key order",
    sortBy: "energyThenKey",
    keyOption: "camelot",
    expected: ["C", "A", "B"],
  },
  {
    description: "tempo followed by standard key order",
    sortBy: "tempoThenKey",
    keyOption: "standard",
    expected: ["C", "A", "B"],
  },
] satisfies SortCase[];

describe("sortTracks", () => {
  it.each(sortCases)(
    "$description — sorts by $sortBy ($keyOption): $expected",
    ({ sortBy, keyOption, expected }) => {
      expect(names(sortTracks(tracks, sortBy, keyOption))).toEqual(expected);
    }
  );

  it("does not mutate its input and returns a new array", () => {
    const input = [...tracks];
    const result = sortTracks(input, "tempo", "camelot");
    expect(names(input)).toEqual(["C", "A", "B"]);
    expect(result).not.toBe(input);
  });

  it("returns the canonical order for `default` even after another sort ran", () => {
    // The bug being fixed: the old thunk sorted the previously-sorted copy, so
    // `default` re-emitted the last sort order instead of the original.
    expect(names(sortTracks(tracks, "tempo", "camelot"))).toEqual(["A", "B", "C"]);
    expect(names(sortTracks(tracks, "default", "camelot"))).toEqual(["C", "A", "B"]);
  });

  it("groups tracks sharing a Camelot key together", () => {
    const sameKey = [
      trackFactory({ id: "x", name: "X", tempo: "140", key: "0", mode: "1" }), // 8.1
      trackFactory({ id: "y", name: "Y", tempo: "100", key: "7", mode: "1" }), // 9.1
      trackFactory({ id: "z", name: "Z", tempo: "120", key: "0", mode: "1" }), // 8.1
    ];
    const result = names(sortTracks(sameKey, "tempoThenKey", "camelot"));

    // X and Z share 8B and must be adjacent, ahead of Y at 9B. Their order
    // relative to each other is deliberately NOT asserted — camelotKeySort's
    // comparator never returns 0, so the tie order is engine-dependent.
    expect(result[2]).toBe("Y");
    expect(new Set(result.slice(0, 2))).toEqual(new Set(["X", "Z"]));
  });

  it("handles empty and single-element inputs", () => {
    expect(sortTracks([], "tempo", "camelot")).toEqual([]);
    const single = [trackFactory({ id: "solo", name: "Solo" })];
    expect(names(sortTracks(single, "tempoThenKey", "camelot"))).toEqual(["Solo"]);
  });
});

const playlistNames = (playlists: Playlist[]) => playlists.map((playlist) => playlist.name);

const owned = (id: string, name: string) =>
  playlistFactory({ id, name, owner: { display_name: "DJ Me" } });
const theirs = (id: string, name: string) =>
  playlistFactory({ id, name, owner: { display_name: "DJ You" } });

describe("groupPlaylists", () => {
  it("splits a mixed list by ownership, preserving input order within each bucket", () => {
    const result = groupPlaylists(
      [
        owned("1", "Mine One"),
        theirs("2", "Theirs One"),
        owned("3", "Mine Two"),
        theirs("4", "Theirs Two"),
      ],
      "DJ Me"
    );

    expect(playlistNames(result.created)).toEqual(["Mine One", "Mine Two"]);
    expect(playlistNames(result.followed)).toEqual(["Theirs One", "Theirs Two"]);
  });

  it("returns two empty buckets for an empty list", () => {
    expect(groupPlaylists([], "DJ Me")).toEqual({ created: [], followed: [] });
  });

  it("does not mutate its input and returns a fresh object each call", () => {
    const playlists = [owned("1", "One")];
    expect(groupPlaylists(playlists, "DJ Me")).not.toBe(groupPlaylists(playlists, "DJ Me"));
    expect(playlists).toHaveLength(1);
  });
});
