import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { History } from 'history';

import { Track, Playlist, Album, SortedPlaylists, SearchResultsType } from '../types';
import { AppThunk, RootState } from '../app/store';
import {
  createRequestUrl,
  generateRecommendedTrackUrl,
  getTrackAndArtistFeatures,
  getTracksFromSpotify,
  spotifyBaseRequest,
} from '../utils/RequestUtils';
import { camelotKeySort, standardKeySort } from '../utils/CommonFunctions';
import {
  handleSearchResultsChange,
  selectSortTracksBy,
  setAlbumName,
  setHasCurrentSearchResults,
  setIsSearching,
  setSearchResultValues,
} from './controlsSlice';
import {
  handleAuthError,
  selectKeyDisplayOption,
  selectSpotifyToken,
} from './settingsSlice';

export interface ItemsState {
  userPlaylists: Playlist[];
  sortedPlaylists: SortedPlaylists | null;
  playlist: Playlist | null;
  albums: Album[] | null;
  tracks: Track[] | null;
  sortedTracks: Track[] | null;

  recommendedTrackSeed: Track | null;
  lastClickedTrack: string | null;
}

const initialState: ItemsState = {
  userPlaylists: [],
  sortedPlaylists: null,

  playlist: null,
  tracks: null,
  sortedTracks: null,
  albums: null,
  recommendedTrackSeed: null,
  lastClickedTrack: null,
};

// For all Spotify media objects
const itemsSlice = createSlice({
  name: 'itemsSlice',
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
      state.recommendedTrackSeed = null;
      state.lastClickedTrack = null;
    },
  },
});
export default itemsSlice.reducer;

export const {
  setUserPlaylists,
  setSortedPlaylists,
  setSortedTracks,
  setTracks,
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

export const selectPlaylist = (state: RootState): Playlist | null => {
  return state?.itemsSlice.playlist;
};

export const selectLastClickedTrack = (state: RootState): string | null => {
  return state?.itemsSlice.lastClickedTrack;
};

// --------------------------
// Thunks

export const getUserPlaylists = (): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const { spotifyToken, username } = getState().settingsSlice;
      let allPlaylists = false;
      let tempPlaylistArray: Playlist[] = [];
      let offset = 0;

      while (!allPlaylists) {
        const response = await spotifyBaseRequest(spotifyToken).get(
          `me/playlists?limit=50&offset=${offset}`
        );

        if (response.status === 200) {
          const playlistTotalAmount = response.data.total;
          if (playlistTotalAmount > tempPlaylistArray.length) {
            offset += 50;
          } else {
            allPlaylists = true;
          }

          tempPlaylistArray = [...tempPlaylistArray, ...response.data.items];
        }
      }

      const sortedPlaylists = sortPlaylists(tempPlaylistArray, username);
      dispatch(setUserPlaylists(tempPlaylistArray));
      dispatch(setSortedPlaylists(sortedPlaylists));
    } catch (err) {
      if (err.response?.status === 401) dispatch(handleAuthError());
      console.log(err.message);
    }
  };
};

const sortPlaylists = (playlists: Playlist[], username: string): SortedPlaylists => {
  let tempSortedPlaylists: SortedPlaylists = {
    created: [],
    followed: [],
    generated: [],
  };

  // ADD conditional filteredBy followed/created option here
  playlists.forEach((playlist: Playlist) => {
    if (playlist.name.slice(0, 4) === 'gena') {
      tempSortedPlaylists.generated.push(playlist);
    } else if (playlist.owner.display_name === username) {
      tempSortedPlaylists.created.push(playlist);
    } else {
      tempSortedPlaylists.followed.push(playlist);
    }
  });

  return tempSortedPlaylists;
};

export const getResults = (): AppThunk => {
  return async (dispatch, getState) => {
    const { spotifyToken } = getState().settingsSlice;

    await dispatch(setIsSearching(true));
    // updateUrl to save searchOption params
    // updateBrowserHistory('');

    const { currentSearchQueries, searchResultValues } = getState().controlsSlice;

    if (
      currentSearchQueries.artistSearchQuery.length ||
      currentSearchQueries.albumSearchQuery.length ||
      currentSearchQueries.trackSearchQuery.length ||
      currentSearchQueries.playlistSearchQuery.length
    ) {
      try {
        const searchUrl = await createRequestUrl(currentSearchQueries);
        const response = await spotifyBaseRequest(spotifyToken).get(searchUrl);

        if (currentSearchQueries.searchType === 'album') {
          const results: SearchResultsType = {
            ...searchResultValues,
            albumResults: response.data.albums.items,
          };

          await dispatch(setSearchResultValues(results));

          // updateBrowserHistory('albums', Boolean(results));
        } else if (currentSearchQueries.searchType === 'track') {
          const trackArray = response.data.tracks.items;
          if (trackArray.length) {
            const splicedTracks = await getTrackAndArtistFeatures(
              trackArray,
              spotifyToken
            );

            await dispatch(setSortedTracks(splicedTracks));
            // TODO: check if this is necessary
            await dispatch(setTracks(splicedTracks));

            const results: SearchResultsType = {
              ...searchResultValues,
              trackResults: splicedTracks,
            };

            await dispatch(setSearchResultValues(results));
          }

          // updateBrowserHistory('tracks');
        } else {
          const results: SearchResultsType = {
            ...searchResultValues,
            playlistResults: response.data.playlists.items,
          };

          await dispatch(setSearchResultValues(results));

          // updateBrowserHistory('playlists', Boolean(results));
        }

        dispatch(setHasCurrentSearchResults(true));
        dispatch(setIsSearching(false));
      } catch (err) {
        if (err.response?.status === 401) dispatch(handleAuthError());
        console.log(err.message);
      }
    }
  };
};

