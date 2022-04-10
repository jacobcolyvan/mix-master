import { createSlice } from '@reduxjs/toolkit';
import { SearchOptions, SearchResults, SeedAttributes } from '../types';

export interface ControlsState {
  matchRecsToSeedTrackKey: boolean;
  searchOptionValues: SearchOptions;
  searchResultValues: SearchResults;
  seedAttributes: SeedAttributes; // currently seedParams
  sortTracksBy: // currently sortOption
    | 'default'
    | 'duration'
    | 'popularity'
    | 'valence'
    | 'tempo'
    | 'durationThenKey'
    | 'major/minor'
    | 'energyThenKey'
    | 'tempoThenKey';
}

const initialState: ControlsState = {
  matchRecsToSeedTrackKey: false,
  searchOptionValues: {
    searchType: 'track',
    albumSearchQuery: '',
    artistSearchQuery: '', // previously just artist
    playlistSearchQuery: '',
    trackSearchQuery: '',
  },
  searchResultValues: {
    albumResults: null, // these have been changed
    playlistResults: null,
    trackResults: null,
  },
  seedAttributes: {
    tempo: null,
    energy: null,
    duration: null,
    popularity: null,
    intrumentalness: null,
    valence: null,
    danceability: null,
    liveness: null,
    speechiness: null,
    acousticness: null,
    genre: null,
  },
  sortTracksBy: 'default',
};

// For filter and search controls/params
const controlsSlice = createSlice({
  name: 'controlsSlice',
  initialState,
  reducers: {},
});

export const {} = controlsSlice.actions;

export default controlsSlice.reducer;
