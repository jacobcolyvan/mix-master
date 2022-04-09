import { configureStore, Action } from '@reduxjs/toolkit';
import thunk, { ThunkAction } from 'redux-thunk';
import controlsSlice from '../features/controlsSlice';
import itemsSlice from '../features/itemsSlice';
import settingsSlice from '../features/settingsSlice';

export const store = configureStore({
  reducer: {
    controlsSlice,
    itemsSlice,
    settingsSlice,
  },
  middleware: [thunk],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;
