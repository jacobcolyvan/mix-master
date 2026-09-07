// @vitest-environment jsdom
import { act, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import Search from "../pages/Search";
import { createQueryTestContext } from "./helpers/queryTestContext";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { mockSpotify } from "./helpers/spotifyHttp";
import { audioFeatures, rawTrack } from "./helpers/testFixtures";

const renderSearch = (path: string) => {
  const { client } = createQueryTestContext();
  return renderWithProviders(<Search />, { path, client });
};

afterEach(() => vi.restoreAllMocks());

it("does not fetch while typing and submits the search with Enter", async () => {
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
  const input = screen.getByRole("textbox", { name: "Track" });

  await user.clear(input);
  await user.type(input, "Second");

  expect(history.location.search).toBe("?type=track&track=First");
  expect(requests.filter((url) => url.startsWith("/v1/search"))).toHaveLength(1);
  expect(screen.getByRole("cell", { name: /track:First/ })).toBeTruthy();

  await user.keyboard("{Enter}");

  expect(await screen.findByRole("cell", { name: /track:Second/ })).toBeTruthy();
  expect(history.location.search).toBe("?type=track&track=Second");
});

it("Back restores the submitted search form and results", async () => {
  mockSpotify((url) => {
    if (url.pathname === "/v1/search") {
      return { tracks: { items: [rawTrack({ name: url.searchParams.get("q")! })] } };
    }
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { history } = renderSearch("/search?type=track&track=First");
  await screen.findByRole("cell", { name: /track:First/ });
  act(() => history.push("/search?type=track&track=Second"));
  await screen.findByRole("cell", { name: /track:Second/ });

  act(() => history.goBack());

  expect((screen.getByRole("textbox", { name: "Track" }) as HTMLInputElement).value).toBe("First");
  expect(await screen.findByRole("cell", { name: /track:First/ })).toBeTruthy();
});

it("retries an identical failed search", async () => {
  let searches = 0;
  mockSpotify((url) => {
    if (url.pathname === "/v1/search") {
      searches += 1;
      if (searches === 1) throw new Error("Spotify temporarily unavailable");
      return { tracks: { items: [rawTrack({ name: `Result ${searches}` })] } };
    }
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { user } = renderSearch("/search?type=track&track=Retry");
  await screen.findByText("Unable to load tracks from Spotify. Please try again.");

  await user.click(screen.getByRole("button", { name: "Search" }));

  expect(await screen.findByRole("cell", { name: /Result 2/ })).toBeTruthy();
  expect(searches).toBe(2);
});

it("reuses fresh results on an identical search submission", async () => {
  const requests = mockSpotify((url) => {
    if (url.pathname === "/v1/search") return { tracks: { items: [rawTrack()] } };
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { user } = renderSearch("/search?type=track&track=Fresh");
  await screen.findByRole("cell", { name: /Midnight Signal/ });

  await user.click(screen.getByRole("button", { name: "Search" }));

  expect(requests.filter((url) => url.startsWith("/v1/search"))).toHaveLength(1);
});

it("refreshes stale results on an identical search submission", async () => {
  let searches = 0;
  mockSpotify((url) => {
    if (url.pathname === "/v1/search") {
      searches += 1;
      return { tracks: { items: [rawTrack({ name: `Result ${searches}` })] } };
    }
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["House"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { user } = renderSearch("/search?type=track&track=Stale");
  await screen.findByRole("cell", { name: /Result 1/ });
  // Move cache age beyond staleTime without introducing fake timers into user-event.
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 5 * 60 * 1000 + 1);

  await user.click(screen.getByRole("button", { name: "Search" }));

  expect(await screen.findByRole("cell", { name: /Result 2/ })).toBeTruthy();
  expect(searches).toBe(2);
});
