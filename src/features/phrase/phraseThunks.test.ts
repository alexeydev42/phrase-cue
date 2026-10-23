import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { phraseReducer, hydratePhrases } from './phraseSlice'
import { settingsReducer, setLearningLimit } from '../settings/settingsSlice'
import { sourceReducer } from '../source/sourceSlice'
import type { Phrase, PhraseStatus } from './phraseTypes'
import { savePhrases } from './phraseStorage'
import {
  removePhrase,
  savePhrase,
  savePhraseTranslation,
  transitionPhraseStatus,
} from './phraseThunks'

vi.mock('./phraseStorage', () => ({ savePhrases: vi.fn() }))

const createPhrase = (id: string, status: PhraseStatus, russianText?: string): Phrase => ({
  id,
  englishText: `Phrase ${id}`,
  russianText,
  status,
  createdAt: '2026-10-01T12:00:00.000Z',
  statusChangedAt: '2026-10-01T12:00:00.000Z',
  source: {
    showTitle: 'Friends',
    seasonNumber: 1,
    episodeNumber: 1,
    timecodeMs: 60000,
  },
})

const createStore = (phrases: Phrase[] = [], limit = 10) => {
  const store = configureStore({
    reducer: { phrase: phraseReducer, settings: settingsReducer, source: sourceReducer },
  })
  store.dispatch(hydratePhrases(phrases))
  store.dispatch(setLearningLimit(limit))
  return store
}

const mockedSave = vi.mocked(savePhrases)

beforeEach(() => {
  mockedSave.mockReset()
  mockedSave.mockResolvedValue(undefined)
})

describe('transitionPhraseStatus', () => {
  it.each([
    ['new', 'learning'],
    ['learning', 'learned'],
    ['learned', 'learning'],
  ] as const)('allows %s → %s and persists the change', async (from, to) => {
    const store = createStore([createPhrase('1', from, 'Перевод')])
    const createdAt = store.getState().phrase.phrases[0].createdAt

    await store.dispatch(transitionPhraseStatus('1', to))

    const updated = store.getState().phrase.phrases[0]
    expect(updated.status).toBe(to)
    expect(updated.createdAt).toBe(createdAt)
    expect(updated.statusChangedAt).not.toBe('2026-10-01T12:00:00.000Z')
    expect(mockedSave).toHaveBeenCalledWith([updated])
  })

  it('rejects an invalid transition without persisting', async () => {
    const store = createStore([createPhrase('1', 'new', 'Перевод')])
    await store.dispatch(transitionPhraseStatus('1', 'learned'))
    expect(store.getState().phrase.phrases[0].status).toBe('new')
    expect(mockedSave).not.toHaveBeenCalled()
  })

  it('does not move an untranslated phrase to Learning', async () => {
    const store = createStore([createPhrase('1', 'new', '   ')])
    await store.dispatch(transitionPhraseStatus('1', 'learning'))
    expect(store.getState().phrase.phrases[0].status).toBe('new')
    expect(mockedSave).not.toHaveBeenCalled()
  })

  it.each(['new', 'learned'] as const)('blocks %s → Learning at the limit', async (from) => {
    const store = createStore(
      [createPhrase('1', 'learning', 'Один'), createPhrase('2', from, 'Два')],
      1,
    )
    await store.dispatch(transitionPhraseStatus('2', 'learning'))
    expect(store.getState().phrase.phrases[1].status).toBe(from)
    expect(mockedSave).not.toHaveBeenCalled()
  })

  it('allows Learning → Learned even when the limit is full', async () => {
    const store = createStore([createPhrase('1', 'learning', 'Перевод')], 1)
    await store.dispatch(transitionPhraseStatus('1', 'learned'))
    expect(store.getState().phrase.phrases[0].status).toBe('learned')
  })

  it('does not update Redux if IndexedDB persistence fails', async () => {
    const store = createStore([createPhrase('1', 'new', 'Перевод')])
    mockedSave.mockRejectedValueOnce(new Error('Storage failed'))
    await expect(store.dispatch(transitionPhraseStatus('1', 'learning'))).rejects.toThrow(
      'Storage failed',
    )
    expect(store.getState().phrase.phrases[0].status).toBe('new')
  })
})

describe('phrase persistence thunks', () => {
  it('saves a new phrase before adding it to Redux', async () => {
    const store = createStore()
    const phrase = createPhrase('1', 'new')
    await store.dispatch(savePhrase(phrase))
    expect(mockedSave).toHaveBeenCalledWith([phrase])
    expect(store.getState().phrase.phrases).toEqual([phrase])
  })

  it('deletes an existing phrase, leaving other phrases intact', async () => {
    const store = createStore([createPhrase('1', 'new'), createPhrase('2', 'learned')])
    await store.dispatch(removePhrase('1'))
    expect(store.getState().phrase.phrases.map((phrase) => phrase.id)).toEqual(['2'])
    expect(mockedSave).toHaveBeenCalledWith([createPhrase('2', 'learned')])
  })

  it('does not persist when the phrase to delete does not exist', async () => {
    const store = createStore([createPhrase('1', 'new')])
    await store.dispatch(removePhrase('missing'))
    expect(mockedSave).not.toHaveBeenCalled()
  })

  it('trims and persists a translation without changing its status', async () => {
    const store = createStore([createPhrase('1', 'new')])
    await store.dispatch(savePhraseTranslation('1', '  Привет  '))
    const phrase = store.getState().phrase.phrases[0]
    expect(phrase.russianText).toBe('Привет')
    expect(phrase.status).toBe('new')
    expect(phrase.statusChangedAt).toBe('2026-10-01T12:00:00.000Z')
    expect(mockedSave).toHaveBeenCalledWith([phrase])
  })

  it('rejects empty translations', async () => {
    const store = createStore([createPhrase('1', 'new')])
    await store.dispatch(savePhraseTranslation('1', '   '))
    expect(mockedSave).not.toHaveBeenCalled()
  })
})
