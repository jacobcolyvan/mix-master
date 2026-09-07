import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../app/store";
import { CurrentSearchQueryOptions, SeedAttributes, TrackSortByChoices } from "../types";

export interface ControlsState {
  matchRecsToSeedTrackKey: boolean;
  currentSearchQueries: CurrentSearchQueryOptions;
  // RecommendedTracks Page
  seedAttributes: SeedAttributes;
  activeSeedAttributes: string[]; // active seedAttributes keys
  sortTracksBy: TrackSortByChoices; // currently sortOption
}

const initialState: ControlsState = {
  matchRecsToSeedTrackKey: false,
  currentSearchQueries: {
    searchType: "track",
    albumSearchQuery: "",
    artistSearchQuery: "", // previously just artist
    playlistSearchQuery: "",
    trackSearchQuery: "",
  },
  seedAttributes: {
    tempo: {
      value: "",
      maxOrMinFilter: "target",
    },
    energy: {
      value: "",
      maxOrMinFilter: "target",
    },
    duration: {
      value: "",
      maxOrMinFilter: "target",
    },
    popularity: {
      value: "",
      maxOrMinFilter: "target",
    },
    intrumentalness: {
      value: "",
      maxOrMinFilter: "target",
    },
    valence: {
      value: false,
      maxOrMinFilter: "target",
    },
    danceability: {
      value: "",
      maxOrMinFilter: "target",
    },
    liveness: {
      value: "",
      maxOrMinFilter: "target",
    },
    speechiness: {
      value: "",
      maxOrMinFilter: "target",
    },
    acousticness: {
      value: "",
      maxOrMinFilter: "target",
    },
    genre: {
      value: "",
      maxOrMinFilter: "target",
    },
  },
  activeSeedAttributes: [],
  sortTracksBy: "default",
};

// For filter and search controls/params
const controlsSlice = createSlice({
  name: "controlsSlice",
  initialState,
  reducers: {
    setCurrentSearchQueries: (state, action: PayloadAction<CurrentSearchQueryOptions>) => {
      state.currentSearchQueries = action.payload;
    },
    resetSearchQueries: (state) => {
      state.currentSearchQueries = initialState.currentSearchQueries;
    },
    setSeedAttributes: (state, action: PayloadAction<SeedAttributes>) => {
      state.seedAttributes = action.payload;
    },
    setSortTracksBy: (state, action: PayloadAction<TrackSortByChoices>) => {
      state.sortTracksBy = action.payload;
    },
    invertMatchRecsToSeedTrackKey: (state) => {
      state.matchRecsToSeedTrackKey = !state.matchRecsToSeedTrackKey;
    },
  },
});
export default controlsSlice.reducer;

export const {
  invertMatchRecsToSeedTrackKey,
  resetSearchQueries,
  setCurrentSearchQueries,
  setSeedAttributes,
  setSortTracksBy,
} = controlsSlice.actions;

// --------------------------
// Selectors

export const selectCurrentSearchQueries = (state: RootState): CurrentSearchQueryOptions => {
  return state.controlsSlice.currentSearchQueries;
};

export const selectSortTracksBy = (state: RootState): TrackSortByChoices => {
  return state?.controlsSlice.sortTracksBy;
};

export const selectSeedAttributes = (state: RootState): SeedAttributes => {
  return state?.controlsSlice.seedAttributes;
};

// --------------------------
// Thunks

// TODO: debounce?
/**
 * Validate a (audio-feature) attribute against it's range_limit. \
 * On success, saves it with the intended max/min filter. \
 * To be used with a recommendations API call, see: \
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-recommendations
 */
export const saveSeedAttribute = (
  attributeName: string,
  value: string | false,
  maxOrMinFilter: "max" | "min" | "target" = "target"
): AppThunk => {
  return (dispatch, getState) => {
    const seedAttributes = selectSeedAttributes(getState());

    const updatedValue = value === false ? "" : value;
    const updatedMaxOrMinFilter = value === false ? "target" : maxOrMinFilter;

    dispatch(
      setSeedAttributes({
        ...seedAttributes,
        [attributeName]: { value: updatedValue, maxOrMinFilter: updatedMaxOrMinFilter },
      })
    );
  };
};
