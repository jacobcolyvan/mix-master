import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Track, Playlist, Album, SortedPlaylists, SearchResultsType } from '../types';
import { AppThunk, RootState } from '../app/store';
import { createRequestUrl, spotifyBaseRequest } from '../utils/RequestUtils';
import axios from 'axios';
import {
  camelotKeySort,
  millisToMinutesAndSeconds,
  standardKeySort,
} from '../utils/CommonFunctions';
import {
  handleSearchResultsChange,
  setAlbumName,
  setHasCurrentSearchResults,
  setIsSearching,
  setSearchResultValues,
} from './controlsSlice';

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
      // localStorage.setItem('token', 'cassanova');

      const sortedPlaylists = sortPlaylists(tempPlaylistArray, username);
      dispatch(setUserPlaylists(tempPlaylistArray));
      dispatch(setSortedPlaylists(sortedPlaylists));
    } catch (err) {
      // if (err.response?.status === 401) handleAuthError();
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

const getTrackAndArtistFeatures = (tracks): AppThunk => {
  return async (dispatch, getState) => {
    const { spotifyToken } = getState().settingsSlice;

    const trackIds = tracks.map((item) => item.id);
    const artistIds = tracks.map((track) => track.artists[0].id);

    // TODO: fix any type casting here
    const trackFeaturesResponse: any = await spotifyBaseRequest(spotifyToken).get(
      `audio-features/?ids=${trackIds.join(',')}`
    );
    const artistFeaturesResponse: any = await spotifyBaseRequest(spotifyToken).get(
      `artists?ids=${artistIds.join(',')}`
    );

    const trackFeatures = [...trackFeaturesResponse.data.audio_features];
    const artistFeatures = [...artistFeaturesResponse.data.artists];

    const splicedTracks = tracks
      .filter((_, index) => trackFeatures[index] != null)
      .map((item, index) => {
        return {
          name: item.name,
          artists:
            item.artists.length > 1
              ? [item.artists[0].name, item.artists[1].name]
              : [item.artists[0].name],
          id: item.id && item.id,
          tempo:
            trackFeatures[index] != null ? Math.round(trackFeatures[index].tempo) : '',
          key: trackFeatures[index] != null ? trackFeatures[index].key : '',
          mode: trackFeatures[index] != null ? parseInt(trackFeatures[index].mode) : '',
          energy:
            trackFeatures[index] != null
              ? Math.round(trackFeatures[index].energy.toFixed(2) * 100) / 100
              : '',
          danceability:
            trackFeatures[index] != null ? trackFeatures[index].danceability : '',
          acousticness:
            trackFeatures[index] != null ? trackFeatures[index].acousticness : '',
          liveness: trackFeatures[index] != null ? trackFeatures[index].liveness : '',
          loudness: trackFeatures[index] != null ? trackFeatures[index].loudness : '',
          speechiness:
            trackFeatures[index] != null ? trackFeatures[index].speechiness : '',
          valence: trackFeatures[index] != null ? trackFeatures[index].valence : '',

          duration:
            item.duration_ms != null ? millisToMinutesAndSeconds(item.duration_ms) : '',
          track_popularity: item.popularity != null ? item.popularity : '',
          artist_genres:
            artistFeatures[index] != null ? artistFeatures[index].genres : '',
          album: item.album.name && item.album.name,
          release_date: item.album.release_date ? item.album.release_date : '',
        };
      });

    await dispatch(setSortedTracks(splicedTracks));
    await dispatch(setTracks(splicedTracks));
  };
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
            await dispatch(getTrackAndArtistFeatures(trackArray));
            const sortedTracks = getState().itemsSlice.sortedTracks;
            const results: SearchResultsType = {
              ...searchResultValues,
              trackResults: sortedTracks,
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
        // if (err.response?.status === 401) handleAuthError();
        console.log(err.message);
      }
    }
  };
};

