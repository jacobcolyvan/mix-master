// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { expect, it } from "vitest";

import Tracks from "../components/Tracks";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { trackFactory } from "./helpers/testFixtures";

it("shows loading before tracks arrive", () => {
  renderWithProviders(<Tracks keyNotation="camelot" tracks={null} isPending error={null} />);

  expect(screen.getByRole("progressbar")).toBeTruthy();
  expect(screen.queryByRole("table")).toBeNull();
});

it("explains a paused first load", () => {
  renderWithProviders(
    <Tracks keyNotation="camelot" tracks={null} isPending isPaused error={null} />
  );

  expect(screen.getByText("Offline — waiting for a connection to Spotify.")).toBeTruthy();
  expect(screen.queryByRole("progressbar")).toBeNull();
});

it("explains a failed first load", () => {
  renderWithProviders(
    <Tracks
      keyNotation="camelot"
      tracks={null}
      isPending={false}
      error={new Error("Unavailable")}
    />
  );

  expect(screen.getByRole("alert").textContent).toBe(
    "Unable to load tracks from Spotify. Please try again."
  );
});

it("uses the supplied notation for visible keys and key sorting", () => {
  const tracks = [
    trackFactory({ name: "A major", key: "9", mode: "1" }),
    trackFactory({ name: "B major", key: "11", mode: "1" }),
  ];
  const { rerender } = renderWithProviders(
    <Tracks
      tracks={tracks}
      keyNotation="camelot"
      sortOption="major/minor"
      isPending={false}
      error={null}
    />
  );
  expect(screen.getAllByRole("row")[1].textContent).toContain("B major");
  expect(screen.getByRole("cell", { name: "1B" })).toBeTruthy();

  rerender(
    <Tracks
      tracks={tracks}
      keyNotation="standard"
      sortOption="major/minor"
      isPending={false}
      error={null}
    />
  );

  expect(screen.getAllByRole("row")[1].textContent).toContain("A major");
  expect(screen.getByRole("cell", { name: "A" })).toBeTruthy();
  expect(screen.queryByRole("cell", { name: "1B" })).toBeNull();
});

it("renders the supplied tracks", () => {
  renderWithProviders(
    <Tracks
      keyNotation="camelot"
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
    <Tracks keyNotation="camelot" tracks={tracks} isPending={false} error={null} />
  );

  rerender(
    <Tracks
      keyNotation="camelot"
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
