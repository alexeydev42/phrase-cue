// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { saveLanguage, loadLanguage, saveTheme, loadTheme } from './settingsPreferencesStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('loadLanguage', () => {
  it('returns the saved language', () => {
    localStorage.setItem('phrase-cue-language', 'ru')
    expect(loadLanguage()).toBe('ru')
  })

  it('returns English by default when no language is saved', () => {
    expect(loadLanguage()).toBe('en')
  })

  it('returns English when the saved language is invalid', () => {
    localStorage.setItem('phrase-cue-language', 'fr')
    expect(loadLanguage()).toBe('en')
  })
})

describe('saveLanguage', () => {
  it('saves the selected language', () => {
    saveLanguage('ru')
    expect(localStorage.getItem('phrase-cue-language')).toBe('ru')
  })
})

describe('loadTheme', () => {
  it.each(['dark', 'light', 'system'])('returns the saved theme %s', (theme) => {
    localStorage.setItem('phrase-cue-theme', theme)
    expect(loadTheme()).toBe(theme)
  })

  it('returns system by default when no theme is saved', () => {
    expect(loadTheme()).toBe('system')
  })

  it('returns system when the saved theme is invalid', () => {
    localStorage.setItem('phrase-cue-theme', 'blue')
    expect(loadTheme()).toBe('system')
  })
})

describe('saveTheme', () => {
  it('saves the selected theme', () => {
    saveTheme('dark')
    expect(localStorage.getItem('phrase-cue-theme')).toBe('dark')
  })
})
