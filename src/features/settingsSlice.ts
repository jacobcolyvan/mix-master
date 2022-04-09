import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

// Auth, tokens, cookies and settings
const settingsSlice = createSlice({
  name: 'settingsSlice',
  initialState,
  reducers: {},
});

export const {} = settingsSlice.actions;

export default settingsSlice.reducer;
