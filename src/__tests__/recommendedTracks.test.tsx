// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import RecommendedTracks from "../pages/RecommendedTracks";
import { seedTrackKey } from "../queries/trackQueries";
import { deferred } from "./helpers/deferred";
import { createQueryTestContext } from "./helpers/queryTestContext";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { mockSpotify } from "./helpers/spotifyHttp";
import { audioFeatures, rawTrack, trackFactory } from "./helpers/testFixtures";

it("lets you edit while loading and apply when loading finishes", async () => {
  const pending = deferred<{ tracks: [] }>();
  const requests = mockSpotify(() => pending.promise);
  const { client } = createQueryTestContext();
  client.setQueryData(seedTrackKey("seed"), trackFactory({ id: "seed" }));
  const { history, user } = renderWithProviders(<RecommendedTracks />, {
    client,
    path: "/recommended/?id=seed",
  });
  await waitFor(() => expect(requests).toHaveLength(1));

  fireEvent.change(screen.getByRole("textbox", { name: /target tempo/ }), {
    target: { value: "126" },
  });
  await user.click(screen.getByRole("radio", { name: "Min" }));

  expect(
    (screen.getByRole("button", { name: "Apply changes" }) as HTMLButtonElement).disabled
  ).toBe(true);
  expect(history.location.search).toBe("?id=seed");
  expect(requests).toHaveLength(1);
  await act(async () => pending.resolve({ tracks: [] }));
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Apply changes" }) as HTMLButtonElement).disabled
    ).toBe(false)
  );

  await user.click(screen.getByRole("button", { name: "Apply changes" }));
  await waitFor(() => expect(requests).toHaveLength(2));

  expect(requests[1]).toContain("min_tempo=126");
});

it("selector replacements preserve drafts, update seed notation and do not fetch", async () => {
  const requests = mockSpotify(() => ({ tracks: [] }));
  const { client } = createQueryTestContext();
  client.setQueryData(
    seedTrackKey("seed"),
    trackFactory({ id: "seed", parsedKeys: ["8B", "C", ["9", "0"]] })
  );
  const { history, user } = renderWithProviders(<RecommendedTracks />, {
    client,
    path: "/recommended/?id=seed",
  });
  await screen.findByRole("button", { name: "Refresh recommendations" });
  fireEvent.change(screen.getByRole("textbox", { name: /target tempo/ }), {
    target: { value: "invalid" },
  });

  await user.click(screen.getByRole("combobox", { name: "Sort by" }));
  await user.click(screen.getByRole("option", { name: "Sort by Tempo" }));
  await user.click(screen.getByRole("combobox", { name: "Key notation" }));
  await user.click(screen.getByRole("option", { name: "Standard Key" }));

  expect((screen.getByRole("textbox", { name: /target tempo/ }) as HTMLInputElement).value).toBe(
    "invalid"
  );
  expect(screen.getByText("Invalid range value")).toBeTruthy();
  expect(screen.getByRole("cell", { name: "C" })).toBeTruthy();
  expect(requests).toHaveLength(1);
  expect(history.length).toBe(1);
  fireEvent.change(screen.getByRole("textbox", { name: /target tempo/ }), {
    target: { value: "126" },
  });
  await user.click(screen.getByRole("button", { name: "Apply changes" }));
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(Object.fromEntries(new URLSearchParams(history.location.search))).toEqual({
    id: "seed",
    tempo: "target:126",
    sort: "tempo",
    keyNotation: "standard",
  });
});

it("Reset clears invalid inputs but keeps key matching without fetching", async () => {
  const requests = mockSpotify(() => ({ tracks: [] }));
  const { client } = createQueryTestContext();
  client.setQueryData(seedTrackKey("seed"), trackFactory({ id: "seed" }));
  const { user } = renderWithProviders(<RecommendedTracks />, {
    client,
    path: "/recommended/?id=seed&tempo=max:120",
  });
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Refresh recommendations" }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  );

  fireEvent.change(screen.getByRole("textbox", { name: /max tempo/ }), {
    target: { value: "invalid" },
  });
  expect(screen.getByText("Invalid range value")).toBeTruthy();
  expect(
    (screen.getByRole("button", { name: "Apply changes" }) as HTMLButtonElement).disabled
  ).toBe(true);
  expect(requests).toHaveLength(1);
  await user.click(screen.getByRole("checkbox", { name: /Match recommendations/ }));
  await user.click(screen.getByRole("button", { name: "Reset tuning" }));

  expect(
    (screen.getByRole("checkbox", { name: /Match recommendations/ }) as HTMLInputElement).checked
  ).toBe(true);
  expect((screen.getByRole("textbox", { name: /target tempo/ }) as HTMLInputElement).value).toBe(
    ""
  );
  expect(screen.queryByText("Invalid range value")).toBeNull();
  expect(requests).toHaveLength(1);
});

it("Retry repeats the failed request without changing the URL or history", async () => {
  const requests = mockSpotify(() => {
    throw new Error("Spotify unavailable");
  });
  const { client } = createQueryTestContext();
  client.setQueryData(seedTrackKey("seed"), trackFactory({ id: "seed" }));
  const { history, user } = renderWithProviders(<RecommendedTracks />, {
    client,
    path: "/recommended/?id=seed&tempo=target:128",
  });
  await screen.findByRole("button", { name: "Retry recommendations" });

  expect(screen.getByRole("alert").textContent).toContain("Unable to load tracks");
  expect(new URLSearchParams(history.location.search).get("tempo")).toBe("target:128");
  await user.click(screen.getByRole("button", { name: "Retry recommendations" }));
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[1]).toBe(requests[0]);
  expect(history.length).toBe(1);
});

it("choosing another seed keeps saved tuning and both view options, not unfinished edits", async () => {
  mockSpotify((url) => {
    if (url.pathname === "/v1/recommendations") return { tracks: [rawTrack({ id: "next" })] };
    if (url.pathname === "/v1/audio-features/") return { audio_features: [audioFeatures()] };
    if (url.pathname === "/v1/artists") return { artists: [{ genres: ["house"] }] };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });
  const { client } = createQueryTestContext();
  client.setQueryData(seedTrackKey("seed"), trackFactory({ id: "seed" }));
  client.setQueryData(seedTrackKey("next"), trackFactory({ id: "next" }));
  const { history, user } = renderWithProviders(<RecommendedTracks />, {
    client,
    path: "/recommended/?id=seed&tempo=min:120&sort=tempo&keyNotation=standard",
  });
  await screen.findByRole("cell", { name: "C" });

  fireEvent.change(screen.getByRole("textbox", { name: /min tempo/ }), {
    target: { value: "unfinished" },
  });
  await user.click(screen.getByRole("cell", { name: "C" }));

  expect(Object.fromEntries(new URLSearchParams(history.location.search))).toEqual({
    id: "next",
    tempo: "min:120",
    sort: "tempo",
    keyNotation: "standard",
  });
  expect((screen.getByRole("textbox", { name: /min tempo/ }) as HTMLInputElement).value).toBe(
    "120"
  );
});
