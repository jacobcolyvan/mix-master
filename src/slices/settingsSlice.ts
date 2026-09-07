import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../app/store";
import { KeyOptionTypes } from "../types";

export interface SettingsState {
  keyDisplayOption: KeyOptionTypes;
}

const initialState: SettingsState = {
  keyDisplayOption: "camelot",
};

const settingsSlice = createSlice({
  name: "settingsSlice",
  initialState,
  reducers: {
    setKeyDisplayOption: (state, action: PayloadAction<KeyOptionTypes>) => {
      state.keyDisplayOption = action.payload;
    },
  },
});
export default settingsSlice.reducer;

export const { setKeyDisplayOption } = settingsSlice.actions;

export const selectKeyDisplayOption = (state: RootState): KeyOptionTypes => {
  return state?.settingsSlice.keyDisplayOption;
};
