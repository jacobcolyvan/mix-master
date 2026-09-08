// @vitest-environment jsdom
import { act, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Search from "../pages/Search";
import { createQueryTestContext } from "./helpers/queryTestContext";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { mockSpotify } from "./helpers/spotifyHttp";
import { audioFeatures, rawTrack } from "./helpers/testFixtures";

const renderSearch = (path: string) => {
  const { client } = createQueryTestContext();
  return renderWithProviders(<Search />, { path, client });
};

const textbox = (name: string) => screen.getByRole<HTMLInputElement>("textbox", { name });

const selectSearchType = async (
  user: ReturnType<typeof renderSearch>["user"],
  name: "Tracks" | "Albums" | "Playlists"
) => {
  await user.click(screen.getByRole("combobox", { name: "Search type" }));
  await user.click(screen.getByRole("option", { name }));
};

// Substitute Spotify HTTP only; the page and real Query layer still drive each search.
const mockEmptyAlbumSearch = () =>
  mockSpotify((url) => {
    if (url.pathname === "/v1/search") return { albums: { items: [] } };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });

afterEach(() => vi.restoreAllMocks());

describe("draft editing and submission", () => {
  it("retains type-specific fields and shares Artist without submitting type changes", async () => {
    const requests = mockEmptyAlbumSearch();
    const { user, history } = renderSearch("/search");

    await user.type(textbox("Track"), "Blue Monday");
    await user.type(textbox("Artist"), "New Order");
    await selectSearchType(user, "Albums");

    expect(textbox("Artist").value).toBe("New Order");

    await user.type(textbox("Album"), "Power");
    await selectSearchType(user, "Playlists");

    expect(screen.queryByRole("textbox", { name: "Artist" })).toBeNull();

    await user.type(textbox("Playlist"), "House");
    await selectSearchType(user, "Tracks");

    expect(textbox("Track").value).toBe("Blue Monday");
    expect(textbox("Artist").value).toBe("New Order");

    await selectSearchType(user, "Albums");

    expect(textbox("Album").value).toBe("Power");

    await selectSearchType(user, "Playlists");

    expect(textbox("Playlist").value).toBe("House");
    expect(history.location.search).toBe("");
    expect(requests).toHaveLength(0);
  });

  it("submits normalised Album and Artist values with the Search button", async () => {
    mockEmptyAlbumSearch();
    const { user, history } = renderSearch("/search");
    await selectSearchType(user, "Albums");
    await user.type(textbox("Artist"), "  New Order  ");
    await user.type(textbox("Album"), "  Power  ");

    await user.click(screen.getByRole("button", { name: "Search" }));

    await screen.findByText("No albums found.");
    expect(history.location.search).toBe("?type=album&album=Power&artist=New+Order");
    expect(textbox("Album").value).toBe("Power");
    expect(textbox("Artist").value).toBe("New Order");
  });

  it("submits only the normalised Playlist field with Enter and clears inactive fields", async () => {
    mockSpotify((url) => {
      if (url.pathname === "/v1/search") return { playlists: { items: [] } };
      throw new Error(`Unexpected Spotify request: ${url}`);
    });
    const { user, history } = renderSearch("/search");
    await user.type(textbox("Track"), "Blue Monday");
    await user.type(textbox("Artist"), "New Order");
    await selectSearchType(user, "Playlists");
    await user.type(textbox("Playlist"), "  House  ");

    await user.keyboard("{Enter}");

    await screen.findByRole("heading", { name: "Playlist Results" });
    expect(history.location.search).toBe("?type=playlist&playlist=House");
    expect(textbox("Playlist").value).toBe("House");

    await selectSearchType(user, "Tracks");

    expect(textbox("Track").value).toBe("");
    expect(textbox("Artist").value).toBe("");
  });

  it("keeps submitted results while typing, then submits Track and Artist with Enter", async () => {
    const requests = mockSpotify((url) => {
      if (url.pathname === "/v1/search") {
        return { tracks: { items: [rawTrack({ name: url.searchParams.get("q")! })] } };
      }
      if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
      if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
      throw new Error(`Unexpected Spotify request: ${url}`);
    });
    const { history, user } = renderSearch("/search?type=track&track=First");
    await screen.findByRole("cell", { name: /track:First/ });

    await user.clear(textbox("Track"));
    await user.type(textbox("Track"), "  Second  ");
    await user.type(textbox("Artist"), "  New Order  ");

    expect(history.location.search).toBe("?type=track&track=First");
    expect(requests.filter((url) => url.startsWith("/v1/search"))).toHaveLength(1);
    expect(screen.getByRole("cell", { name: /track:First/ })).toBeTruthy();

    await user.keyboard("{Enter}");

    expect(await screen.findByRole("cell", { name: /track:Second artist:New Order/ })).toBeTruthy();
    expect(history.location.search).toBe("?type=track&track=Second&artist=New+Order");
    expect(textbox("Track").value).toBe("Second");
    expect(textbox("Artist").value).toBe("New Order");
  });

  it.each(["/search", "/search?type=album&album=Rounds"])(
    "empty submission resets active and inactive drafts at %s without an empty request",
    async (path) => {
      const requests = mockEmptyAlbumSearch();
      const { user, history } = renderSearch(path);
      await selectSearchType(user, "Tracks");
      await user.type(textbox("Track"), "inactive track");
      await user.type(textbox("Artist"), "inactive artist");
      await selectSearchType(user, "Playlists");
      await user.type(textbox("Playlist"), "   ");
      const requestCount = requests.length;

      await user.click(screen.getByRole("button", { name: "Search" }));

      expect(history.location.pathname).toBe("/search");
      expect(history.location.search).toBe("");
      expect(textbox("Track").value).toBe("");
      expect(textbox("Artist").value).toBe("");
      expect(requests).toHaveLength(requestCount);

      await selectSearchType(user, "Albums");

      expect(textbox("Album").value).toBe("");
    }
  );
});

describe("URL initialisation and navigation", () => {
  it("restores a direct album link when a new history entry has the same URL", async () => {
    mockEmptyAlbumSearch();
    const path = "/search?type=album&album=Rounds&artist=Four+Tet";
    const { user, history } = renderSearch(path);
    await screen.findByText("No albums found.");

    expect(textbox("Album").value).toBe("Rounds");
    expect(textbox("Artist").value).toBe("Four Tet");

    await user.type(textbox("Album"), " unsaved");
    const entryKey = history.location.key;

    act(() => history.push(path));

    expect(history.location.key).not.toBe(entryKey);
    expect(textbox("Album").value).toBe("Rounds");
    expect(textbox("Artist").value).toBe("Four Tet");
  });

  it("reconstructs the submitted form rather than unsaved edits when remounting", async () => {
    mockEmptyAlbumSearch();
    const { user, rerender } = renderSearch("/search?type=album&album=Rounds&artist=Four+Tet");
    await screen.findByText("No albums found.");
    await user.type(textbox("Album"), " unsaved");
    await user.type(textbox("Artist"), " unsaved");

    rerender(<div>Another page</div>);
    rerender(<Search />);

    expect(textbox("Album").value).toBe("Rounds");
    expect(textbox("Artist").value).toBe("Four Tet");
  });

  it("initialises and resets to empty Tracks at bare /search", async () => {
    mockEmptyAlbumSearch();
    const { user, history } = renderSearch("/search");

    expect(textbox("Track").value).toBe("");
    expect(textbox("Artist").value).toBe("");

    await user.type(textbox("Track"), "unsaved");
    act(() => history.push("/search"));

    expect(textbox("Track").value).toBe("");
  });

  it("opens album details and returns to the submitted album search without unsaved edits", async () => {
    mockSpotify((url) => {
      if (url.pathname === "/v1/search")
        return {
          albums: {
            items: [
              {
                id: "album-one",
                name: "Rounds",
                artists: [{ name: "Four Tet" }],
                images: [],
                release_date: "2003-05-05",
              },
            ],
          },
        };
      if (url.pathname === "/v1/albums/album-one")
        return { name: "Rounds", artists: [{ name: "Four Tet" }] };
      if (url.pathname === "/v1/albums/album-one/tracks") return { items: [rawTrack()], total: 1 };
      if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
      if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
      throw new Error(`Unexpected Spotify request: ${url}`);
    });
    const { user, history } = renderSearch("/search?type=album&album=Rounds&artist=Four+Tet");
    const album = await screen.findByText(/Rounds –/);
    await user.type(textbox("Album"), " unsaved");

    await user.click(album);

    expect(history.location.search).toBe("?view=album&albumId=album-one");
    expect(await screen.findByRole("heading", { name: "Rounds – Four Tet" })).toBeTruthy();
    expect(await screen.findByRole("cell", { name: /Midnight Signal/ })).toBeTruthy();
    expect(textbox("Track").value).toBe("");

    act(() => history.goBack());

    expect(textbox("Album").value).toBe("Rounds");
    expect(textbox("Artist").value).toBe("Four Tet");
    expect(await screen.findByText(/Rounds –/)).toBeTruthy();
  });

  it("Back and Forward restore submitted forms and results, discarding edits", async () => {
    mockSpotify((url) => {
      if (url.pathname === "/v1/search") {
        return { tracks: { items: [rawTrack({ name: url.searchParams.get("q")! })] } };
      }
      if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
      if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
      throw new Error(`Unexpected Spotify request: ${url}`);
    });
    const { history, user } = renderSearch("/search?type=track&track=First");
    await screen.findByRole("cell", { name: /track:First/ });
    act(() => history.push("/search?type=track&track=Second"));
    await screen.findByRole("cell", { name: /track:Second/ });
    await user.type(textbox("Track"), " unsaved");

    act(() => history.goBack());

    expect(textbox("Track").value).toBe("First");
    expect(await screen.findByRole("cell", { name: /track:First/ })).toBeTruthy();

    await user.type(textbox("Artist"), "unsaved artist");
    act(() => history.goForward());

    expect(textbox("Track").value).toBe("Second");
    expect(textbox("Artist").value).toBe("");
    expect(await screen.findByRole("cell", { name: /track:Second/ })).toBeTruthy();
  });
});

describe("identical submissions", () => {
  it("retries a failed search without adding a history entry", async () => {
    let searchRequestCount = 0;
    mockSpotify((url) => {
      if (url.pathname === "/v1/search") {
        searchRequestCount += 1;
        if (searchRequestCount === 1) throw new Error("Spotify temporarily unavailable");
        return { tracks: { items: [rawTrack({ name: `Result ${searchRequestCount}` })] } };
      }
      if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
      if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
      throw new Error(`Unexpected Spotify request: ${url}`);
    });
    const { user, history } = renderSearch("/search?type=track&track=Retry");
    const entryKey = history.location.key;
    await screen.findByText("Unable to load tracks from Spotify. Please try again.");

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("cell", { name: /Result 2/ })).toBeTruthy();
    expect(searchRequestCount).toBe(2);
    expect(history.location.key).toBe(entryKey);
  });

  it("reuses fresh results and normalises the draft without canonicalizing the URL", async () => {
    const requests = mockSpotify((url) => {
      if (url.pathname === "/v1/search") return { tracks: { items: [rawTrack()] } };
      if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
      if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
      throw new Error(`Unexpected Spotify request: ${url}`);
    });
    const { user, history } = renderSearch("/search?track=Fresh&type=track");
    const entryKey = history.location.key;
    await screen.findByRole("cell", { name: /Midnight Signal/ });
    await selectSearchType(user, "Albums");
    await user.type(textbox("Album"), "inactive album");
    await selectSearchType(user, "Tracks");
    await user.clear(textbox("Track"));
    await user.type(textbox("Track"), "  Fresh  ");

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(textbox("Track").value).toBe("Fresh");
    expect(history.location.search).toBe("?track=Fresh&type=track");
    expect(history.location.key).toBe(entryKey);
    expect(requests.filter((url) => url.startsWith("/v1/search"))).toHaveLength(1);

    await selectSearchType(user, "Albums");

    expect(textbox("Album").value).toBe("");
  });

  it("refreshes stale results without adding a history entry", async () => {
    let searchRequestCount = 0;
    mockSpotify((url) => {
      if (url.pathname === "/v1/search") {
        searchRequestCount += 1;
        return { tracks: { items: [rawTrack({ name: `Result ${searchRequestCount}` })] } };
      }
      if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
      if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
      throw new Error(`Unexpected Spotify request: ${url}`);
    });
    const { user, history } = renderSearch("/search?type=track&track=Stale");
    const entryKey = history.location.key;
    await screen.findByRole("cell", { name: /Result 1/ });
    // Move cache age beyond staleTime without introducing fake timers into user-event.
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 5 * 60 * 1000 + 1);

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("cell", { name: /Result 2/ })).toBeTruthy();
    expect(searchRequestCount).toBe(2);
    expect(history.location.key).toBe(entryKey);
  });
});
