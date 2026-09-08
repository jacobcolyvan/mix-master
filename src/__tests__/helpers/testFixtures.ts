// Fresh minimal Spotify payloads and app Track/Playlist fixtures, with no import-time hooks.
// Overrides are shallow; related IDs, keys and owner fields are not derived.
// Keep scenario-defining values explicit in each test.
import type { Playlist, Track } from "../../types";

export const rawTrack = (overrides: { id?: string; name?: string } = {}) => ({
  id: "track-one",
  name: "Midnight Signal",
  artists: [{ id: "artist-one", name: "Night Artist" }],
  ...overrides,
});

export const audioFeatures = () => ({ key: 0, mode: 1, tempo: 124, energy: 0.72 });

export const trackFactory = (overrides: Partial<Track> = {}): Track => ({
  id: "default-track",
  name: "Default Track",
  album: "Default Album",
  artists: ["Default Artist"],
  artist_genres: ["default genre"],
  release_date: "2020-01-01",
  analysis_url: "https://example.com/audio-analysis/default-track",
  track_popularity: "50",
  mode: "1",
  key: "0",
  tempo: "120",
  duration: "180000",
  energy: "0.5",
  danceability: "0.5",
  acousticness: "0.5",
  instrumentalness: "0.5",
  liveness: "0.5",
  loudness: "-10",
  speechiness: "0.1",
  valence: "0.5",
  parsedKeys: ["", "", ["", "0"]],
  ...overrides,
});

export const playlistFactory = (overrides: Partial<Playlist> = {}): Playlist => ({
  collaborative: false,
  description: "",
  external_urls: {},
  href: "https://api.spotify.com/v1/playlists/default",
  id: "default-playlist",
  images: [],
  name: "Default Playlist",
  owner: { display_name: "Someone Else" },
  primary_color: null,
  public: true,
  snapshot_id: "snapshot",
  tracks: { href: "https://api.spotify.com/v1/playlists/default/tracks", total: 0 },
  type: "playlist",
  uri: "spotify:playlist:default",
  ...overrides,
});
