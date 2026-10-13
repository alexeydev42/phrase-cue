import { describe, expect, it } from 'vitest'
import { store, type RootState } from '../../app/store'
import { selectCueWindow } from './cueSelectors'
import type { Cue } from './sourceTypes'

describe('selectCueWindow', () => {
  const cues: Cue[] = Array.from({ length: 10 }, (_, index) => ({
    id: `cue-${index}`,
    startMs: index * 5000,
    endMs: index * 5000 + 3000,
    text: `Cue ${index}`,
  }))

  const state: RootState = {
    ...store.getState(),
    source: {
      activeEpisodeId: 'episode-1',
      shows: [
        {
          id: 'show-1',
          title: 'Test Show',
          seasons: [
            {
              id: 'season-1',
              number: 1,
              episodes: [
                {
                  id: 'episode-1',
                  number: 1,
                  cues,
                },
              ],
            },
          ],
        },
      ],
    },
  }

  it('returns cues around the target timecode', () => {
    const result = selectCueWindow(state, 26000)

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

  it('handles the beginning of the episode', () => {
    const result = selectCueWindow(state, 0)

    expect(result.map((cue) => cue.id)).toEqual(['cue-0', 'cue-1', 'cue-2', 'cue-3'])
  })

  it('handles the end of the episode', () => {
    const result = selectCueWindow(state, 100000)

    expect(result.map((cue) => cue.id)).toEqual(['cue-6', 'cue-7', 'cue-8', 'cue-9'])
  })

  it('returns an empty array when the timecode is null', () => {
    expect(selectCueWindow(state, null)).toEqual([])
  })

  it('returns an empty array when there is no active episode', () => {
    const stateWithoutActiveEpisode: RootState = {
      ...state,
      source: {
        ...state.source,
        activeEpisodeId: null,
      },
    }

    expect(selectCueWindow(stateWithoutActiveEpisode, 26000)).toEqual([])
  })

  it('reuses the cached result for unchanged inputs', () => {
    const firstResult = selectCueWindow(state, 26000)
    const secondResult = selectCueWindow(state, 26000)

    expect(secondResult).toBe(firstResult)
  })

  it('reuses the result when unrelated state changes', () => {
    const firstResult = selectCueWindow(state, 26000)

    const updatedState: RootState = {
      ...state,
      settings: {
        ...state.settings,
      },
    }

    const secondResult = selectCueWindow(updatedState, 26000)

    expect(secondResult).toBe(firstResult)
  })

  it('expands the cue window forward', () => {
    const result = selectCueWindow(state, 26000, 3, 5)

    expect(result.map((cue) => cue.id)).toEqual([
      'cue-2',
      'cue-3',
      'cue-4',
      'cue-5',
      'cue-6',
      'cue-7',
      'cue-8',
      'cue-9',
    ])
  })

  it('expands the cue window backward', () => {
    const result = selectCueWindow(state, 26000, 5, 3)

    expect(result.map((cue) => cue.id)).toEqual([
      'cue-0',
      'cue-1',
      'cue-2',
      'cue-3',
      'cue-4',
      'cue-5',
      'cue-6',
      'cue-7',
      'cue-8',
    ])
  })

  it('returns only the center cue when both counts are zero', () => {
    const result = selectCueWindow(state, 26000, 0, 0)

    expect(result.map((cue) => cue.id)).toEqual(['cue-5'])
  })

  it('recalculates when the window size changes', () => {
    const initialResult = selectCueWindow(state, 26000, 3, 3)
    const expandedResult = selectCueWindow(state, 26000, 3, 5)
    const repeatedResult = selectCueWindow(state, 26000, 3, 5)

    expect(expandedResult).not.toBe(initialResult)
    expect(repeatedResult).toBe(expandedResult)
  })
})
