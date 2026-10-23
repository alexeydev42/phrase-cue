import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hydratePhrases, phraseReducer } from '../phrase/phraseSlice'
import type { Phrase } from '../phrase/phraseTypes'
import { settingsReducer, setLanguage, setLearningLimit, setTheme } from '../settings/settingsSlice'
import { hydrateShows, setActiveEpisodeId, sourceReducer } from '../source/sourceSlice'
import type { Show } from '../source/sourceTypes'
import { createBackup } from './backup'
import { replaceBackupData } from './backupStorage'
import { exportBackup, restoreBackup } from './backupThunks'

vi.mock('./backupStorage', () => ({
  replaceBackupData: vi.fn(),
}))

const createPhrase = (id: string): Phrase => ({
  id,
  englishText: `Phrase ${id}`,
  status: 'new',
  createdAt: '2026-10-20T12:00:00.000Z',
  statusChangedAt: '2026-10-20T12:00:00.000Z',
  source: {
    showTitle: 'Friends',
    seasonNumber: 1,
    episodeNumber: 1,
    timecodeMs: 60000,
  },
})

const oldShows: Show[] = [{ id: 'old-show', title: 'Old show', seasons: [] }]

const restoredShows: Show[] = [
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
            cues: [{ id: 'cue-1', startMs: 1000, endMs: 2000, text: 'Hello!' }],
          },
        ],
      },
    ],
  },
]

const createStore = () => {
  const store = configureStore({
    reducer: {
      phrase: phraseReducer,
      settings: settingsReducer,
      source: sourceReducer,
    },
  })

  store.dispatch(hydratePhrases([createPhrase('old')]))
  store.dispatch(hydrateShows(oldShows))
  store.dispatch(setActiveEpisodeId('old-episode'))
  store.dispatch(setLearningLimit(10))
  store.dispatch(setLanguage('ru'))
  store.dispatch(setTheme('dark'))

  return store
}

const mockedReplace = vi.mocked(replaceBackupData)

beforeEach(() => {
  mockedReplace.mockReset()
  mockedReplace.mockResolvedValue(undefined)
})

describe('restoreBackup', () => {
  it('replaces shows, phrases and Learning limit after persistence succeeds', async () => {
    const store = createStore()
    const phrases = [createPhrase('new-1'), createPhrase('new-2')]
    const backup = createBackup(phrases, 5, restoredShows)

    await store.dispatch(restoreBackup(backup))

    expect(mockedReplace).toHaveBeenCalledWith(backup)
    expect(store.getState().source.shows).toEqual(restoredShows)
    expect(store.getState().source.activeEpisodeId).toBeNull()
    expect(store.getState().phrase.phrases).toEqual(phrases)
    expect(store.getState().settings.learningLimit).toBe(5)
    expect(store.getState().settings.language).toBe('ru')
    expect(store.getState().settings.theme).toBe('dark')
  })

  it('replaces both libraries with empty arrays when the backup is empty', async () => {
    const store = createStore()
    const backup = createBackup([], 3, [])

    await store.dispatch(restoreBackup(backup))

    expect(store.getState().source.shows).toEqual([])
    expect(store.getState().source.activeEpisodeId).toBeNull()
    expect(store.getState().phrase.phrases).toEqual([])
    expect(store.getState().settings.learningLimit).toBe(3)
  })

  it('keeps Redux unchanged when persistence fails', async () => {
    const store = createStore()
    const previousState = store.getState()
    const backup = createBackup([createPhrase('replacement')], 4, restoredShows)

    mockedReplace.mockRejectedValueOnce(new Error('Storage failed'))

    await expect(store.dispatch(restoreBackup(backup))).rejects.toThrow('Storage failed')

    expect(store.getState()).toEqual(previousState)
  })

  it('does not update Redux before the database transaction completes', async () => {
    const store = createStore()
    const backup = createBackup([createPhrase('replacement')], 4, restoredShows)

    let completeWrite!: () => void
    const pendingWrite = new Promise<void>((resolve) => {
      completeWrite = resolve
    })

    mockedReplace.mockReturnValueOnce(pendingWrite)

    const restoration = store.dispatch(restoreBackup(backup))

    await Promise.resolve()

    expect(mockedReplace).toHaveBeenCalledWith(backup)
    expect(store.getState().source.shows).toEqual(oldShows)
    expect(store.getState().source.activeEpisodeId).toBe('old-episode')
    expect(store.getState().phrase.phrases[0].id).toBe('old')
    expect(store.getState().settings.learningLimit).toBe(10)

    completeWrite()
    await restoration

    expect(store.getState().source.shows).toEqual(restoredShows)
    expect(store.getState().source.activeEpisodeId).toBeNull()
    expect(store.getState().phrase.phrases[0].id).toBe('replacement')
    expect(store.getState().settings.learningLimit).toBe(4)
  })
})

describe('exportBackup', () => {
  it('exports current shows, phrases and Learning limit without runtime settings', async () => {
    const store = createStore()

    const json = await store.dispatch(exportBackup())
    const backup = JSON.parse(json)

    expect(backup).toEqual(createBackup([createPhrase('old')], 10, oldShows))
    expect(backup.settings).not.toHaveProperty('language')
    expect(backup.settings).not.toHaveProperty('theme')
    expect(backup).not.toHaveProperty('activeEpisodeId')
    expect(backup).not.toHaveProperty('source')
  })
})
