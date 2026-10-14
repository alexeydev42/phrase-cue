import type { Cue } from './sourceTypes'

export const findNearestCueIndex = (cues: Cue[], targetMs: number): number | null => {
  let nearestIndex: number | null = null
  let minDistance = Infinity

  cues.forEach((cue, index) => {
    let distance = 0
    if (targetMs < cue.startMs) {
      distance = cue.startMs - targetMs
    } else if (targetMs > cue.endMs) {
      distance = targetMs - cue.endMs
    }
    if (distance < minDistance) {
      minDistance = distance
      nearestIndex = index
    }
  })
  return nearestIndex
}

const normalizeCount = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.floor(value))
}

export const getCueWindow = (
  cues: Cue[],
  centerIndex: number | null,
  beforeCount = 3,
  afterCount = 3,
): Cue[] => {
  if (centerIndex === null) {
    return []
  }
  const start = Math.max(0, centerIndex - normalizeCount(beforeCount))
  const end = Math.min(cues.length, centerIndex + normalizeCount(afterCount) + 1)
  return cues.slice(start, end)
}
