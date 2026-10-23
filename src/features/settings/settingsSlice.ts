import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export type Theme = 'system' | 'light' | 'dark'
export type Language = 'en' | 'ru'

type SettingsState = {
  theme: Theme
  language: Language
  learningLimit: number
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'en',
  learningLimit: 10,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload
    },
    setLearningLimit(state, action: PayloadAction<number>) {
      state.learningLimit = action.payload
    },
  },
})

export const { setTheme, setLanguage, setLearningLimit } = settingsSlice.actions
export const settingsReducer = settingsSlice.reducer

export const selectTheme = (state: RootState) => state.settings.theme
export const selectLanguage = (state: RootState) => state.settings.language
export const selectLearningLimit = (state: RootState) => state.settings.learningLimit
