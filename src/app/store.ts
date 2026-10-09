import { configureStore } from '@reduxjs/toolkit'
import { settingsReducer } from '../features/settings/settingsSlice'
import { sourceReducer } from '../features/source/sourceSlice'

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    source: sourceReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store