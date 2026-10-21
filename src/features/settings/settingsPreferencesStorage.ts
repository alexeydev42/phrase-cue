import type { Language, Theme } from './settingsSlice'

const THEME_KEY = 'phrase-cue-theme'
const LANGUAGE_KEY = 'phrase-cue-language'

export const loadTheme = (): Theme => {
  const theme = localStorage.getItem(THEME_KEY)

  if (theme === 'system' || theme === 'light' || theme === 'dark') {
    return theme
  }

  return 'system'
}

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme)
}

export const loadLanguage = (): Language => {
  const language = localStorage.getItem(LANGUAGE_KEY)

  if (language === 'en' || language === 'ru') {
    return language
  }

  return 'en'
}

export const saveLanguage = (language: Language): void => {
  localStorage.setItem(LANGUAGE_KEY, language)
}
