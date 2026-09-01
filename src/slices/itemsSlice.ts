import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { History } from "history";

import { AppThunk, RootState } from "../app/store";
import { spotifyApi } from "../auth";
import { Album, Playlist, SortedPlaylists, Track } from "../types";
import { camelotKeySort, standardKeySort } from "../utils/commonFunctions";
import {
  createSearchRequestUrl,
  generateRecommendedTrackUrl,
  getTrackAndArtistFeatures,
  getTracksFromSpotify,
} from "../utils/requestUtils";
import { fetchOffsetPages } from "../utils/spotifyFetch";
import {
  handleSearchResultsChange,
  selectSortTracksBy,
  setAlbumName,
  setHasCurrentSearchResults,
  setIsSearching,
  setSearchResultValues,
  updateBrowserHistoryThunk,
} from "./controlsSlice";
import { getUsername, selectKeyDisplayOption } from "./settingsSlice";

export interface ItemsState {
  userPlaylists: Playlist[];
  sortedPlaylists: SortedPlaylists | null;
  playlist: Playlist | null;
  albums: Album[] | null;
  tracks: Track[] | null;
  sortedTracks: Track[] | null;
  tracksError: string | null;

  recommendedTrackSeed: Track | null;
  lastClickedTrack: string | null;
}

const initialState: ItemsState = {
  userPlaylists: [],
  sortedPlaylists: null,

  playlist: null,
  tracks: null,
  sortedTracks: null,
  tracksError: null,
  albums: null,
  recommendedTrackSeed: null,
  lastClickedTrack: null,
};

// For all Spotify media objects
const itemsSlice = createSlice({
  name: "itemsSlice",
  initialState,
  reducers: {
    setUserPlaylists: (state, action: PayloadAction<Playlist[]>) => {
      state.userPlaylists = action.payload;
    },
    setSortedPlaylists: (state, action: PayloadAction<SortedPlaylists | null>) => {
      state.sortedPlaylists = action.payload;
    },
    setPlaylist: (state, action: PayloadAction<Playlist>) => {
      state.playlist = action.payload;
    },
    setTracks: (state, action: PayloadAction<Track[] | null>) => {
      state.tracks = action.payload;
    },
    setSortedTracks: (state, action: PayloadAction<Track[] | null>) => {
      state.sortedTracks = action.payload;
    },
    setTracksError: (state, action: PayloadAction<string | null>) => {
      state.tracksError = action.payload;
    },
    setAlbums: (state, action: PayloadAction<Album[]>) => {
      state.albums = action.payload;
    },
    setRecommendedTrack: (state, action: PayloadAction<Track>) => {
      state.recommendedTrackSeed = action.payload;
    },
    setLastClickedTrack: (state, action: PayloadAction<string>) => {
      state.lastClickedTrack = action.payload;
    },

    resetItemStates: (state) => {
      // include exclude arg?
      state.playlist = null;
      state.tracks = null;
      state.sortedTracks = null;
      state.tracksError = null;
      state.recommendedTrackSeed = null;
      state.lastClickedTrack = null;
    },
  },
});
export default itemsSlice.reducer;

export const {
  setUserPlaylists,
  setSortedPlaylists,
  setPlaylist,
  setSortedTracks,
  setTracks,
  setTracksError,
  setRecommendedTrack,
  setLastClickedTrack,
  resetItemStates,
} = itemsSlice.actions;

// --------------------------
// Selectors

export const selectTracks = (state: RootState): Track[] | null => {
  return state?.itemsSlice.tracks;
};

export const selectSortedTracks = (state: RootState): Track[] | null => {
  return state?.itemsSlice.sortedTracks;
};

export const selectTracksError = (state: RootState): string | null => {
  return state?.itemsSlice.tracksError;
};

export const selectPlaylist = (state: RootState): Playlist | null => {
  return state?.itemsSlice.playlist;
};

export const selectLastClickedTrack = (state: RootState): string | null => {
  return state?.itemsSlice.lastClickedTrack;
};

// --------------------------
// Thunks

const TRACKS_ERROR_MESSAGE = "Unable to load tracks from Spotify. Please try again.";

export const getUserPlaylists = (): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const usernamePromise = dispatch(getUsername());

      const allItems = await fetchOffsetPages<Playlist>(async (offset, limit) => {
        const response = await spotifyApi.get(`me/playlists?limit=${limit}&offset=${offset}`);
        return {
          items: response.data.items,
          total: response.data.total ?? 0,
        };
      });

      const username = (await usernamePromise) ?? getState().settingsSlice.username;
      if (!username) {
        throw new Error("Failed to load Spotify profile");
      }

      const sortedPlaylists = sortPlaylists(allItems, username);
      dispatch(setUserPlaylists(allItems));
      dispatch(setSortedPlaylists(sortedPlaylists));
    } catch (err) {
      console.log(err.message);
    }
  };
};