export const getAlbumTracks = (album: Album): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const { spotifyToken } = getState().settingsSlice;
      const tracksResponse = await axios({
        method: 'get',
        url: album.href,
        headers: {
          Authorization: 'Bearer ' + spotifyToken,
          'Content-Type': 'application/json',
        },
      });

      const tracklist = [tracksResponse.data.tracks.items][0];
      await getTrackAndArtistFeatures(tracklist);
      const splicedTracks = getState().itemsSlice.sortedTracks;

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
      // if (err.response?.status === 401) handleAuthError();
      console.log(err.message);
    }
  };
};

// TODO: improve the trash heap sort logic below (case(?))
export const sortTracksByAudioFeatures = (): AppThunk => {
  return async (dispatch, getState) => {
    const tracks = getState().itemsSlice.tracks;
    const keyOption = getState().settingsSlice.keyDisplayOption;
    const sortType = getState().controlsSlice.sortTracksBy;

    if (tracks) {
      if (sortType === 'tempo') {
        const tempTracks = [...tracks].sort(
          (a, b) => parseInt(a.tempo) - parseInt(b.tempo)
        );

        await dispatch(setSortedTracks(tempTracks));
      } else if (sortType === 'duration') {
        let tempTracks = [...tracks].sort(
          (a, b) => parseInt(b.duration) - parseInt(a.duration)
        );

        await dispatch(setSortedTracks(tempTracks));
      } else if (sortType === 'popularity') {
        let tempTracks = [...tracks].sort(
          (a, b) => parseInt(b.track_popularity) - parseInt(a.track_popularity)
        );

        await dispatch(setSortedTracks(tempTracks));
      } else if (sortType === 'valence') {
        let tempTracks = [...tracks].sort(
          (a, b) => parseFloat(b.valence) - parseFloat(a.valence)
        );

        await dispatch(setSortedTracks(tempTracks));
      } else if (sortType === 'durationThenKey') {
        let tempTracks = [...tracks].sort(
          (a, b) => parseInt(b.duration) - parseInt(a.duration)
        );

        await dispatch(
          setSortedTracks(
            keyOption === 'camelot'
              ? camelotKeySort(tempTracks)
              : standardKeySort(tempTracks)
          )
        );
      } else if (sortType === 'tempoThenKey') {
        let tempTracks = [...tracks].sort(
          (a, b) => parseInt(a.tempo) - parseInt(b.tempo)
        );

        await dispatch(
          setSortedTracks(
            keyOption === 'camelot'
              ? camelotKeySort(tempTracks)
              : standardKeySort(tempTracks)
          )
        );
      } else if (sortType === 'energyThenKey') {
        let tempTracks = [...tracks].sort(
          (a, b) => parseFloat(b.energy) - parseFloat(a.energy)
        );

        await dispatch(
          setSortedTracks(
            keyOption === 'camelot'
              ? camelotKeySort(tempTracks)
              : standardKeySort(tempTracks)
          )
        );
      } else if (sortType === 'valenceThenKey') {
        let tempTracks = [...tracks].sort(
          (a, b) => parseFloat(b.valence) - parseFloat(a.valence)
        );

        await dispatch(
          setSortedTracks(
            keyOption === 'camelot'
              ? camelotKeySort(tempTracks)
              : standardKeySort(tempTracks)
          )
        );
      } else if (sortType === 'major/minor') {
        let tempTracks =
          keyOption === 'camelot'
            ? camelotKeySort([...tracks])
            : standardKeySort([...tracks]);

        tempTracks = tempTracks.sort(
          (a, b) => parseInt(`${a.mode}`) - parseInt(`${b.mode}`)
        );

        await dispatch(setSortedTracks(tempTracks));
      } else {
        await dispatch(setSortedTracks([...tracks]));
      }
    }
  };
};

