// @vitest-environment jsdom
import { act, waitFor } from "@testing-library/react";
import { Route, Switch } from "react-router-dom";
import { expect, it } from "vitest";

import About from "../pages/About";
import Playlist from "../pages/Playlist";
import RecommendedTracks from "../pages/RecommendedTracks";
import Search from "../pages/Search";
import SpotifyLogin from "../pages/SpotifyLogin";
import UserPlaylists from "../pages/UserPlaylists";
import { playlistKey } from "../queries/playlistQueries";
import { deferred } from "./helpers/deferred";
import { createQueryTestContext } from "./helpers/queryTestContext";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { mockSpotify } from "./helpers/spotifyHttp";
import { playlistFactory } from "./helpers/testFixtures";

it.each([
  { page: <UserPlaylists username="Night DJ" />, title: "Playlists | Mix Master" },
  { page: <Search />, title: "Search | Mix Master" },
  { page: <RecommendedTracks />, title: "Recommendations | Mix Master" },
  { page: <About />, title: "About | Mix Master" },
  { page: <SpotifyLogin />, title: "Mix Master" },
  { page: <Playlist username="Night DJ" />, title: "Playlist | Mix Master" },
])("sets $title and resets on unmount", ({ page, title }) => {
  const { client } = createQueryTestContext();
  client.setQueryData(["playlists"], []);

  const { unmount } = renderWithProviders(page, { client });

  expect(document.title).toBe(title);

  unmount();

  expect(document.title).toBe("Mix Master");
});

it("uses a cached playlist name on direct entry and clears it while another playlist loads", async () => {
  const first = playlistFactory({ id: "first", name: "Late Night Grooves" });
  const second = playlistFactory({ id: "second", name: "Morning Signals" });
  const secondResponse = deferred<typeof second>();
  const { client } = createQueryTestContext();
  client.setQueryData(playlistKey("first"), first);
  mockSpotify((url) => {
    if (url.pathname.endsWith("/tracks")) return { items: [], total: 0 };
    if (url.pathname === "/v1/playlists/first") return first;
    if (url.pathname === "/v1/playlists/second") return secondResponse.promise;
    throw new Error(`Unexpected Spotify request: ${url}`);
  });

  const { history } = renderWithProviders(<Playlist username="Night DJ" />, {
    client,
    path: "/playlist?id=first",
  });

  expect(document.title).toBe("Late Night Grooves | Mix Master");

  act(() => history.push("/playlist?id=second"));

  expect(document.title).toBe("Playlist | Mix Master");

  await act(async () => secondResponse.resolve(second));

  await waitFor(() => expect(document.title).toBe("Morning Signals | Mix Master"));

  act(() => history.goBack());

  expect(document.title).toBe("Late Night Grooves | Mix Master");

  act(() => history.goForward());

  expect(document.title).toBe("Morning Signals | Mix Master");
});

it("updates across page navigation and resets when returning to signed-out content", () => {
  const { client } = createQueryTestContext();
  const { history } = renderWithProviders(
    <Switch>
      <Route path="/about" component={About} />
      <Route path="/search" component={Search} />
      <Route path="/" component={SpotifyLogin} />
    </Switch>,
    { client, path: "/about" }
  );

  expect(document.title).toBe("About | Mix Master");

  act(() => history.push("/search"));

  expect(document.title).toBe("Search | Mix Master");

  act(() => history.goBack());

  expect(document.title).toBe("About | Mix Master");

  act(() => history.push("/"));

  expect(document.title).toBe("Mix Master");
});