const sortPlaylists = (playlists: Playlist[], username: string): SortedPlaylists => {
  const tempSortedPlaylists: SortedPlaylists = {
    created: [],
    followed: [],
    generated: [],
  };

  // ADD conditional filteredBy followed/created option here
  playlists.forEach((playlist: Playlist) => {
    if (playlist.name.slice(0, 4) === "gena") {
      tempSortedPlaylists.generated.push(playlist);
    } else if (playlist.owner.display_name === username) {
      tempSortedPlaylists.created.push(playlist);
    } else {
      tempSortedPlaylists.followed.push(playlist);
    }
  });

  return tempSortedPlaylists;
};

const handleAlbumSearch = async (response, dispatch, searchResultValues) => {
  const results = {
    ...searchResultValues,
    albumResults: response.data.albums.items,
  };

  await dispatch(setSearchResultValues(results));
};

const handleTrackSearch = async (response, dispatch, searchResultValues) => {
  const trackArray = response.data.tracks.items;
  if (trackArray.length) {
    const splicedTracks = await getTrackAndArtistFeatures(trackArray);

    await dispatch(setSortedTracks(splicedTracks));
    await dispatch(setTracks(splicedTracks));

    const results = {
      ...searchResultValues,
      trackResults: splicedTracks,
    };

    await dispatch(setSearchResultValues(results));
  }
};

const handlePlaylistSearch = async (response, dispatch, searchResultValues) => {
  const results = {
    ...searchResultValues,
    playlistResults: response.data.playlists.items,
  };

  await dispatch(setSearchResultValues(results));
};

export const getSearchResults = (history: History): AppThunk => {
  return async (dispatch, getState) => {
    const { currentSearchQueries, searchResultValues } = getState().controlsSlice;

    dispatch(setIsSearching(true));
    dispatch(updateBrowserHistoryThunk("", history));

    try {
      const searchUrl = await createSearchRequestUrl(currentSearchQueries);
      if (!searchUrl) {
        console.log("Search failed as query was empty.");
        return;
      }
      const response = await spotifyApi.get(searchUrl);

      switch (currentSearchQueries.searchType) {
        case "album":
          await handleAlbumSearch(response, dispatch, searchResultValues);
          break;
        case "track":
          await handleTrackSearch(response, dispatch, searchResultValues);
          break;
        default:
          await handlePlaylistSearch(response, dispatch, searchResultValues);
      }

      dispatch(setHasCurrentSearchResults(true));
      dispatch(setIsSearching(false));
    } catch (err) {
      console.log(err.message);
    }
  };
};

export const getAlbumTracks = (album: Album): AppThunk => {
  return async (dispatch) => {
    dispatch(setTracksError(null));

    try {
      const tracklist = await fetchOffsetPages(async (offset, limit) => {
        const response = await spotifyApi.get(
          `${album.href}/tracks?offset=${offset}&limit=${limit}`
        );
        return {
          items: response.data.items,
          total: response.data.total ?? 0,
        };
      });

      const splicedTracks = await getTrackAndArtistFeatures(tracklist);

      await dispatch(setSortedTracks(splicedTracks));
      await dispatch(setTracks(splicedTracks));

      await dispatch(
        setAlbumName(
          `${album.name} – ${
            album.artists.length > 1
              ? [album.artists[0].name, album.artists[1].name].join(", ")
              : album.artists[0].name
          }`
        )
      );
      await dispatch(
        setSearchResultValues({
          albumResults: null,
          playlistResults: null,
          trackResults: null,
        })
      );
      const results = await dispatch(handleSearchResultsChange("tracks", splicedTracks));

      return results;
    } catch (err) {
      console.log(err.message);
      dispatch(setTracks([]));
      dispatch(setSortedTracks([]));
      dispatch(setTracksError(TRACKS_ERROR_MESSAGE));
    }
  };
};

const sortByKeyFunction = (key) => (a, b) => {
  return parseFloat(a[key]) - parseFloat(b[key]);
};

export const sortTracksByAudioFeatures = (): AppThunk => {
  return async (dispatch, getState) => {
    const tracks = selectSortedTracks(getState());
    const keyOption = selectKeyDisplayOption(getState());
    const sortType = selectSortTracksBy(getState());

    if (!tracks) {
      return [];
    }

    let tempTracks;
    let sortThenKey = false;

    switch (sortType) {
      // cases without explicit code fall through to the next case with code
      case "tempo":
      case "duration":
      case "popularity":
      case "valence":
        tempTracks = [...tracks].sort(sortByKeyFunction(sortType));
        break;
      case "durationThenKey":
      case "tempoThenKey":
      case "energyThenKey":
      case "valenceThenKey":
        tempTracks = [...tracks].sort(sortByKeyFunction(sortType.slice(0, -7)));
        sortThenKey = true;
        break;
      case "major/minor":
        tempTracks = [...tracks];
        sortThenKey = true;
        break;
      default:
        tempTracks = [...tracks];
    }

    if (sortThenKey) {
      tempTracks =
        keyOption === "camelot" ? camelotKeySort(tempTracks) : standardKeySort(tempTracks);
    }

    await dispatch(setSortedTracks(tempTracks));
  };
};