export const getTracks = (currentPlaylist: Playlist): AppThunk => {
  return async (dispatch, getState) => {
    try {
      // const currentPlaylist: any = getState().itemsSlice.playlist;
      // if (!currentPlaylist) return null;

      const token = getState().settingsSlice.spotifyToken;

      let trackTotalAmount = currentPlaylist.tracks.total;
      let offset = 0;
      let tracklist: any[] = [];
      let trackFeatures: any[] = [];
      let artistFeatures: any[] = [];

      while (trackTotalAmount > tracklist.length) {
        let tracksResponse, featuresResponse, artistsResponse;
        try {
          tracksResponse = await axios({
            method: 'get',
            url: currentPlaylist.href + `/tracks?offset=${offset}&limit=50`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
          });

          // eslint-disable-next-line no-loop-func
          tracksResponse = tracksResponse.data.items.map(
            (item: { [key: string]: any[] }) => {
              if (item.track) {
                return item;
              } else {
                trackTotalAmount--;
                return undefined;
              }
            }
          );

          // remove null items
          tracksResponse = tracksResponse.filter(Boolean);
          // TODO: improve this mapping logic
          const trackIds = tracksResponse.map(
            (item: { [key: string]: any }) => item.track.id
          );
          const artistIds = tracksResponse.map(
            (item: { [key: string]: any }) => item.track.artists[0].id
          );

          artistsResponse = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
          });

          featuresResponse = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
          });
        } catch (err) {
          // if (err.response?.status === 401) handleAuthError();
          console.log(err);
        }

        tracklist = [...tracklist, ...tracksResponse];
        trackFeatures = [...trackFeatures, ...featuresResponse?.data.audio_features];
        artistFeatures = [...artistFeatures, ...artistsResponse?.data.artists];

        offset += 50;
      }

      // expensive fix for null trackFeatures; flatMap?
      const splicedTracks = tracklist
        .filter((_, index) => trackFeatures[index] != null)
        .map((item, index) => {
          return {
            name: item.track.name,
            artists:
              item.track.artists.length > 1
                ? [item.track.artists[0].name, item.track.artists[1].name]
                : [item.track.artists[0].name],
            id: item.track.id && item.track.id,
            tempo:
              trackFeatures[index] != null
                ? `${Math.round(trackFeatures[index].tempo)}`
                : '',
            key: trackFeatures[index] != null ? trackFeatures[index].key : '',
            mode: trackFeatures[index] != null ? trackFeatures[index].mode : '',
            energy:
              trackFeatures[index] != null
                ? `${Math.round(trackFeatures[index].energy.toFixed(2) * 100) / 100}`
                : '',
            danceability:
              trackFeatures[index] != null ? trackFeatures[index].danceability : '',
            acousticness:
              trackFeatures[index] != null ? trackFeatures[index].acousticness : '',
            instrumentalness:
              trackFeatures[index] != null ? trackFeatures[index].instrumentalness : '',
            liveness: trackFeatures[index] != null ? trackFeatures[index].liveness : '',
            loudness: trackFeatures[index] != null ? trackFeatures[index].loudness : '',
            speechiness:
              trackFeatures[index] != null ? trackFeatures[index].speechiness : '',
            valence: trackFeatures[index] != null ? trackFeatures[index].valence : '',

            duration:
              item.track.duration_ms != null
                ? millisToMinutesAndSeconds(item.track.duration_ms)
                : '',
            track_popularity:
              item.track.popularity != null ? item.track.popularity : '',
            artist_genres:
              artistFeatures[index] != null ? artistFeatures[index].genres : '',
            album: item.track.album.name && item.track.album.name,
            release_date: item.track.album.release_date
              ? item.track.album.release_date
              : '',
          };
        });

      dispatch(setTracks([...splicedTracks]));
      dispatch(setSortedTracks([...splicedTracks]));
    } catch (err) {
      // if (err.response?.status === 401) handleAuthError();
      console.log(err.message);
    }
  };
};
