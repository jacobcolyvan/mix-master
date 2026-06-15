import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "../app/store";
import { getInitialAuthState, spotifyApi } from "../auth";
import { KeyOptionTypes } from "../types";

export interface SettingsState {
  spotifyToken: string;
  username: string;
  keyDisplayOption: KeyOptionTypes;
  sessionReady: boolean;
}

const { spotifyToken, sessionReady } = getInitialAuthState();

const initialState: SettingsState = {
  spotifyToken,
  username: "",
  keyDisplayOption: "camelot",
  sessionReady,
};

const settingsSlice = createSlice({
  name: "settingsSlice",
  initialState,
  reducers: {
    setSpotifyToken: (state, action: PayloadAction<string>) => {
      state.spotifyToken = action.payload;
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setKeyDisplayOption: (state, action: PayloadAction<KeyOptionTypes>) => {
      state.keyDisplayOption = action.payload;
    },
    setSessionReady: (state, action: PayloadAction<boolean>) => {
      state.sessionReady = action.payload;
    },
  },
});
export default settingsSlice.reducer;

export const { setSpotifyToken, setUsername, setKeyDisplayOption, setSessionReady } =
  settingsSlice.actions;

// ----------------------------------------------------------------------------
// Selectors

export const selectSpotifyToken = (state: RootState): string => {
  return state?.settingsSlice.spotifyToken;
};

export const selectSessionReady = (state: RootState): boolean => {
  return state?.settingsSlice.sessionReady;
};

export const selectUsername = (state: RootState): string => {
  return state?.settingsSlice.username;
};

export const selectKeyDisplayOption = (state: RootState): string => {
  return state?.settingsSlice.keyDisplayOption;
};

// ----------------------------------------------------------------------------
// UI thunks

export const getUsername = (): AppThunk => {
  return async (dispatch) => {
    try {
      const response = await spotifyApi.get("me/");

      if (response.status === 200) {
        dispatch(setUsername(response.data.display_name));
      }
    } catch (err) {
      console.log(err.message);
    }
  };
};
