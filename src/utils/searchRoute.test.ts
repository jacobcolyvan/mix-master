import { describe, expect, it } from "vitest";

import type { CurrentSearchQueryOptions } from "../types";
import {
  buildSearchUrl,
  parseSearchRoute,
  searchFormFromQuery,
  searchQueryFromForm,
  type SearchRoute,
} from "./searchRoute";

const searchQueriesFactory = (
  overrides: Partial<CurrentSearchQueryOptions> = {}
): CurrentSearchQueryOptions => ({
  searchType: "track",
  albumSearchQuery: "",
  artistSearchQuery: "",
  playlistSearchQuery: "",
  trackSearchQuery: "",
  ...overrides,
});

describe("searchQueryFromForm", () => {
  it("normalises the fields used by a track search", () => {
    const queries = searchQueriesFactory({
      trackSearchQuery: "  Around the World  ",
      artistSearchQuery: "  Daft Punk  ",
      albumSearchQuery: "Ignored Album",
      playlistSearchQuery: "Ignored Playlist",
    });

    expect(searchQueryFromForm(queries)).toEqual({
      kind: "track",
      track: "Around the World",
      artist: "Daft Punk",
    });
  });

  it("allows an album search by artist alone", () => {
    const queries = searchQueriesFactory({
      searchType: "album",
      artistSearchQuery: "Four Tet",
    });

    expect(searchQueryFromForm(queries)).toEqual({
      kind: "album",
      album: "",
      artist: "Four Tet",
    });
  });

  it("creates a playlist search from the playlist field", () => {
    const queries = searchQueriesFactory({
      searchType: "playlist",
      playlistSearchQuery: "  Deep House  ",
    });

    expect(searchQueryFromForm(queries)).toEqual({
      kind: "playlist",
      playlist: "Deep House",
    });
  });

  it("rejects a search with no meaningful input", () => {
    const queries = searchQueriesFactory({ trackSearchQuery: "   " });

    expect(searchQueryFromForm(queries)).toBeNull();
  });
});

describe("searchFormFromQuery", () => {
  it("maps a track query to the search form", () => {
    expect(
      searchFormFromQuery({ kind: "track", track: "Around the World", artist: "Daft Punk" })
    ).toEqual(
      searchQueriesFactory({
        trackSearchQuery: "Around the World",
        artistSearchQuery: "Daft Punk",
      })
    );
  });

  it("maps an album query to the search form", () => {
    expect(searchFormFromQuery({ kind: "album", album: "Rounds", artist: "Four Tet" })).toEqual(
      searchQueriesFactory({
        searchType: "album",
        albumSearchQuery: "Rounds",
        artistSearchQuery: "Four Tet",
      })
    );
  });

  it("maps a playlist query to the search form", () => {
    expect(searchFormFromQuery({ kind: "playlist", playlist: "Deep House" })).toEqual(
      searchQueriesFactory({
        searchType: "playlist",
        playlistSearchQuery: "Deep House",
      })
    );
  });
});

describe("parseSearchRoute", () => {
  it("parses and normalises a track search", () => {
    expect(parseSearchRoute("?type=track&track=%20Blue+Monday%20&artist=New+Order")).toEqual({
      kind: "track",
      track: "Blue Monday",
      artist: "New Order",
    });
  });

  it("parses an album-track route from its Spotify ID", () => {
    expect(parseSearchRoute("?view=album&albumId=4m2880jivSbbyEGAKfITCa")).toEqual({
      kind: "albumTracks",
      albumId: "4m2880jivSbbyEGAKfITCa",
    });
  });

  it("ignores unrelated URL parameters", () => {
    expect(parseSearchRoute("?type=playlist&playlist=House&utm_source=example")).toEqual({
      kind: "playlist",
      playlist: "House",
    });
  });

  it.each(["", "?type=track", "?type=playlist&playlist=%20%20", "?view=album"])(
    "rejects a route without meaningful search identity: %s",
    (search) => {
      expect(parseSearchRoute(search)).toBeNull();
    }
  );
});

describe("buildSearchUrl", () => {
  it.each<[SearchRoute, string]>([
    [
      { kind: "track", track: "Around the World", artist: "Daft Punk" },
      "/search?type=track&track=Around+the+World&artist=Daft+Punk",
    ],
    [{ kind: "album", album: "", artist: "Four Tet" }, "/search?type=album&artist=Four+Tet"],
    [
      { kind: "playlist", playlist: "House & Techno" },
      "/search?type=playlist&playlist=House+%26+Techno",
    ],
    [
      { kind: "albumTracks", albumId: "4m2880jivSbbyEGAKfITCa" },
      "/search?view=album&albumId=4m2880jivSbbyEGAKfITCa",
    ],
  ])("builds the canonical URL for %#", (route, expectedUrl) => {
    expect(buildSearchUrl(route)).toBe(expectedUrl);
  });

  it("builds URLs that parse back to the same route", () => {
    const route: SearchRoute = {
      kind: "album",
      album: "Music Has the Right to Children",
      artist: "Boards of Canada",
    };

    const locationSearch = new URL(buildSearchUrl(route), "https://example.com").search;

    expect(parseSearchRoute(locationSearch)).toEqual(route);
  });
});
