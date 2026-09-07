// Substitutes Spotify's Axios transport while retaining interceptors and query functions,
// without starting auth. Importing installs a reject-unhandled transport before each test
// and restores the original adapter afterwards. Handlers may return data or promises,
// or throw; undefined responses are rejected. Returns a live pathname-plus-query request log.
import { afterEach, beforeEach } from "vitest";

import { spotifyApi } from "../../auth";

const originalAdapter = spotifyApi.defaults.adapter;
const unexpectedRequest = (url: URL): never => {
  throw new Error(`Unexpected Spotify request: ${url}`);
};

export const mockSpotify = (respond: (url: URL) => unknown = unexpectedRequest) => {
  const requests: string[] = [];
  spotifyApi.defaults.adapter = async (config) => {
    const url = new URL(spotifyApi.getUri(config));
    requests.push(url.pathname + url.search);
    const data = await respond(url);
    if (data === undefined) unexpectedRequest(url);
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
  return requests;
};

beforeEach(() => {
  mockSpotify();
});
afterEach(() => {
  spotifyApi.defaults.adapter = originalAdapter;
});
