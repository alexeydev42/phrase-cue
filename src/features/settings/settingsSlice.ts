import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

type Theme = 'system' | 'light' | 'dark'

type SettingsState = {
  theme: Theme
}

const initialState: SettingsState = {
  theme: 'system',
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
  },
})

export const { setTheme } = settingsSlice.actions
export const settingsReducer = settingsSlice.reducer

export const selectTheme = (state: RootState) => state.settings.theme