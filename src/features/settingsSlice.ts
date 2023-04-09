import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { AppThunk, RootState } from '../app/store';
import { KeyOptionTypes } from '../types';
import { spotifyBaseRequest } from '../utils/RequestUtils';

export interface SettingsState {
  spotifyToken: string;
  authError: boolean;
  username: string;
  keyDisplayOption: KeyOptionTypes;
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
    setKeyDisplayOption: (state, action: PayloadAction<KeyOptionTypes>) => {
      state.keyDisplayOption = action.payload;
    },
  },
});
export default settingsSlice.reducer;

export const { setSpotifyToken, setAuthError, setUsername, setKeyDisplayOption } =
  settingsSlice.actions;

// ----------------------------------------------------------------------------
// Selectors

export const selectSpotifyToken = (state: RootState): string => {
  return state?.settingsSlice.spotifyToken;
};

export const selectAuthError = (state: RootState): boolean => {
  return state?.settingsSlice.authError;
};

export const selectUsername = (state: RootState): string => {
  return state?.settingsSlice.username;
};

export const selectKeyDisplayOption = (state: RootState): string => {
  return state?.settingsSlice.keyDisplayOption;
};

// ----------------------------------------------------------------------------
// Thunks

export const getUsername = (): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const spotifyToken = selectSpotifyToken(getState());
      const response = await spotifyBaseRequest(spotifyToken).get('me/');

      if (response.status === 200) {
        dispatch(setUsername(response.data.display_name));
      }
    } catch (err) {
      if (err.response?.status === 401) dispatch(handleAuthError());
      console.log(err.message);
    }
  };
};

export const handleAuthError = () => (dispatch, getState: () => RootState) => {
  // checks if token in cookies is different from token in state
  const currentToken = selectSpotifyToken(getState());
  const cookiesToken = Cookies.get('token');

  if (cookiesToken && cookiesToken !== currentToken) {
    dispatch(setSpotifyToken(cookiesToken));
  }

  // TODO: check this
  dispatch(setAuthError(false));
};
