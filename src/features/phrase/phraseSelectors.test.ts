import { describe, expect, it } from 'vitest'
import { store, type RootState } from '../../app/store'
import type { Phrase } from './phraseTypes'
import { selectPhrasesByStatus } from './phraseSlice'

const createPhrase = (id: string, status: Phrase['status'], statusChangedAt: string): Phrase => ({
  id,
  englishText: `Phrase ${id}`,
  status,
  createdAt: '2026-10-01T12:00:00.000Z',
  statusChangedAt,
  source: {
    showTitle: 'Friends',
    seasonNumber: 1,
    episodeNumber: 1,
    timecodeMs: 60000,
  },
})

describe('selectPhrasesByStatus', () => {
  const phrases = [
    createPhrase('1', 'new', '2026-10-01T12:00:00.000Z'),
    createPhrase('2', 'learning', '2026-10-02T12:00:00.000Z'),
    createPhrase('3', 'new', '2026-10-03T12:00:00.000Z'),
  ]

  const state: RootState = {
    ...store.getState(),
    phrase: { phrases },
  }

  it('filters phrases by status and sorts newest first', () => {
    const result = selectPhrasesByStatus(state, 'new')
    expect(result.map((phrase) => phrase.id)).toEqual(['3', '1'])
  })

  it('returns the same reference when inputs are unchanged', () => {
    const a = selectPhrasesByStatus(state, 'new')
    const b = selectPhrasesByStatus(state, 'new')
    expect(a).toBe(b)
  })

  it('does not mutate the original phrases array', () => {
    selectPhrasesByStatus(state, 'new')
    expect(phrases.map((phrase) => phrase.id)).toEqual(['1', '2', '3'])
  })
})
