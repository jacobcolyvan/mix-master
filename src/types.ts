export type Track = {
  id: string;
  name: string;
  album: string;
  artists: string[];
  artist_genres: string[];
  release_date: string;
  analysis_url?: string;
  // TODO: fix below
  // NOTE: this should all be number not string,
  // but the sorter function complains otherwise
  track_popularity: string; // 0-100

  // from audio analysis
  // NOTE: these should all be number not string
  mode: string; // 1 || 0
  key: string; // -1 (no key)-11
  tempo: string; // >0
  duration: string; // ms
  energy: string; // 0-1
  danceability: string; // 0-1
  acousticness: string; // 0-1
  instrumentalness: string; // 0-1
  liveness: string; // 0-1;
  loudness: string; // -60-0db
  speechiness: string; // 0-1;
  valence: string; // 0-1;
  parsedKeys: any[];
};

// Playlist response object
export type Playlist = {
  collaborative: boolean;
  description: string;
  external_urls: { [key: string]: any };
  href: string;
  id: string;
  images: { [key: string]: any }[];
  name: string;
  owner: { [key: string]: any };
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: { href: string; total: number };
  type: string;
  uri: string;
};

export type SortedPlaylists = {
  created: Playlist[];
  followed: Playlist[];
  generated: Playlist[];
};

// TODO: make this more strict
export type Album = { [key: string]: any };

export type SeedAttributeDetails = {
  value: string | false;
  maxOrMinFilter: 'max' | 'min' | 'target';
};

export type SeedAttributes = {
  // possibly artist & multiple tracks too
  tempo: SeedAttributeDetails;
  duration: SeedAttributeDetails;
  popularity: SeedAttributeDetails;
  liveness: SeedAttributeDetails;
  energy: SeedAttributeDetails;
  intrumentalness: SeedAttributeDetails;
  valence: SeedAttributeDetails;
  danceability: SeedAttributeDetails;
  speechiness: SeedAttributeDetails;
  acousticness: SeedAttributeDetails;
  genre: SeedAttributeDetails;
};

export type CurrentSearchQueryOptions = {
  searchType: 'track' | 'playlist' | 'album';
  albumSearchQuery: string;
  artistSearchQuery: string;
  playlistSearchQuery: string;
  trackSearchQuery: string;
};

//  not sure why keyof wouldn't work here
export type CurrentSearchQueryOptionsKeys =
  | 'searchType'
  | 'albumSearchQuery'
  | 'artistSearchQuery'
  | 'playlistSearchQuery'
  | 'trackSearchQuery';

export type SearchResultsType = {
  albumResults: Album[] | null;
  trackResults: Track[] | null;
  playlistResults: Playlist[] | null;
};

export type AttributeChoiceDetails = {
  input_name: string;
  extra_text: boolean | string;
  range_limit: number;
  validateField: (value: number) => boolean;
};

export type TrackSortByChoices =
  | 'default'
  | 'duration'
  | 'popularity'
  | 'valence'
  | 'tempo'
  | 'energy'
  | 'durationThenKey'
  | 'major/minor'
  | 'energyThenKey'
  | 'tempoThenKey'
  | 'valenceThenKey';

export type KeyOptionTypes = 'camelot' | 'standard';
