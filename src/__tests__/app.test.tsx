// @vitest-environment jsdom
import { onlineManager } from "@tanstack/react-query";
import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import App from "../App";
import { isSignedIn, logout } from "../auth";
import { deferred } from "./helpers/deferred";
import { createQueryTestContext } from "./helpers/queryTestContext";
import { renderWithProviders } from "./helpers/renderWithProviders";
import { mockSpotify } from "./helpers/spotifyHttp";

// Auth status is fixed per test; the subscription does not emit logout notifications.
// Credential bootstrap and session changes belong to auth/lifecycle tests; HTTP and queries stay real.
vi.mock("../auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../auth")>()),
  isSignedIn: vi.fn(),
  subscribe: () => () => {},
  logout: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(isSignedIn).mockReturnValue(true);
  vi.mocked(logout).mockClear();
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  onlineManager.setOnline(true);
  window.history.replaceState(null, "", "/");
});

it("does not fetch a profile for signed-out login", async () => {
  vi.mocked(isSignedIn).mockReturnValue(false);
  const { client } = createQueryTestContext();
  const requests = mockSpotify();

  renderWithProviders(<App ready={Promise.resolve()} />, { client });

  expect(await screen.findByRole("button", { name: "Authorise Spotify" })).toBeTruthy();
  expect(client.getQueryState(["currentUser"])).toBeUndefined();
  expect(requests).toEqual([]);
});

it("keeps navigation visible while startup and the profile gate page content", async () => {
  window.history.replaceState(null, "", "/about");
  const startupReady = deferred<void>();
  const profileResponse = deferred<{ display_name: string }>();
  const { client } = createQueryTestContext();
  const requests = mockSpotify((url) => {
    if (url.pathname === "/v1/me/") return profileResponse.promise;
    throw new Error(`Unexpected Spotify request: ${url}`);
  });

  // Before startup finishes, no profile request is made.
  renderWithProviders(<App ready={startupReady.promise} />, { client });

  expect(screen.getByRole("heading", { name: "Mix Master" })).toBeTruthy();
  expect(screen.getByText("Search")).toBeTruthy();
  expect(screen.getByRole("progressbar").closest(".main-content__div")).not.toBeNull();
  expect(requests).toEqual([]);

  // Once startup finishes, wait for the profile before showing the page.
  await act(async () => startupReady.resolve());

  await waitFor(() => expect(requests).toEqual(["/v1/me/"]));
  expect(screen.getByRole("heading", { name: "Mix Master" })).toBeTruthy();
  expect(screen.getByRole("progressbar").closest(".main-content__div")).not.toBeNull();
  expect(screen.queryByRole("heading", { name: "This is a website to:" })).toBeNull();

  // A usable profile allows the page to render.
  profileResponse.resolve({ display_name: "Night DJ" });

  expect(await screen.findByRole("heading", { name: "This is a website to:" })).toBeTruthy();
});

it("blocks About on profile failure while leaving navigation and logout accessible", async () => {
  window.history.replaceState(null, "", "/about");
  const { client } = createQueryTestContext();
  mockSpotify((url) => {
    if (url.pathname === "/v1/me/") throw new Error("Profile unavailable");
    throw new Error(`Unexpected Spotify request: ${url}`);
  });

  const { user } = renderWithProviders(<App ready={Promise.resolve()} />, { client });

  expect((await screen.findByRole("alert")).textContent).toContain(
    "Unable to load your Spotify profile. Please reload the page."
  );
  expect(screen.getByText("Search")).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "This is a website to:" })).toBeNull();

  await user.click(screen.getByRole("button", { name: "Logout" }));

  expect(logout).toHaveBeenCalledWith("signed_out");
});

it("shows a reload error when offline without a profile", async () => {
  window.history.replaceState(null, "", "/about");
  const { client } = createQueryTestContext();
  onlineManager.setOnline(false);
  const requests = mockSpotify();

  renderWithProviders(<App ready={Promise.resolve()} />, { client });

  expect((await screen.findByRole("alert")).textContent).toContain(
    "Unable to load your Spotify profile. Please reload the page."
  );
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(requests).toEqual([]);
});

it.each([null, ""])("asks for a display name when it is %j", async (display_name) => {
  window.history.replaceState(null, "", "/about");
  const { client } = createQueryTestContext();
  mockSpotify((url) => {
    if (url.pathname === "/v1/me/") return { display_name };
    throw new Error(`Unexpected Spotify request: ${url}`);
  });

  renderWithProviders(<App ready={Promise.resolve()} />, { client });

  expect((await screen.findByRole("alert")).textContent).toContain(
    "Your Spotify profile has no display name. Add one in Spotify, then reload the page."
  );
  expect(screen.queryByRole("heading", { name: "This is a website to:" })).toBeNull();
});

it("renders with a cached usable profile after a failed background refresh", async () => {
  window.history.replaceState(null, "", "/about");
  const { client } = createQueryTestContext();
  // An old timestamp makes the cached profile eligible for background refresh.
  client.setQueryData(["currentUser"], { display_name: "Night DJ" }, { updatedAt: 1 });
  mockSpotify((url) => {
    if (url.pathname === "/v1/me/") throw new Error("Profile unavailable");
    throw new Error(`Unexpected Spotify request: ${url}`);
  });

  renderWithProviders(<App ready={Promise.resolve()} />, { client });

  await waitFor(() => expect(client.getQueryState(["currentUser"])?.status).toBe("error"));
  expect(screen.getByRole("heading", { name: "This is a website to:" })).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

it("renders with a cached usable profile during a paused background refresh", async () => {
  window.history.replaceState(null, "", "/about");
  const { client } = createQueryTestContext();
  // An old timestamp makes the cached profile eligible for background refresh.
  client.setQueryData(["currentUser"], { display_name: "Night DJ" }, { updatedAt: 1 });
  onlineManager.setOnline(false);
  const requests = mockSpotify();

  renderWithProviders(<App ready={Promise.resolve()} />, { client });

  await waitFor(() => expect(client.getQueryState(["currentUser"])?.fetchStatus).toBe("paused"));
  expect(screen.getByRole("heading", { name: "This is a website to:" })).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(requests).toEqual([]);
});
