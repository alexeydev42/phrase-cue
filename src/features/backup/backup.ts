import type { Cue, Episode, Season, Show } from '../source/sourceTypes'
import type { Phrase } from '../phrase/phraseTypes'
import { isValidLearningLimit } from '../settings/learningLimitValidation'

export interface PhraseCueBackup {
  format: 'phrase-cue-backup'
  version: 1
  shows: Show[]
  phrases: Phrase[]
  settings: {
    learningLimit: number
  }
}

export const createBackup = (
  phrases: Phrase[],
  learningLimit: number,
  shows: Show[],
): PhraseCueBackup => ({
  format: 'phrase-cue-backup',
  version: 1,
  shows,
  phrases,
  settings: { learningLimit },
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasOnlyKeys = (value: Record<string, unknown>, allowed: string[]): boolean =>
  Object.keys(value).every((key) => allowed.includes(key))

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isIsoDate = (value: unknown): value is string => {
  if (typeof value !== 'string') return false

  const timestamp = Date.parse(value)

  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
}

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const hasValidUniqueIds = <T extends { id: string }>(
  value: unknown,
  isValid: (item: unknown) => item is T,
): value is T[] => {
  if (!Array.isArray(value)) return false

  const ids = new Set<string>()

  for (const item of value) {
    if (!isValid(item) || ids.has(item.id)) return false
    ids.add(item.id)
  }

  return true
}

const isValidCue = (value: unknown): value is Cue =>
  isRecord(value) &&
  hasOnlyKeys(value, ['id', 'startMs', 'endMs', 'text']) &&
  isNonEmptyString(value.id) &&
  isNonNegativeInteger(value.startMs) &&
  isNonNegativeInteger(value.endMs) &&
  value.endMs > value.startMs &&
  isNonEmptyString(value.text)

const isValidEpisode = (value: unknown): value is Episode =>
  isRecord(value) &&
  hasOnlyKeys(value, ['id', 'number', 'cues']) &&
  isNonEmptyString(value.id) &&
  isPositiveInteger(value.number) &&
  hasValidUniqueIds(value.cues, isValidCue)

const isValidSeason = (value: unknown): value is Season =>
  isRecord(value) &&
  hasOnlyKeys(value, ['id', 'number', 'episodes']) &&
  isNonEmptyString(value.id) &&
  isPositiveInteger(value.number) &&
  hasValidUniqueIds(value.episodes, isValidEpisode)

const isValidShow = (value: unknown): value is Show =>
  isRecord(value) &&
  hasOnlyKeys(value, ['id', 'title', 'seasons']) &&
  isNonEmptyString(value.id) &&
  isNonEmptyString(value.title) &&
  hasValidUniqueIds(value.seasons, isValidSeason)

const isValidPhrase = (value: unknown): value is Phrase => {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, [
      'id',
      'englishText',
      'russianText',
      'status',
      'createdAt',
      'statusChangedAt',
      'source',
    ]) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.englishText) ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.statusChangedAt) ||
    !isRecord(value.source)
  ) {
    return false
  }

  if (value.status !== 'new' && value.status !== 'learning' && value.status !== 'learned') {
    return false
  }

  if (value.russianText !== undefined && !isNonEmptyString(value.russianText)) {
    return false
  }

  if (value.status !== 'new' && !isNonEmptyString(value.russianText)) {
    return false
  }

  const source = value.source

  return (
    hasOnlyKeys(source, ['showTitle', 'seasonNumber', 'episodeNumber', 'timecodeMs']) &&
    isNonEmptyString(source.showTitle) &&
    isPositiveInteger(source.seasonNumber) &&
    isPositiveInteger(source.episodeNumber) &&
    isNonNegativeInteger(source.timecodeMs)
  )
}

export const isValidBackup = (value: unknown): value is PhraseCueBackup => {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ['format', 'version', 'shows', 'phrases', 'settings']) ||
    value.format !== 'phrase-cue-backup' ||
    value.version !== 1 ||
    !Array.isArray(value.phrases) ||
    !isRecord(value.settings) ||
    !hasOnlyKeys(value.settings, ['learningLimit'])
  ) {
    return false
  }

  if (!hasValidUniqueIds(value.shows, isValidShow)) return false

  const limit = value.settings.learningLimit

  if (typeof limit !== 'number' || !isValidLearningLimit(limit)) {
    return false
  }

  const ids = new Set<string>()
  let learningCount = 0

  for (const phrase of value.phrases) {
    if (!isValidPhrase(phrase) || ids.has(phrase.id)) {
      return false
    }

    ids.add(phrase.id)

    if (phrase.status === 'learning') {
      learningCount += 1
    }
  }

  return learningCount <= limit
}

export const parseBackupJson = (content: string): PhraseCueBackup | null => {
  try {
    const value: unknown = JSON.parse(content)
    return isValidBackup(value) ? value : null
  } catch {
    return null
  }
}
