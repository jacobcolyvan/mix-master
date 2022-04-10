export type Track = {};

export type Playlist = {};

export type SortedPlaylists = {
  created: Playlist[];
  followed: Playlist[];
  generated: Playlist[];
};

export type Album = {};

export type SeedAttributes = {
  tempo: string | null;
  energy: string | null;
  duration: string | null;
  popularity: string | null;
  intrumentalness: string | null;
  valence: string | null;
  danceability: string | null;
  liveness: string | null;
  speechiness: string | null;
  acousticness: string | null;
  genre: string | null;
};

export type SearchOptions = {
  searchType: 'track' | 'playlist' | 'album';
  albumSearchQuery: string;
  artistSearchQuery: string;
  playlistSearchQuery: string;
  trackSearchQuery: string;
};

export type SearchResults = {
  albumResults: Album[] | null;
  trackResults: Track[] | null;
  playlistResults: Playlist[] | null;
};
