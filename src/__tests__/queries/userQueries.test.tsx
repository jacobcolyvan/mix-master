// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { useCurrentUser } from "../../queries/userQueries";
import { createQueryTestContext } from "../helpers/queryTestContext";
import { mockSpotify } from "../helpers/spotifyHttp";

it.each(["Night DJ", null])(
  "keeps only display_name from the profile response (%s)",
  async (display_name) => {
    mockSpotify((url) => {
      if (url.pathname === "/v1/me/")
        return { display_name, email: "unused@example.com", id: "private-id" };

      throw new Error(`Unexpected Spotify request: ${url}`);
    });
    const { wrapper, client } = createQueryTestContext();

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual({ display_name }));
    expect(client.getQueryData(["currentUser"])).toEqual({ display_name });
  }
);

it("reuses a fresh cached profile without a request", () => {
  const requests = mockSpotify();
  const { wrapper, client } = createQueryTestContext();
  client.setQueryData(["currentUser"], { display_name: "Cached DJ" });

  const { result } = renderHook(() => useCurrentUser(), { wrapper });

  expect(result.current.data).toEqual({ display_name: "Cached DJ" });
  expect(requests).toEqual([]);
});
