// @vitest-environment jsdom

import { configureStore } from '@reduxjs/toolkit'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Provider } from 'react-redux'

import { phraseReducer } from '../../features/phrase/phraseSlice'
import { settingsReducer } from '../../features/settings/settingsSlice'
import { sourceReducer } from '../../features/source/sourceSlice'
import { SettingsPage } from './SettingsPage'
import { ThemeSync } from '../../features/settings/ThemeSync'

vi.mock('../../features/settings/settingsStorage', () => ({
  saveLearningLimit: vi.fn(),
  loadLearningLimit: vi.fn(),
}))

const renderSettings = () => {
  const store = configureStore({
    reducer: {
      phrase: phraseReducer,
      settings: settingsReducer,
      source: sourceReducer,
    },
  })

  const view = render(
    <Provider store={store}>
      <ThemeSync />
      <SettingsPage />
    </Provider>,
  )

  return { store, ...view }
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  delete document.documentElement.dataset.theme
})

describe('SettingsPage', () => {
  it('renders English UI by default', () => {
    renderSettings()
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy()
  })

  it('switches the interface language to Russian', () => {
    const { store } = renderSettings()
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Русский' }))

    expect(screen.getByRole('heading', { name: 'Настройки' })).toBeTruthy()
    expect(store.getState().settings.language).toBe('ru')
    expect(localStorage.getItem('phrase-cue-language')).toBe('ru')
  })

  it('applies and persists the selected dark theme', () => {
    const { store } = renderSettings()
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))

    expect(store.getState().settings.theme).toBe('dark')
    expect(localStorage.getItem('phrase-cue-theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Dark', pressed: true })).toBeTruthy()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('applies and persists the selected system theme after dark', () => {
    const { store } = renderSettings()

    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
    expect(document.documentElement.dataset.theme).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'System' }))

    expect(store.getState().settings.theme).toBe('system')
    expect(localStorage.getItem('phrase-cue-theme')).toBe('system')
    expect(screen.getByRole('button', { name: 'System', pressed: true })).toBeTruthy()
    expect(document.documentElement.dataset.theme).toBe('system')
  })
})
