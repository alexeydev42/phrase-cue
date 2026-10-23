import { describe, expect, it } from 'vitest'
import type { Phrase } from '../phrase/phraseTypes'
import type { Show } from '../source/sourceTypes'
import { createBackup, isValidBackup, parseBackupJson } from './backup'

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

const testShows: Show[] = [
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
            number: 2,
            cues: [
              { id: 'cue-1', startMs: 1000, endMs: 3000, text: 'How are you?' },
              { id: 'cue-2', startMs: 4000, endMs: 6000, text: 'I am fine.' },
            ],
          },
        ],
      },
    ],
  },
]

describe('backup format', () => {
  it('creates a version 1 backup with phrases, shows and Learning limit', () => {
    const phrase = createPhrase()
    const backup = createBackup([phrase], 10, testShows)

    expect(backup).toEqual({
      format: 'phrase-cue-backup',
      version: 1,
      shows: testShows,
      phrases: [phrase],
      settings: { learningLimit: 10 },
    })
    expect(isValidBackup(backup)).toBe(true)
  })

  it('round-trips an untranslated New phrase and imported subtitles', () => {
    const backup = createBackup([createPhrase()], 10, testShows)

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup)
  })

  it('accepts an empty library and an empty source list', () => {
    const backup = createBackup([], 10, [])

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup)
  })

  it('accepts Learning and Learned phrases with translations', () => {
    const phrases: Phrase[] = [
      { ...createPhrase('1'), status: 'learning', russianText: 'Как дела?' },
      { ...createPhrase('2'), status: 'learned', russianText: 'Как дела?' },
    ]
    const backup = createBackup(phrases, 2, testShows)

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup)
  })

  it('rejects malformed JSON', () => {
    expect(parseBackupJson('{invalid')).toBeNull()
  })

  it('rejects invalid backup and phrase structures', () => {
    const phrase = createPhrase()
    const backup = createBackup([phrase], 10, testShows)

    const invalidCases = [
      { ...backup, format: 'other-app' },
      { ...backup, version: 2 },
      { ...backup, shows: undefined },
      { ...backup, shows: null },
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
      { ...backup, phrases: [{ ...phrase, unexpectedField: true }] },
    ]

    for (const invalidBackup of invalidCases) {
      expect(parseBackupJson(JSON.stringify(invalidBackup))).toBeNull()
    }
  })

  it('rejects damaged subtitle cues', () => {
    const invalidTime = structuredClone(createBackup([], 10, testShows))
    invalidTime.shows[0].seasons[0].episodes[0].cues[0].endMs = 500

    const emptyText = structuredClone(createBackup([], 10, testShows))
    emptyText.shows[0].seasons[0].episodes[0].cues[0].text = '   '

    expect(isValidBackup(invalidTime)).toBe(false)
    expect(isValidBackup(emptyText)).toBe(false)
  })

  it('rejects invalid source hierarchy and duplicate IDs', () => {
    const backup = createBackup([], 10, testShows)
    const show = testShows[0]
    const season = show.seasons[0]
    const episode = season.episodes[0]
    const cue = episode.cues[0]

    const invalidCases = [
      { ...backup, shows: [show, show] },
      { ...backup, shows: [{ ...show, title: '' }] },
      { ...backup, shows: [{ ...show, seasons: [season, season] }] },
      { ...backup, shows: [{ ...show, seasons: [{ ...season, number: 0 }] }] },
      { ...backup, shows: [{ ...show, seasons: [{ ...season, episodes: [episode, episode] }] }] },
      {
        ...backup,
        shows: [{ ...show, seasons: [{ ...season, episodes: [{ ...episode, number: 0 }] }] }],
      },
      {
        ...backup,
        shows: [
          {
            ...show,
            seasons: [
              {
                ...season,
                episodes: [{ ...episode, cues: [cue, cue] }],
              },
            ],
          },
        ],
      },
    ]

    for (const invalidBackup of invalidCases) {
      expect(isValidBackup(invalidBackup)).toBe(false)
    }
  })

  it('rejects a Learning count above the restored limit', () => {
    const phrases: Phrase[] = [
      { ...createPhrase('1'), status: 'learning', russianText: 'Один' },
      { ...createPhrase('2'), status: 'learning', russianText: 'Два' },
    ]
    const backup = createBackup(phrases, 1, testShows)

    expect(parseBackupJson(JSON.stringify(backup))).toBeNull()
  })

  it('allows the Learning count to equal the limit', () => {
    const phrase: Phrase = {
      ...createPhrase(),
      status: 'learning',
      russianText: 'Как дела?',
    }
    const backup = createBackup([phrase], 1, testShows)

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup)
  })
})
