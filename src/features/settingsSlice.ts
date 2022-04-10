import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../app/store';
import { spotifyBaseRequest } from '../utils/RequestUtils';

export interface SettingsState {
  spotifyToken: string;
  authError: boolean;
  username: string;
  keyDisplayOption: 'camelot' | 'standard';
}

const initialState: SettingsState = {
  spotifyToken: '',
  authError: false,
  username: '',
  keyDisplayOption: 'camelot',
};

// Auth, tokens, cookies and settings
const settingsSlice = createSlice({
  name: 'settingsSlice',
  initialState,
  reducers: {
    // To add:  group by separate followed/owned
    setSpotifyToken: (state, action: PayloadAction<string>) => {
      state.spotifyToken = action.payload;
    },
    setAuthError: (state, action: PayloadAction<boolean>) => {
      state.authError = action.payload;
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
  },
});

export const { setSpotifyToken, setAuthError, setUsername } = settingsSlice.actions;

export default settingsSlice.reducer;

export const getUserProfile = (): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const { spotifyToken } = getState().settingsSlice;
      const response = await spotifyBaseRequest(spotifyToken).get('/');

      if (response.status === 200) {
        dispatch(setUsername(response.data.display_name));
      }
    } catch (err) {
      // if (err.response?.status === 401) handleAuthError();
      console.log(err.message);
    }
  };
};
