import { describe, expect, it } from 'vitest'
import type { Phrase } from '../phrase/phraseTypes'
import { createBackup, parseBackupJson } from './backup'

const createPhrase = (id = 'phrase-1'): Phrase => ({
  id,
  englishText: 'How are you?',
  status: 'new',
  createdAt: '2026-10-20T12:00:00.000Z',
  statusChangedAt: '2026-10-20T12:00:00.000Z',
  source: {
    showTitle: 'Friends',
    seasonNumber: 1,
    episodeNumber: 2,
    timecodeMs: 65400,
  },
})

describe('backup format', () => {
  it('creates a versioned backup with phrases and Learning limit', () => {
    const phrase = createPhrase()
    const backup = createBackup([phrase], 10)

    expect(backup).toEqual({
      format: 'phrase-cue-backup',
      version: 1,
      phrases: [phrase],
      settings: { learningLimit: 10 },
    })
  })

  it('round-trips an untranslated New phrase', () => {
    const backup = createBackup([createPhrase()], 10)

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup)
  })

  it('accepts an empty phrase library', () => {
    const backup = createBackup([], 10)

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup)
  })

  it('accepts Learning and Learned phrases with translations', () => {
    const phrases: Phrase[] = [
      { ...createPhrase('1'), status: 'learning', russianText: 'Как дела?' },
      { ...createPhrase('2'), status: 'learned', russianText: 'Как дела?' },
    ]
    const backup = createBackup(phrases, 2)

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup)
  })

  it('rejects malformed JSON', () => {
    expect(parseBackupJson('{invalid')).toBeNull()
  })

  it('rejects invalid backup structures', () => {
    const phrase = createPhrase()
    const backup = createBackup([phrase], 10)

    const invalidCases = [
      { ...backup, format: 'other-app' },
      { ...backup, version: 2 },
      { ...backup, settings: { learningLimit: 0 } },
      { ...backup, settings: { learningLimit: 51 } },
      { ...backup, phrases: [{ ...phrase, id: '' }] },
      { ...backup, phrases: [phrase, phrase] },
      { ...backup, phrases: [{ ...phrase, status: 'unknown' }] },
      { ...backup, phrases: [{ ...phrase, createdAt: 'invalid-date' }] },
      { ...backup, phrases: [{ ...phrase, statusChangedAt: undefined }] },
      { ...backup, phrases: [{ ...phrase, englishText: '   ' }] },
      { ...backup, phrases: [{ ...phrase, status: 'learning' }] },
      { ...backup, phrases: [{ ...phrase, status: 'learned' }] },
      {
        ...backup,
        phrases: [{ ...phrase, source: { ...phrase.source, timecodeMs: -1 } }],
      },
      {
        ...backup,
        phrases: [{ ...phrase, source: { ...phrase.source, seasonNumber: 0 } }],
      },
      { ...backup, shows: [] },
      { ...backup, phrases: [{ ...phrase, unexpectedField: true }] },
    ]

    for (const invalidBackup of invalidCases) {
      expect(parseBackupJson(JSON.stringify(invalidBackup))).toBeNull()
    }
  })

  it('rejects a Learning count above the restored limit', () => {
    const phrases: Phrase[] = [
      { ...createPhrase('1'), status: 'learning', russianText: 'Один' },
      { ...createPhrase('2'), status: 'learning', russianText: 'Два' },
    ]
    const backup = createBackup(phrases, 1)

    expect(parseBackupJson(JSON.stringify(backup))).toBeNull()
  })

  it('allows the Learning count to equal the limit', () => {
    const phrase: Phrase = {
      ...createPhrase(),
      status: 'learning',
      russianText: 'Как дела?',
    }
    const backup = createBackup([phrase], 1)

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup)
  })
})
