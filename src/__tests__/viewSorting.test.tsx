// @vitest-environment jsdom
import { act, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import Playlist from "../pages/Playlist";
import Search from "../pages/Search";
import { createQueryTestContext } from "./helpers/queryTestContext";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { mockSpotify } from "./helpers/spotifyHttp";
import { playlistFactory } from "./helpers/testFixtures";

it("playlist sorting is local and resets for another playlist and Back", async () => {
  mockSpotify((url) => {
    if (url.pathname.endsWith("/tracks")) return { items: [], total: 0 };
    return playlistFactory();
  });
  const { client } = createQueryTestContext();
  const { history, user } = renderWithProviders(<Playlist username="DJ" />, {
    client,
    path: "/playlist?id=first&sort=energy",
  });
  await screen.findByRole("table");
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Original Order");

  await user.click(screen.getByRole("combobox", { name: "Sort by" }));
  await user.click(screen.getByRole("option", { name: "Sort by Tempo" }));

  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Sort by Tempo");
  expect(history.location.search).toBe("?id=first&sort=energy");
  expect(history.length).toBe(1);
  act(() => history.push("/playlist?id=second"));
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Original Order");
  act(() => history.goBack());
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Original Order");
});

it("search sorting is local and resets for another submitted search and Back", async () => {
  mockSpotify(() => ({ tracks: { items: [] } }));
  const { client } = createQueryTestContext();
  const { history, user } = renderWithProviders(<Search />, {
    client,
    path: "/search?type=track&track=first&sort=energy",
  });
  await screen.findByRole("table");
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Original Order");

  await user.click(screen.getByRole("combobox", { name: "Sort by" }));
  await user.click(screen.getByRole("option", { name: "Sort by Tempo" }));

  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Sort by Tempo");
  expect(history.location.search).toBe("?type=track&track=first&sort=energy");
  expect(history.length).toBe(1);
  act(() => history.push("/search?type=track&track=second"));
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Original Order");
  act(() => history.goBack());
  expect(screen.getByRole("combobox", { name: "Sort by" }).textContent).toBe("Original Order");
});
