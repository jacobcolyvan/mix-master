// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, it } from "vitest";

import UserPlaylists from "../pages/UserPlaylists";
import { createQueryTestContext } from "./helpers/queryTestContext";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { mockSpotify } from "./helpers/spotifyHttp";
import { playlistFactory } from "./helpers/testFixtures";

it("groups playlists by the supplied display name", async () => {
  const requests = mockSpotify((url) => {
    if (url.pathname === "/v1/me/playlists") {
      return {
        items: [
          playlistFactory({ id: "followed", name: "Other DJ's Set" }),
          playlistFactory({ id: "created", name: "My Set", owner: { display_name: "Night DJ" } }),
        ],
        total: 2,
      };
    }
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { client } = createQueryTestContext();

  renderWithProviders(<UserPlaylists username="Night DJ" />, { client });

  expect(await screen.findByRole("heading", { name: "Created" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Followed" })).toBeTruthy();
  const lists = screen.getAllByRole("list");
  expect(within(lists[0]).getByText("My Set")).toBeTruthy();
  expect(within(lists[1]).getByText("Other DJ's Set")).toBeTruthy();
  expect(requests).toEqual(["/v1/me/playlists?limit=50&offset=0"]);
});
