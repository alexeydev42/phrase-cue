import { configureStore } from '@reduxjs/toolkit'
import { settingsReducer } from '../features/settings/settingsSlice'
import { sourceReducer } from '../features/source/sourceSlice'
import { phraseReducer } from '../features/phrase/phraseSlice'

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    source: sourceReducer,
    phrase: phraseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
