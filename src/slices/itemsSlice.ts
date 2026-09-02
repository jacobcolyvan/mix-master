import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { History } from "history";

import { AppThunk, RootState } from "../app/store";
import { spotifyApi } from "../auth";
import { Album, Playlist, Track } from "../types";
import {
  createSpotifySearchUrl,
  generateRecommendedTrackUrl,
  getTrackAndArtistFeatures,
  getTracksFromSpotify,
} from "../utils/requestUtils";
import { SearchQuery } from "../utils/searchRoute";
import { fetchOffsetPages } from "../utils/spotifyFetch";
import {
  setAlbumName,
  setHasCurrentSearchResults,
  setIsSearching,
  setSearchResultValues,
} from "./controlsSlice";

export interface ItemsState {
  userPlaylists: Playlist[] | null;
  tracks: Track[] | null;
  tracksError: string | null;
}

const initialState: ItemsState = {
  userPlaylists: null,

  tracks: null,
  tracksError: null,
};

// For all Spotify media objects
const itemsSlice = createSlice({
  name: "itemsSlice",
  initialState,
  reducers: {
    setUserPlaylists: (state, action: PayloadAction<Playlist[]>) => {
      state.userPlaylists = action.payload;
    },
    setTracks: (state, action: PayloadAction<Track[] | null>) => {
      state.tracks = action.payload;
    },
    setTracksError: (state, action: PayloadAction<string | null>) => {
      state.tracksError = action.payload;
    },

    resetItemStates: (state) => {
      state.tracks = null;
      state.tracksError = null;
    },
  },
});
export default itemsSlice.reducer;

export const { setUserPlaylists, setTracks, setTracksError, resetItemStates } = itemsSlice.actions;

// --------------------------
// Selectors

export const selectTracks = (state: RootState): Track[] | null => {
  return state?.itemsSlice.tracks;
};

export const selectTracksError = (state: RootState): string | null => {
  return state?.itemsSlice.tracksError;
};

// --------------------------
// Thunks

const TRACKS_ERROR_MESSAGE = "Unable to load tracks from Spotify. Please try again.";

export const getUserPlaylists = (): AppThunk => {
  return async (dispatch) => {
    try {
      const allItems = await fetchOffsetPages<Playlist>(async (offset, limit) => {
        const response = await spotifyApi.get(`me/playlists?limit=${limit}&offset=${offset}`);
        return {
          items: response.data.items,
          total: response.data.total ?? 0,
        };
      });

      dispatch(setUserPlaylists(allItems));
    } catch (err) {
      console.log(err.message);
    }
  };
};

// All async track loaders share this generation so stale responses cannot overwrite newer tracks.
let latestTracksRequest = 0;

const beginTracksRequest = () => ++latestTracksRequest;
const isLatestTracksRequest = (requestId: number) => requestId === latestTracksRequest;

export const invalidateTracksRequest = (): AppThunk => {
  return () => {
    latestTracksRequest += 1;
  };
};

export const getSearchResults = (query: SearchQuery): AppThunk => {
  return async (dispatch) => {
    const requestId = beginTracksRequest();

    dispatch(setTracksError(null));
    dispatch(setIsSearching(true));

    try {
      const response = await spotifyApi.get(createSpotifySearchUrl(query));
      let tracks: Track[] | null = null;

      if (query.kind === "track") {
        tracks = await getTrackAndArtistFeatures(response.data.tracks.items);
      }

      // Ignore a response superseded by a newer track-loading request.
      if (!isLatestTracksRequest(requestId)) return;

      switch (query.kind) {
        case "album":
          dispatch(
            setSearchResultValues({
              albumResults: response.data.albums.items,
              playlistResults: null,
              trackResults: null,
            })
          );
          break;
        case "track":
          dispatch(setTracks(tracks));
          dispatch(
            setSearchResultValues({
              albumResults: null,
              playlistResults: null,
              trackResults: tracks,
            })
          );
          break;
        case "playlist":
          dispatch(
            setSearchResultValues({
              albumResults: null,
              playlistResults: response.data.playlists.items,
              trackResults: null,
            })
          );
          break;
      }

      dispatch(setHasCurrentSearchResults(true));
    } catch (err) {
      if (isLatestTracksRequest(requestId)) {
        console.log(err.message);
      }
    } finally {
      if (isLatestTracksRequest(requestId)) {
        dispatch(setIsSearching(false));
      }
    }
  };
};

export const getAlbumTracks = (albumId: string): AppThunk => {
  return async (dispatch) => {
    const requestId = beginTracksRequest();

    dispatch(setTracksError(null));
    dispatch(setIsSearching(true));

    try {
      const [albumResponse, tracklist] = await Promise.all([
        // Album request
        spotifyApi.get(`albums/${encodeURIComponent(albumId)}`),
        // Tracklist request
        fetchOffsetPages(async (offset, limit) => {
          const response = await spotifyApi.get(
            `albums/${encodeURIComponent(albumId)}/tracks?offset=${offset}&limit=${limit}`
          );
          return {
            items: response.data.items,
            total: response.data.total ?? 0,
          };
        }),
      ]);
      const splicedTracks = await getTrackAndArtistFeatures(tracklist);

      if (!isLatestTracksRequest(requestId)) return;

      const album: Album = albumResponse.data;
      const artistNames = album.artists.slice(0, 2).map((artist) => artist.name);

      dispatch(setTracks(splicedTracks));
      dispatch(setAlbumName(`${album.name} – ${artistNames.join(", ")}`));
      dispatch(
        setSearchResultValues({
          albumResults: null,
          playlistResults: null,
          trackResults: null,
        })
      );
      dispatch(setHasCurrentSearchResults(true));
    } catch (err) {
      if (!isLatestTracksRequest(requestId)) return;

      console.log(err.message);
      dispatch(setTracks([]));
      dispatch(setTracksError(TRACKS_ERROR_MESSAGE));
      dispatch(setHasCurrentSearchResults(true));
    } finally {
      if (isLatestTracksRequest(requestId)) {
        dispatch(setIsSearching(false));
      }
    }
  };
};

export const getTracks = (currentPlaylist: Playlist): AppThunk => {
  return async (dispatch) => {
    const requestId = beginTracksRequest();

    dispatch(setTracks(null));
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

      if (!isLatestTracksRequest(requestId)) return;

      dispatch(setTracks([...splicedTracks]));
    } catch (err) {
      if (!isLatestTracksRequest(requestId)) return;

      console.log(err.message);
      dispatch(setTracks([]));
      dispatch(setTracksError(TRACKS_ERROR_MESSAGE));
    }
  };
};

export const getRecommendedTracks = (recommendedTrack: Track): AppThunk => {
  return async (dispatch, getState) => {
    const requestId = beginTracksRequest();

    dispatch(setTracks(null));
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

      if (!isLatestTracksRequest(requestId)) return;

      dispatch(setTracks(splicedTracks));
    } catch (err) {
      if (!isLatestTracksRequest(requestId)) return;

      console.log(err.message);
      dispatch(setTracks([]));
      dispatch(setTracksError(TRACKS_ERROR_MESSAGE));
    }
  };
};

export const goToRecommendedTrack =
  (history: History, track: Track): AppThunk =>
  async (dispatch) => {
    dispatch(resetItemStates());

    history.push(`/recommended/?id=${track.id}`, {
      recommendedTrack: track,
    });
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

      dispatch(pushPlaylistToHistory(history, newPlaylist.data));
    } catch (error) {
      console.log(error);
    }
  };
};
