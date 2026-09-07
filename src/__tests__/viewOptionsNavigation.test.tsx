// @vitest-environment jsdom
import { act, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import PlaylistItems from "../atoms/PlaylistItems";
import Albums from "../components/Albums";
import Tracks from "../components/Tracks";
import Playlist from "../pages/Playlist";
import Search from "../pages/Search";
import { createQueryTestContext } from "./helpers/queryTestContext";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { mockSpotify } from "./helpers/spotifyHttp";
import { playlistFactory, trackFactory } from "./helpers/testFixtures";

it("playlist selectors replace URL options without fetching and Back restores them", async () => {
  const requests = mockSpotify((url) => {
    if (url.pathname.endsWith("/tracks")) return { items: [], total: 0 };
    return playlistFactory();
  });
  const { client } = createQueryTestContext();
  const { history, user } = renderWithProviders(<Playlist username="DJ" />, {
    client,
    path: "/playlist?id=first&sort=tempo&keyNotation=standard&other=keep#tracks",
  });
  await screen.findByRole("table");
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Sort by Tempo");
  expect(screen.getByRole("combobox", { name: "Key notation" }).textContent).toBe("Standard Key");
  const requestCount = requests.length;

  await user.click(screen.getByRole("combobox", { name: "Sort by" }));
  await user.click(screen.getByRole("option", { name: "Original Order" }));
  await user.click(screen.getByRole("combobox", { name: "Key notation" }));
  await user.click(screen.getByRole("option", { name: "Camelot Key" }));

  expect(history.location.search).toBe("?id=first&other=keep");
  expect(history.location.hash).toBe("#tracks");
  expect(history.length).toBe(1);
  expect(history.action).toBe("REPLACE");
  expect(requests).toHaveLength(requestCount);
  await user.click(screen.getByRole("combobox", { name: "Key notation" }));
  await user.click(screen.getByRole("option", { name: "Standard Key" }));
  act(() => history.push("/playlist?id=second"));
  expect(screen.getByRole("combobox", { name: "Key notation" }).textContent).toBe("Camelot Key");
  act(() => history.goBack());
  expect(screen.getByRole("combobox", { name: "Key notation" }).textContent).toBe("Standard Key");
  act(() => history.goForward());
  expect(screen.getByRole("combobox", { name: "Key notation" }).textContent).toBe("Camelot Key");
});

it("submitted searches start at defaults and Back restores both options", async () => {
  const requests = mockSpotify(() => ({ tracks: { items: [] } }));
  const { client } = createQueryTestContext();
  const { history, user } = renderWithProviders(<Search />, {
    client,
    path: "/search?type=track&track=first&sort=tempo&keyNotation=standard",
  });
  await screen.findByRole("table");
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Sort by Tempo");

  await user.click(screen.getByRole("button", { name: "Search" }));

  expect(history.location.search).toBe("?type=track&track=first");
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Original Order");
  expect(screen.getByRole("combobox", { name: "Key notation" }).textContent).toBe("Camelot Key");
  expect(requests).toHaveLength(1);
  act(() => history.goBack());
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Sort by Tempo");
  expect(screen.getByRole("combobox", { name: "Key notation" }).textContent).toBe("Standard Key");
});

it("album track results restore options from a direct URL and selectors do not fetch", async () => {
  const requests = mockSpotify((url) => {
    if (url.pathname.endsWith("/tracks")) return { items: [], total: 0 };
    return { name: "Night Album", artists: [{ name: "DJ" }] };
  });
  const { client } = createQueryTestContext();
  const { history, user } = renderWithProviders(<Search />, {
    client,
    path: "/search?view=album&albumId=night&sort=tempo&keyNotation=standard",
  });
  await screen.findByRole("table");
  const requestCount = requests.length;
  expect(screen.getByRole("combobox", { name: "Key notation" }).textContent).toBe("Standard Key");

  await user.click(screen.getByRole("combobox", { name: "Sort by" }));
  await user.click(screen.getByRole("option", { name: "Original Order" }));
  await user.click(screen.getByRole("combobox", { name: "Key notation" }));
  await user.click(screen.getByRole("option", { name: "Camelot Key" }));

  expect(history.location.search).toBe("?view=album&albumId=night");
  expect(requests).toHaveLength(requestCount);
});

it("opening a playlist omits the previous view options", async () => {
  const { history, user } = renderWithProviders(
    <PlaylistItems playlistsToRender={[playlistFactory({ id: "new", name: "New Playlist" })]} />,
    { path: "/search?type=playlist&playlist=night&sort=tempo&keyNotation=standard" }
  );

  await user.click(screen.getByText("New Playlist"));

  expect(history.location.pathname + history.location.search).toBe("/playlist?id=new");
});

it("opening an album omits the previous view options", async () => {
  const { history, user } = renderWithProviders(
    <Albums
      albums={[
        {
          album_type: "album",
          total_tracks: 0,
          available_markets: [],
          external_urls: {},
          href: "https://api.spotify.com/v1/albums/new",
          release_date_precision: "day",
          type: "album",
          uri: "spotify:album:new",
          id: "new",
          name: "New Album",
          artists: [{ name: "DJ" }],
          images: [],
          release_date: "2026-01-01",
        },
      ]}
    />,
    { path: "/search?type=album&album=night&sort=tempo&keyNotation=standard" }
  );

  await user.click(screen.getByText(/New Album/));

  expect(history.location.pathname + history.location.search).toBe(
    "/search?view=album&albumId=new"
  );
});

it("entering recommendations from another page omits both options", async () => {
  const { history, user } = renderWithProviders(
    <Tracks
      tracks={[trackFactory({ id: "fresh", key: "0", mode: "1" })]}
      keyNotation="standard"
      sortOption="tempo"
      isPending={false}
      error={null}
    />,
    { path: "/playlist?id=old&sort=tempo&keyNotation=standard" }
  );

  await user.click(screen.getByRole("cell", { name: "C" }));

  expect(history.location.pathname + history.location.search).toBe("/recommended/?id=fresh");
});
