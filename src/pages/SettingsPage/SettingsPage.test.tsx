// @vitest-environment jsdom

import { configureStore } from '@reduxjs/toolkit'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Provider } from 'react-redux'

import { phraseReducer } from '../../features/phrase/phraseSlice'
import { settingsReducer } from '../../features/settings/settingsSlice'
import { hydrateShows, setActiveEpisodeId, sourceReducer } from '../../features/source/sourceSlice'
import type { Show } from '../../features/source/sourceTypes'
import { SettingsPage } from './SettingsPage'
import { ThemeSync } from '../../features/settings/ThemeSync'

import { createBackup } from '../../features/backup/backup'
import { replaceBackupData } from '../../features/backup/backupStorage'

vi.mock('../../features/settings/settingsStorage', () => ({
  saveLearningLimit: vi.fn(),
  loadLearningLimit: vi.fn(),
}))

vi.mock('../../features/backup/backupStorage', () => ({
  replaceBackupData: vi.fn(),
}))

const mockedReplaceBackup = vi.mocked(replaceBackupData)

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

const selectBackupFile = (container: HTMLElement, content: string) => {
  const input = container.querySelector('input[type="file"]')

  if (!input) {
    throw new Error('Backup file input not found')
  }

  const file = new File([content], 'backup.json', {
    type: 'application/json',
  })

  Object.defineProperty(file, 'text', {
    value: async () => content,
  })

  fireEvent.change(input, {
    target: { files: [file] },
  })
}

beforeEach(() => {
  localStorage.clear()

  mockedReplaceBackup.mockReset()
  mockedReplaceBackup.mockResolvedValue(undefined)

  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }

  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
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

describe('Settings backup UI', () => {
  it('rejects an invalid backup without changing data', async () => {
    const { store, container } = renderSettings()
    const previousState = store.getState()

    selectBackupFile(container, '{invalid')

    expect(await screen.findByText('Invalid backup file')).toBeTruthy()
    expect(screen.getByText('Nothing was changed.')).toBeTruthy()

    expect(store.getState()).toEqual(previousState)
    expect(mockedReplaceBackup).not.toHaveBeenCalled()
  })

  it('requires confirmation before restoring', async () => {
    const { store, container } = renderSettings()
    const backup = createBackup([], 5, [])

    selectBackupFile(container, JSON.stringify(backup))

    expect(await screen.findByRole('dialog', { name: 'Restore backup?' })).toBeTruthy()

    expect(mockedReplaceBackup).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedReplaceBackup).not.toHaveBeenCalled()
    expect(store.getState().settings.learningLimit).toBe(10)
  })

  it('restores Learning limit after confirmation', async () => {
    const { store, container } = renderSettings()
    const backup = createBackup([], 5, [])

    selectBackupFile(container, JSON.stringify(backup))

    expect(await screen.findByRole('dialog', { name: 'Restore backup?' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))

    await waitFor(() => {
      expect(mockedReplaceBackup).toHaveBeenCalledWith(backup)
      expect(store.getState().settings.learningLimit).toBe(5)
    })

    expect(screen.getByRole('spinbutton')).toHaveProperty('value', '5')
    expect(store.getState().phrase.phrases).toEqual([])
  })

  it('restores shows and subtitle cues after confirmation', async () => {
    const { store, container } = renderSettings()
    const oldShows: Show[] = [{ id: 'old-show', title: 'Old show', seasons: [] }]
    const shows: Show[] = [
      {
        id: 'show-1',
        title: 'Friends',
        seasons: [
          {
            id: 'season-1',
            number: 1,
            episodes: [
              {
                id: 'episode-1',
                number: 1,
                cues: [
                  {
                    id: 'cue-1',
                    startMs: 1000,
                    endMs: 3000,
                    text: 'How are you?',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const backup = createBackup([], 5, shows)

    store.dispatch(hydrateShows(oldShows))
    store.dispatch(setActiveEpisodeId('old-episode'))

    selectBackupFile(container, JSON.stringify(backup))

    await screen.findByRole('dialog', { name: 'Restore backup?' })
    expect(mockedReplaceBackup).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))

    await waitFor(() => {
      expect(mockedReplaceBackup).toHaveBeenCalledWith(backup)
      expect(store.getState().source.shows).toEqual(shows)
      expect(store.getState().source.activeEpisodeId).toBeNull()
      expect(store.getState().settings.learningLimit).toBe(5)
    })
  })

  it('rejects a backup with invalid subtitle data before confirmation', async () => {
    const { store, container } = renderSettings()
    const previousState = store.getState()
    const invalidBackup = createBackup([], 5, [
      {
        id: 'show-1',
        title: 'Friends',
        seasons: [
          {
            id: 'season-1',
            number: 1,
            episodes: [
              {
                id: 'episode-1',
                number: 1,
                cues: [{ id: 'cue-1', startMs: 3000, endMs: 1000, text: 'Invalid cue' }],
              },
            ],
          },
        ],
      },
    ])

    selectBackupFile(container, JSON.stringify(invalidBackup))

    expect(await screen.findByText('Invalid backup file')).toBeTruthy()
    expect(screen.queryByRole('dialog', { name: 'Restore backup?' })).toBeNull()
    expect(mockedReplaceBackup).not.toHaveBeenCalled()
    expect(store.getState()).toEqual(previousState)
  })

  it('keeps the confirmation open when persistence fails', async () => {
    const { store, container } = renderSettings()
    const backup = createBackup([], 5, [])
    const previousState = store.getState()

    mockedReplaceBackup.mockRejectedValueOnce(new Error('Storage failed'))

    selectBackupFile(container, JSON.stringify(backup))

    expect(await screen.findByRole('dialog', { name: 'Restore backup?' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))

    expect(
      await screen.findByText('Could not restore the backup. Nothing was changed.'),
    ).toBeTruthy()

    expect(store.getState()).toEqual(previousState)
  })
})
