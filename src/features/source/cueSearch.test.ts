import { describe, expect, it } from 'vitest'
import type { Cue } from './sourceTypes'
import { searchCuesByText, findNearestCueIndex, getCueWindow } from './cueSearch'

describe('findNearestCueIndex', () => {
  const cues: Cue[] = [
    {
      id: 'cue-1',
      startMs: 3000,
      endMs: 7000,
      text: 'First cue',
    },
    {
      id: 'cue-2',
      startMs: 10000,
      endMs: 13000,
      text: 'Second cue',
    },
    {
      id: 'cue-3',
      startMs: 17000,
      endMs: 21000,
      text: 'Third cue',
    },
  ]

  it('finds a cue containing the target time', () => {
    expect(findNearestCueIndex(cues, 11000)).toBe(1)
  })

  it('finds a cue at its exact boundaries', () => {
    expect(findNearestCueIndex(cues, 3000)).toBe(0)
    expect(findNearestCueIndex(cues, 13000)).toBe(1)
    expect(findNearestCueIndex(cues, 21000)).toBe(2)
  })

  it('finds the nearest cue between intervals', () => {
    expect(findNearestCueIndex(cues, 8000)).toBe(0)
    expect(findNearestCueIndex(cues, 9500)).toBe(1)
  })

  it('prefers the earlier cue when distances are equal', () => {
    expect(findNearestCueIndex(cues, 8500)).toBe(0)
  })

  it('finds the first cue when target time is before all cues', () => {
    expect(findNearestCueIndex(cues, 0)).toBe(0)
  })

  it('finds the last cue when target time is after all cues', () => {
    expect(findNearestCueIndex(cues, 40000)).toBe(2)
  })

  it('returns null for an empty cue list', () => {
    expect(findNearestCueIndex([], 11000)).toBeNull()
  })

  it('prefers the earlier cue when intervals overlap', () => {
    const overlappingCues: Cue[] = [
      { id: '1', startMs: 1000, endMs: 5000, text: 'First' },
      { id: '2', startMs: 4000, endMs: 7000, text: 'Second' },
    ]

    expect(findNearestCueIndex(overlappingCues, 4500)).toBe(0)
  })
})

describe('getCueWindow', () => {
  const cues: Cue[] = Array.from({ length: 10 }, (_, index) => ({
    id: `cue-${index}`,
    startMs: index * 5000,
    endMs: index * 5000 + 3000,
    text: `Cue ${index}`,
  }))

  it('returns three cues before and after the center', () => {
    const result = getCueWindow(cues, 5)

    expect(result.map((cue) => cue.id)).toEqual([
      'cue-2',
      'cue-3',
      'cue-4',
      'cue-5',
      'cue-6',
      'cue-7',
      'cue-8',
    ])
  })

  it('handles the beginning of an episode', () => {
    const result = getCueWindow(cues, 0)

    expect(result.map((cue) => cue.id)).toEqual(['cue-0', 'cue-1', 'cue-2', 'cue-3'])
  })

  it('handles the end of an episode', () => {
    const result = getCueWindow(cues, 9)

    expect(result.map((cue) => cue.id)).toEqual(['cue-6', 'cue-7', 'cue-8', 'cue-9'])
  })

  it('handles episodes with fewer than seven cues', () => {
    const result = getCueWindow(cues.slice(0, 2), 1)

    expect(result.map((cue) => cue.id)).toEqual(['cue-0', 'cue-1'])
  })

  it('returns an empty array when center index is null', () => {
    expect(getCueWindow(cues, null)).toEqual([])
  })

  it('returns an empty array for an empty episode', () => {
    expect(getCueWindow([], null)).toEqual([])
  })

  it('does not modify the original array', () => {
    const originalIds = cues.map((cue) => cue.id)

    getCueWindow(cues, 5)

    expect(cues.map((cue) => cue.id)).toEqual(originalIds)
  })

  it('treats negative counts as zero', () => {
    const result = getCueWindow(cues, 5, -2, 1)

    expect(result.map((cue) => cue.id)).toEqual(['cue-5', 'cue-6'])
  })

  it('rounds fractional counts down to integers', () => {
    const result = getCueWindow(cues, 5, 2.7, 1.9)

    expect(result.map((cue) => cue.id)).toEqual(['cue-3', 'cue-4', 'cue-5', 'cue-6'])
  })

  it('treats non-finite counts as zero', () => {
    const result = getCueWindow(cues, 5, NaN, Infinity)

    expect(result.map((cue) => cue.id)).toEqual(['cue-5'])
  })
})

describe('searchCuesByText', () => {
  const cues: Cue[] = [
    {
      id: 'cue-1',
      startMs: 3000,
      endMs: 7000,
      text: "I'm really looking forward to it.",
    },
    {
      id: 'cue-2',
      startMs: 10000,
      endMs: 13000,
      text: 'We have something to look forward to.',
    },
    {
      id: 'cue-3',
      startMs: 17000,
      endMs: 21000,
      text: 'Nothing similar here.',
    },
    {
      id: 'cue-4',
      startMs: 25000,
      endMs: 29000,
      text: 'LOOK FORWARD to tomorrow.',
    },
  ]

  it('finds cues containing the query', () => {
    const result = searchCuesByText(cues, 'look forward')

    expect(result.map((cue) => cue.id)).toEqual(['cue-2', 'cue-4'])
  })

  it('ignores letter case', () => {
    const result = searchCuesByText(cues, 'LOOK FORWARD')

    expect(result.map((cue) => cue.id)).toEqual(['cue-2', 'cue-4'])
  })

  it('matches partial text', () => {
    const result = searchCuesByText(cues, 'forward')

    expect(result.map((cue) => cue.id)).toEqual(['cue-1', 'cue-2', 'cue-4'])
  })

  it('ignores surrounding whitespace in the query', () => {
    const result = searchCuesByText(cues, '  look forward  ')

    expect(result.map((cue) => cue.id)).toEqual(['cue-2', 'cue-4'])
  })

  it('returns an empty array for an empty or whitespace-only query', () => {
    expect(searchCuesByText(cues, '')).toEqual([])
    expect(searchCuesByText(cues, '   ')).toEqual([])
  })

  it('returns an empty array when nothing matches', () => {
    expect(searchCuesByText(cues, 'good morning')).toEqual([])
  })

  it('returns an empty array for an episode without cues', () => {
    expect(searchCuesByText([], 'forward')).toEqual([])
  })

  it('preserves the original cue order and data', () => {
    const result = searchCuesByText(cues, 'forward')

    expect(result).toEqual([cues[0], cues[1], cues[3]])
    expect(result[0]).toBe(cues[0])
    expect(result[0].startMs).toBe(3000)
  })

  it('does not modify the original cue array', () => {
    const originalCues = [...cues]

    searchCuesByText(cues, 'forward')

    expect(cues).toEqual(originalCues)
  })
})
