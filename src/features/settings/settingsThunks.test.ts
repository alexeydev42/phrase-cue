import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { phraseReducer, hydratePhrases } from '../phrase/phraseSlice'
import type { Phrase } from '../phrase/phraseTypes'
import { sourceReducer } from '../source/sourceSlice'
import { settingsReducer } from './settingsSlice'
import { loadLearningLimit, saveLearningLimit } from './settingsStorage'
import { hydrateLearningLimit, updateLearningLimit } from './settingsThunks'

vi.mock('./settingsStorage', () => ({
  saveLearningLimit: vi.fn(),
  loadLearningLimit: vi.fn(),
}))

const createLearningPhrase = (id: string): Phrase => ({
  id,
  englishText: 'Hello',
  status: 'learning',
  russianText: 'Привет',
  createdAt: '2026-10-01T12:00:00.000Z',
  statusChangedAt: '2026-10-01T12:00:00.000Z',
  source: { showTitle: 'Friends', seasonNumber: 1, episodeNumber: 1, timecodeMs: 60000 },
})

const createStore = (learningCount = 0) => {
  const store = configureStore({
    reducer: { phrase: phraseReducer, settings: settingsReducer, source: sourceReducer },
  })
  store.dispatch(
    hydratePhrases(
      Array.from({ length: learningCount }, (_, i) => createLearningPhrase(String(i))),
    ),
  )
  return store
}

const mockedSave = vi.mocked(saveLearningLimit)
const mockedLoad = vi.mocked(loadLearningLimit)

beforeEach(() => {
  mockedSave.mockReset()
  mockedLoad.mockReset()
  mockedSave.mockResolvedValue(undefined)
})

describe('updateLearningLimit', () => {
  it('persists a valid limit and updates Redux', async () => {
    const store = createStore(3)
    await store.dispatch(updateLearningLimit(8))
    expect(mockedSave).toHaveBeenCalledWith(8)
    expect(store.getState().settings.learningLimit).toBe(8)
  })

  it.each([0, 51, 1.5, NaN])('rejects invalid numeric limit %s', async (limit) => {
    const store = createStore()
    await store.dispatch(updateLearningLimit(limit))
    expect(mockedSave).not.toHaveBeenCalled()
    expect(store.getState().settings.learningLimit).toBe(10)
  })

  it('rejects a limit below the current Learning count', async () => {
    const store = createStore(7)
    await store.dispatch(updateLearningLimit(6))
    expect(mockedSave).not.toHaveBeenCalled()
    expect(store.getState().settings.learningLimit).toBe(10)
  })

  it('allows a limit equal to the current Learning count', async () => {
    const store = createStore(7)
    await store.dispatch(updateLearningLimit(7))
    expect(store.getState().settings.learningLimit).toBe(7)
  })

  it('keeps Redux unchanged when saving fails', async () => {
    const store = createStore()
    mockedSave.mockRejectedValueOnce(new Error('Storage failed'))
    await expect(store.dispatch(updateLearningLimit(15))).rejects.toThrow('Storage failed')
    expect(store.getState().settings.learningLimit).toBe(10)
  })
})

describe('hydrateLearningLimit', () => {
  it('restores a valid saved limit', async () => {
    mockedLoad.mockResolvedValueOnce(12)
    const store = createStore(4)
    await store.dispatch(hydrateLearningLimit())
    expect(store.getState().settings.learningLimit).toBe(12)
  })

  it.each([undefined, 0, 51, 2.5])('ignores missing or invalid saved limit %s', async (limit) => {
    mockedLoad.mockResolvedValueOnce(limit)
    const store = createStore()
    await store.dispatch(hydrateLearningLimit())
    expect(store.getState().settings.learningLimit).toBe(10)
  })

  it('ignores a saved limit below the number of Learning phrases', async () => {
    mockedLoad.mockResolvedValueOnce(3)
    const store = createStore(5)
    await store.dispatch(hydrateLearningLimit())
    expect(store.getState().settings.learningLimit).toBe(10)
  })
})
