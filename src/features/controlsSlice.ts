import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../app/store';
import {
  CurrentSearchQueryOptions,
  CurrentSearchQueryOptionsKeys,
  SearchResultsType,
  SeedAttributes,
  TrackSortByChoices,
} from '../types';

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
  hasCurrentSearchResults: false,
  seedAttributes: {
    tempo: {
      value: '',
      maxOrMinFilter: 'target',
    },
    energy: {
      value: '',
      maxOrMinFilter: 'target',
    },
    duration: {
      value: '',
      maxOrMinFilter: 'target',
    },
    popularity: {
      value: '',
      maxOrMinFilter: 'target',
    },
    intrumentalness: {
      value: '',
      maxOrMinFilter: 'target',
    },
    valence: {
      value: false,
      maxOrMinFilter: 'target',
    },
    danceability: {
      value: '',
      maxOrMinFilter: 'target',
    },
    liveness: {
      value: '',
      maxOrMinFilter: 'target',
    },
    speechiness: {
      value: '',
      maxOrMinFilter: 'target',
    },
    acousticness: {
      value: '',
      maxOrMinFilter: 'target',
    },
    genre: {
      value: '',
      maxOrMinFilter: 'target',
    },
  },
  activeSeedAttributes: [],
  sortTracksBy: 'default',
  albumName: '',
  isSearching: false,
};

// For filter and search controls/params
const controlsSlice = createSlice({
  name: 'controlsSlice',
  initialState,
  reducers: {
    setSeedAttributes: (state, action: PayloadAction<SeedAttributes>) => {
      state.seedAttributes = action.payload;
    },
    setCurrentSearchQueries: (
      state,
      action: PayloadAction<CurrentSearchQueryOptions>
    ) => {
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
    showOnlyPlaylistTracks: (state) => {
      state.searchResultValues = {
        ...state.searchResultValues,
        playlistResults: null,
      };
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
  showOnlyPlaylistTracks,
} = controlsSlice.actions;

// --------------------------
// Selectors

export const selectCurrentSearchQueries = (
  state: RootState
): CurrentSearchQueryOptions => {
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
  maxOrMinFilter: 'max' | 'min' | 'target' = 'target'
): AppThunk => {
  return (dispatch, getState) => {
    const { seedAttributes } = getState().controlsSlice;

    if (value === false) {
      // Set value to be empty as we no longer want to use it
      dispatch(
        setSeedAttributes({
          ...seedAttributes,
          [attributeName]: { value: '', maxOrMin: 'target' },
        })
      );
    } else {
      dispatch(
        setSeedAttributes({
          ...seedAttributes,
          [attributeName]: { value: value, maxOrMin: maxOrMinFilter },
        })
      );
    }
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

    console.log(key, value);

    if (typeof value !== 'string') return;
    const { currentSearchQueries } = getState().controlsSlice;
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
    // setSortedTracks(false);
    // setTracks(false);

    if (!resetSearchQueries) return;
    dispatch(
      setCurrentSearchQueries({
        searchType: 'track',
        albumSearchQuery: '',
        artistSearchQuery: '',
        playlistSearchQuery: '',
        trackSearchQuery: '',
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