export const getTracks = (currentPlaylist: Playlist): AppThunk => {
  return async (dispatch) => {
    dispatch(setTracksError(null));

    try {
      const allRawItems = await fetchOffsetPages<{ [key: string]: any }>(async (offset, limit) => {
        const response = await spotifyApi.get(
          `${currentPlaylist.href}/tracks?offset=${offset}&limit=${limit}`
        );
        return {
          items: response.data.items,
          total: response.data.total ?? currentPlaylist.tracks.total,
        };
      });

      const rawTracks = allRawItems.filter((item: { [key: string]: any }) => item.track);

      const splicedTracks = await getTrackAndArtistFeatures(rawTracks);

      dispatch(setTracks([...splicedTracks]));
      dispatch(setSortedTracks([...splicedTracks]));
    } catch (err) {
      console.log(err.message);
      dispatch(setTracks([]));
      dispatch(setSortedTracks([]));
      dispatch(setTracksError(TRACKS_ERROR_MESSAGE));
    }
  };
};

export const getRecommendedTracks = (recommendedTrack: Track): AppThunk => {
  return async (dispatch, getState) => {
    dispatch(setSortedTracks(null));
    dispatch(setTracksError(null));

    const { matchRecsToSeedTrackKey, seedAttributes } = getState().controlsSlice;

    try {
      let rawTracks: any[] = [];
      if (matchRecsToSeedTrackKey) {
        // match key + mode (25 tracks)
        const url1 = generateRecommendedTrackUrl(
          recommendedTrack.id,
          seedAttributes,
          25,
          recommendedTrack.key,
          recommendedTrack.mode
        );

        // minor/major alternative scale ---> if you request similar tracks for a
        // minor scale, we also get tracks from the major scale (that share the same notes)
        const url2 = generateRecommendedTrackUrl(
          recommendedTrack.id,
          seedAttributes,
          15,
          recommendedTrack.parsedKeys[2][0],
          recommendedTrack.parsedKeys[2][1]
        );

        const [tracksFromUrl1, tracksFromUrl2] = await Promise.all([
          getTracksFromSpotify(url1),
          getTracksFromSpotify(url2),
        ]);
        rawTracks = [...tracksFromUrl1, ...tracksFromUrl2];
      } else {
        // Recommendations without key param
        const url = `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTrack.id}&limit=40`;

        rawTracks = await getTracksFromSpotify(url);
      }

      // remove duplicates (result of multiple calls)
      const filteredRawTracks = rawTracks.reduce((accumulator, current) => {
        if (current && !accumulator.find((el) => el.id === current.id)) {
          accumulator.push(current);
        }
        return accumulator;
      }, []);

      const splicedTracks = await getTrackAndArtistFeatures(filteredRawTracks);
      await dispatch(setTracks(splicedTracks));
      await dispatch(setSortedTracks(splicedTracks));
    } catch (err) {
      console.log(err.message);
      dispatch(setTracks([]));
      dispatch(setSortedTracks([]));
      dispatch(setTracksError(TRACKS_ERROR_MESSAGE));
    }
  };
};

export const goToRecommendedTrack =
  (history: History, track: Track): AppThunk =>
  async (dispatch) => {
    await dispatch(resetItemStates());

    history.push(`/recommended/?id=${track.id}`, {
      recommendedTrack: track,
    });
  };

export const copyNameAndSaveAsCurrentTrack =
  (trackName: string, trackArtist: string, clickedTrackId: string): AppThunk =>
  async (dispatch, getState) => {
    navigator.clipboard.writeText(`${trackName} ${trackArtist}`);

    const lastClickedTrack = selectLastClickedTrack(getState());
    if (lastClickedTrack) {
      const currentlySelected = document.getElementById(lastClickedTrack);
      if (currentlySelected) currentlySelected.classList.remove("currently-selected");
    }

    const nowSelected = document.getElementById(clickedTrackId);
    if (nowSelected) nowSelected.classList.add("currently-selected");

    dispatch(setLastClickedTrack(clickedTrackId));
  };

export const pushPlaylistToHistory = (history: History, playlist: Playlist): AppThunk => {
  return async (dispatch) => {
    dispatch(resetItemStates());

    history.push(
      {
        pathname: "/playlist",
        search: `?id=${playlist.id}`,
      },
      {
        playlist: playlist,
      }
    );
  };
};

export const goToPlaylist = (history: History, playlistId: string): AppThunk => {
  return async (dispatch) => {
    try {
      const newPlaylist = await spotifyApi.get(
        `https://api.spotify.com/v1/playlists/${playlistId}`
      );

      dispatch(setSortedTracks(null));
      dispatch(pushPlaylistToHistory(history, newPlaylist.data));
    } catch (error) {
      console.log(error);
    }
  };
};
