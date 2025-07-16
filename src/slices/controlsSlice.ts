import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { History } from "history";

import { AppThunk, RootState } from "../app/store";
import {
  CurrentSearchQueryOptions,
  CurrentSearchQueryOptionsKeys,
  SearchResultsType,
  SeedAttributes,
  TrackSortByChoices,
} from "../types";
import { selectSortedTracks, setSortedTracks, setTracks } from "./itemsSlice";

export interface ControlsState {
  matchRecsToSeedTrackKey: boolean;
  currentSearchQueries: CurrentSearchQueryOptions;
  searchResultValues: SearchResultsType;
  hasCurrentSearchResults: boolean;
  // RecommendedTracks Page
  seedAttributes: SeedAttributes;
  activeSeedAttributes: string[]; // active seedAttributes keys
  sortTracksBy: TrackSortByChoices; // currently sortOption
  albumName: string | null;
  isSearching: boolean;
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
  searchResultValues: {
    albumResults: null, // these have been changed
    playlistResults: null,
    trackResults: null,
  },
  hasCurrentSearchResults: false,
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
  albumName: "",
  isSearching: false,
};

// For filter and search controls/params
const controlsSlice = createSlice({
  name: "controlsSlice",
  initialState,
  reducers: {
    setSeedAttributes: (state, action: PayloadAction<SeedAttributes>) => {
      state.seedAttributes = action.payload;
    },
    setCurrentSearchQueries: (state, action: PayloadAction<CurrentSearchQueryOptions>) => {
      state.currentSearchQueries = action.payload;
    },
    setHasCurrentSearchResults: (state, action: PayloadAction<boolean>) => {
      state.hasCurrentSearchResults = action.payload;
    },
    setSearchResultValues: (state, action: PayloadAction<SearchResultsType>) => {
      state.searchResultValues = action.payload;
    },
    setSortTracksBy: (state, action: PayloadAction<TrackSortByChoices>) => {
      state.sortTracksBy = action.payload;
    },
    invertMatchRecsToSeedTrackKey: (state) => {
      state.matchRecsToSeedTrackKey = !state.matchRecsToSeedTrackKey;
    },
    setAlbumName: (state, action: PayloadAction<string | null>) => {
      state.albumName = action.payload;
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
  },
});
export default controlsSlice.reducer;

export const {
  invertMatchRecsToSeedTrackKey,
  setSeedAttributes,
  setHasCurrentSearchResults,
  setCurrentSearchQueries,
  setSearchResultValues,
  setSortTracksBy,
  setAlbumName,
  setIsSearching,
} = controlsSlice.actions;

// --------------------------
// Selectors

export const selectCurrentSearchQueries = (state: RootState): CurrentSearchQueryOptions => {
  return state?.controlsSlice.currentSearchQueries;
};

export const selectAlbumName = (state: RootState): string | null => {
  return state?.controlsSlice.albumName;
};

export const selectSearchResultValues = (state: RootState): SearchResultsType => {
  return state?.controlsSlice.searchResultValues;
};

export const selectSortTracksBy = (state: RootState): TrackSortByChoices => {
  return state?.controlsSlice.sortTracksBy;
};

export const selectIsSearching = (state: RootState): boolean => {
  return state?.controlsSlice.isSearching;
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
        [attributeName]: { value: updatedValue, maxOrMin: updatedMaxOrMinFilter },
      })
    );
  };
};

export const saveSearchQueryChange = (
  key: CurrentSearchQueryOptionsKeys,
  value: string | unknown
): AppThunk => {
  return (dispatch, getState) => {
    dispatch(setHasCurrentSearchResults(false));
    dispatch(
      setSearchResultValues({
        albumResults: null,
        playlistResults: null, // was '' *shrug*
        trackResults: null,
      })
    );

    if (typeof value !== "string") return;

    const currentSearchQueries = selectCurrentSearchQueries(getState());
    dispatch(setCurrentSearchQueries({ ...currentSearchQueries, [key]: value }));
  };
};

export const resetSearchState = (resetSearchQueries = true): AppThunk => {
  return (dispatch, _) => {
    dispatch(setHasCurrentSearchResults(false));
    dispatch(
      setSearchResultValues({
        albumResults: null, // these have been changed
        playlistResults: null,
        trackResults: null,
      })
    );
    dispatch(setAlbumName(null));
    setSortedTracks(null);
    setTracks(null);

    if (!resetSearchQueries) return;
    dispatch(
      setCurrentSearchQueries({
        searchType: "track",
        albumSearchQuery: "",
        artistSearchQuery: "",
        playlistSearchQuery: "",
        trackSearchQuery: "",
      })
    );
  };
};

// TODO: delete this
// Is this actually a thunk?
export const handleSearchResultsChange = (key, value): AppThunk => {
  return async (dispatch, getState) => {
    const searchResultValues = getState().controlsSlice.searchResultValues;
    const updatedSearchResultValues = { ...searchResultValues, [key]: value };

    await dispatch(setSearchResultValues(updatedSearchResultValues));
    return updatedSearchResultValues;
  };
};

// TODO: this doesn't really work
export const updateSearchStateFromBrowserState = (history: History): AppThunk => {
  return (dispatch, _) => {
    const locationState = history.location?.state as
      | { currentSearchQueries?: any; searchResultValues?: any }
      | undefined;
    const { currentSearchQueries, searchResultValues } = locationState || {};
    if (!currentSearchQueries || !searchResultValues) {
      dispatch(resetSearchState());
      return;
    }

    const isEmptySearch = history.location.search === "?" || history.location.search === "";

    dispatch(setCurrentSearchQueries(currentSearchQueries));

    if (isEmptySearch) {
      dispatch(resetSearchState(false));
    } else {
      dispatch(setHasCurrentSearchResults(true));
      dispatch(setTracks(searchResultValues["tracks"]));
      dispatch(setSearchResultValues(searchResultValues));
    }
  };
};

// TODO: pretty useless (half works)
export const updateBrowserHistoryThunk = (slug: string, history: History): AppThunk => {
  return (_, getState) => {
    const { currentSearchQueries, searchResultValues, hasCurrentSearchResults } =
      getState().controlsSlice;
    const tracks = selectSortedTracks(getState());

    history.push(
      {
        pathname: "/search",
        search: `?${slug}`,
      },
      {
        currentSearchQueries: currentSearchQueries,
        searchResultValues: searchResultValues,
        currentSearchResults: hasCurrentSearchResults,
        tracks: tracks,
      }
    );
  };
};
