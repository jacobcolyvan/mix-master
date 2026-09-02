import { describe, expect, it } from "vitest";

import {
  camelotKeySort,
  getArtistNames,
  getKeyInfoArray,
  standardKeySort,
} from "./commonFunctions";
import { trackFactory } from "./testFixtures";

describe("getArtistNames", () => {
  it("returns the artist name when there is one artist", () => {
    expect(getArtistNames(["Four Tet"])).toBe("Four Tet");
  });

  it("joins two artist names", () => {
    expect(getArtistNames(["Bicep", "Clara La San"])).toBe("Bicep, Clara La San");
  });

  it("limits three artists to the first two", () => {
    expect(getArtistNames(["Jamie xx", "Romy", "Oliver Sim"])).toBe("Jamie xx, Romy");
  });
});

describe("getKeyInfoArray", () => {
  it("returns Camelot, standard, and relative-key information for C major", () => {
    expect(getKeyInfoArray("0", "1")).toEqual(["8B", "C", ["9", "0"]]);
  });

  it("returns Camelot, standard, and relative-key information for D minor", () => {
    expect(getKeyInfoArray("2", "0")).toEqual(["7A", "Dm", ["5", "1"]]);
  });

  it("wraps the relative minor for B major", () => {
    expect(getKeyInfoArray("11", "1")).toEqual(["1B", "B", ["8", "0"]]);
  });

  it("wraps the relative major for A minor", () => {
    expect(getKeyInfoArray("9", "0")).toEqual(["8A", "Am", ["0", "1"]]);
  });
});

describe("camelotKeySort", () => {
  it("sorts by Camelot position with minor before major at the same number", () => {
    const tracks = [
      trackFactory({ id: "camelot-4b-g-sharp-major", key: "8", mode: "1" }),
      trackFactory({ id: "camelot-1b-b-major", key: "11", mode: "1" }),
      trackFactory({ id: "camelot-2a-d-sharp-minor", key: "3", mode: "0" }),
      trackFactory({ id: "camelot-1a-g-sharp-minor", key: "8", mode: "0" }),
    ];

    expect(camelotKeySort(tracks).map(({ id }) => id)).toEqual([
      "camelot-1a-g-sharp-minor",
      "camelot-1b-b-major",
      "camelot-2a-d-sharp-minor",
      "camelot-4b-g-sharp-major",
    ]);
  });

  it("does not mutate the input array", () => {
    const tracks = [
      trackFactory({ id: "camelot-11b-a-major", key: "9", mode: "1" }),
      trackFactory({ id: "camelot-1a-g-sharp-minor", key: "8", mode: "0" }),
    ];

    const sortedTracks = camelotKeySort(tracks);

    expect(tracks.map(({ id }) => id)).toEqual(["camelot-11b-a-major", "camelot-1a-g-sharp-minor"]);
    expect(sortedTracks).not.toBe(tracks);
  });
});

describe("standardKeySort", () => {
  it("sorts from A through G-sharp with major before minor at a pitch class", () => {
    const tracks = [
      trackFactory({ id: "standard-g-sharp-minor", key: "8", mode: "0" }),
      trackFactory({ id: "standard-c-major", key: "0", mode: "1" }),
      trackFactory({ id: "standard-a-minor", key: "9", mode: "0" }),
      trackFactory({ id: "standard-a-sharp-major", key: "10", mode: "1" }),
      trackFactory({ id: "standard-a-major", key: "9", mode: "1" }),
    ];

    expect(standardKeySort(tracks).map(({ id }) => id)).toEqual([
      "standard-a-major",
      "standard-a-minor",
      "standard-a-sharp-major",
      "standard-c-major",
      "standard-g-sharp-minor",
    ]);
  });

  it("does not mutate the input array", () => {
    const tracks = [
      trackFactory({ id: "standard-g-sharp-major", key: "8", mode: "1" }),
      trackFactory({ id: "standard-a-major", key: "9", mode: "1" }),
    ];

    const sortedTracks = standardKeySort(tracks);

    expect(tracks.map(({ id }) => id)).toEqual(["standard-g-sharp-major", "standard-a-major"]);
    expect(sortedTracks).not.toBe(tracks);
  });
});
