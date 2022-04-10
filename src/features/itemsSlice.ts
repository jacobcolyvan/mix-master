import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Track, Playlist, Album, SortedPlaylists } from '../types';
import { AppThunk } from '../app/store';
import { spotifyBaseRequest } from '../utils/RequestUtils';

export interface ItemsState {
  userPlaylists: Playlist[];
  sortedPlaylists: SortedPlaylists | null;
  playlist: Playlist | null;
  albums: Album[] | null;
  tracks: Track[] | null;
  sortedTracks: Track[] | null;

  recommendedTrackSeed: Track | null;
  lastClickedTrack: Track | null;
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
    setSortedPlaylists: (state, action: PayloadAction<SortedPlaylists>) => {
      state.sortedPlaylists = action.payload;
    },
    setPlaylist: (state, action: PayloadAction<Playlist>) => {
      state.playlist = action.payload;
    },
    setTracks: (state, action: PayloadAction<Track[]>) => {
      state.tracks = action.payload;
    },
    setSortedTracks: (state, action: PayloadAction<Track[]>) => {
      state.sortedTracks = action.payload;
    },
    setAlbums: (state, action: PayloadAction<Album[]>) => {
      state.albums = action.payload;
    },
    setRecommendedTrack: (state, action: PayloadAction<Track>) => {
      state.recommendedTrackSeed = action.payload;
    },
    setLastClickedTrack: (state, action: PayloadAction<Track>) => {
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

export const {
  setUserPlaylists,
  setSortedPlaylists,
  setRecommendedTrack,
  setLastClickedTrack,
} = itemsSlice.actions;

export default itemsSlice.reducer;

export const getUserPlaylists = (): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const { spotifyToken, username } = getState().settingsSlice;
      let allPlaylists = false;
      let tempPlaylistArray: [][] = [];
      let offset = 0;

      while (!allPlaylists) {
        const response = await spotifyBaseRequest(spotifyToken).get(
          `playlists?limit=50&offset=${offset}`
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
      // if (err.response?.status === 401) handleAuthError();
      console.log(err.message);
    }
  };
};

const sortPlaylists = (playlists: Playlist[], username: string) => {
  let tempSortedPlaylists: SortedPlaylists = {
    created: [],
    followed: [],
    generated: [],
  };

  playlists.forEach((playlist: { [key: string]: any }) => {
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
