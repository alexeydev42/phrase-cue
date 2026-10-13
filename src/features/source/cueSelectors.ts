import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { findNearestCueIndex, getCueWindow } from './cueSearch'
import { selectActiveEpisode } from './sourceSlice'
import type { Cue } from './sourceTypes'

const EMPTY_CUES: Cue[] = []

export const selectActiveEpisodeCues = (state: RootState): Cue[] =>
  selectActiveEpisode(state)?.cues ?? EMPTY_CUES

const selectTargetMs = (_state: RootState, targetMs: number | null) => targetMs

const selectBeforeCount = (_state: RootState, _targetMs: number | null, beforeCount = 3) =>
  beforeCount

const selectAfterCount = (...args: [RootState, number | null, number?, number?]) => args[3] ?? 3

export const selectCueWindow = createSelector(
  [selectActiveEpisodeCues, selectTargetMs, selectBeforeCount, selectAfterCount],
  (cues, targetMs, beforeCount, afterCount): Cue[] => {
    if (targetMs === null) {
      return []
    }

    const nearestIndex = findNearestCueIndex(cues, targetMs)

    return getCueWindow(cues, nearestIndex, beforeCount, afterCount)
  },
)
