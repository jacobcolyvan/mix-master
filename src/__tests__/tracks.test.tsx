// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { expect, it } from "vitest";

import Tracks from "../components/Tracks";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { trackFactory } from "./helpers/testFixtures";

it("shows loading before tracks arrive", () => {
  renderWithProviders(<Tracks tracks={null} isPending error={null} />);

  expect(screen.getByRole("progressbar")).toBeTruthy();
  expect(screen.queryByRole("table")).toBeNull();
});

it("explains a paused first load", () => {
  renderWithProviders(<Tracks tracks={null} isPending isPaused error={null} />);

  expect(screen.getByText("Offline — waiting for a connection to Spotify.")).toBeTruthy();
  expect(screen.queryByRole("progressbar")).toBeNull();
});

it("explains a failed first load", () => {
  renderWithProviders(<Tracks tracks={null} isPending={false} error={new Error("Unavailable")} />);

  expect(screen.getByRole("alert").textContent).toBe(
    "Unable to load tracks from Spotify. Please try again."
  );
});

it("renders the supplied tracks", () => {
  renderWithProviders(
    <Tracks
      tracks={[trackFactory({ name: "Night Set", artists: ["Night DJ"] })]}
      isPending={false}
      error={null}
    />
  );

  expect(screen.getByRole("cell", { name: /Night Set – Night DJ/ })).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

it.each(["error", "pause"])("keeps cached tracks visible during a background %s", (state) => {
  const tracks = [trackFactory({ name: "Cached Track" })];
  const { rerender } = renderWithProviders(
    <Tracks tracks={tracks} isPending={false} error={null} />
  );

  rerender(
    <Tracks
      tracks={tracks}
      isPending={false}
      isPaused={state === "pause"}
      error={state === "error" ? new Error("Unavailable") : null}
    />
  );

  expect(screen.getByRole("cell", { name: /Cached Track/ })).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByText(/Offline/)).toBeNull();
});