export const getAlbumTracks = (album: Album): AppThunk => {
  return async (dispatch, getState) => {
    // TODO: fix that this is not routing to the correct page
    try {
      const spotifyToken = selectSpotifyToken(getState());
      const tracksResponse = await spotifyBaseRequest(spotifyToken).get(album.href);

      const tracklist = [tracksResponse.data.tracks.items][0];
      const splicedTracks = await getTrackAndArtistFeatures(tracklist, spotifyToken);

      await dispatch(setSortedTracks(splicedTracks));
      await dispatch(setTracks(splicedTracks));

      await dispatch(
        setAlbumName(
          `${album.name} – ${
            album.artists.length > 1
              ? [album.artists[0].name, album.artists[1].name].join(', ')
              : album.artists[0].name
          }`
        )
      );
      const results = await dispatch(
        handleSearchResultsChange('tracks', splicedTracks)
      );

      return results;

      // updateUrl('album-tracks', results);
    } catch (err) {
      if (err.response?.status === 401) dispatch(handleAuthError());
      console.log(err.message);
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
      case 'tempo':
      case 'duration':
      case 'popularity':
      case 'valence':
        tempTracks = [...tracks].sort(sortByKeyFunction(sortType));
        break;
      case 'durationThenKey':
      case 'tempoThenKey':
      case 'energyThenKey':
      case 'valenceThenKey':
        tempTracks = [...tracks].sort(sortByKeyFunction(sortType.slice(0, -7)));
        sortThenKey = true;
        break;
      case 'major/minor':
        tempTracks = [...tracks];
        sortThenKey = true;
        break;
      default:
        tempTracks = [...tracks];
    }

    if (sortThenKey) {
      tempTracks =
        keyOption === 'camelot'
          ? camelotKeySort(tempTracks)
          : standardKeySort(tempTracks);
    }

    await dispatch(setSortedTracks(tempTracks));
  };
};

export const getTracks = (currentPlaylist: Playlist): AppThunk => {
  return async (dispatch, getState) => {
    const spotifyToken = selectSpotifyToken(getState());

    let trackTotalAmount = currentPlaylist.tracks.total;
    let offset = 0;
    let splicedTracks: Track[] = [];

    try {
      while (trackTotalAmount > splicedTracks.length) {
        const tracksResponse = await spotifyBaseRequest(spotifyToken).get(
          currentPlaylist.href + `/tracks?offset=${offset}&limit=50`
        );

        const rawTracksPage = tracksResponse.data.items.filter(
          (item: { [key: string]: any[] }) => {
            if (item.track) {
              return true;
            } else {
              // TODO: why is this needed?
              trackTotalAmount--;
              return false;
            }
          }
        );

        const splicedTracksPage = await getTrackAndArtistFeatures(
          rawTracksPage,
          spotifyToken
        );
        splicedTracks = [...splicedTracks, ...splicedTracksPage];

        offset += 50;
      }
    } catch (err) {
      if (err.response?.status === 401) dispatch(handleAuthError());
      console.log(err.message);
    }

    await dispatch(setTracks([...splicedTracks]));
    await dispatch(setSortedTracks([...splicedTracks]));
  };
};

export const getRecommendedTracks = (recommendedTrack: Track): AppThunk => {
  return async (dispatch, getState) => {
    await dispatch(setSortedTracks(null));

    const { matchRecsToSeedTrackKey, seedAttributes } = getState().controlsSlice;
    const spotifyToken = selectSpotifyToken(getState());

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

        rawTracks = [
          ...(await getTracksFromSpotify(url1, spotifyToken)),
          ...(await getTracksFromSpotify(url2, spotifyToken)),
        ];
      } else {
        // Recommendations without key param
        const url = `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTrack.id}&limit=40`;

        rawTracks = await getTracksFromSpotify(url, spotifyToken);
      }

      // remove duplicates (result of multiple calls)
      const filteredRawTracks = rawTracks.reduce((accumulator, current) => {
        if (current && !accumulator.find((el) => el.id === current.id)) {
          accumulator.push(current);
        }
        return accumulator;
      }, []);

      const splicedTracks = await getTrackAndArtistFeatures(
        filteredRawTracks,
        spotifyToken
      );
      await dispatch(setTracks(splicedTracks));
      await dispatch(setSortedTracks(splicedTracks));
    } catch (err) {
      console.log(err.message);
      if (err.response?.status === 401) dispatch(handleAuthError());
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
      if (currentlySelected) currentlySelected.classList.remove('currently-selected');
    }

    const nowSelected = document.getElementById(clickedTrackId);
    if (nowSelected) nowSelected.classList.add('currently-selected');

    dispatch(setLastClickedTrack(clickedTrackId));
  };

export const pushPlaylistToHistory = (
  history: History,
  playlist: Playlist
): AppThunk => {
  return async (dispatch) => {
    dispatch(resetItemStates);

    history.push(
      {
        pathname: '/playlist',
        search: `?id=${playlist.id}`,
      },
      {
        playlist: playlist,
      }
    );
  };
};

export const goToPlaylist = (history: History, playlistId: string): AppThunk => {
  return async (dispatch, getState) => {
    const spotifyToken = selectSpotifyToken(getState());

    try {
      const newPlaylist = await spotifyBaseRequest(spotifyToken).get(
        `https://api.spotify.com/v1/playlists/${playlistId}`
      );

      dispatch(setSortedTracks(null));
      dispatch(pushPlaylistToHistory(history, newPlaylist.data));
    } catch (error) {
      console.log(error);
    }
  };
};
