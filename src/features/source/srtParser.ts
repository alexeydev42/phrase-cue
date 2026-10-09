export interface ParsedCue {
  startMs: number
  endMs: number
  text: string
}

export type SrtParseResult =
  | {
    ok: true
    cues: ParsedCue[]
    skippedCount: number
  }
  | {
    ok: false
    error: 'invalid-srt'
  }

const parseTimestamp = (timestamp: string): number | null => {
  const match = timestamp
    .trim()
    .match(/^(\d+):([0-5]\d):([0-5]\d),(\d{3})$/)

  if (!match) {
    return null
  }

  const [, hours, minutes, seconds, milliseconds] = match.map(Number)

  return (
    hours * 60 * 60 * 1000 +
    minutes * 60 * 1000 +
    seconds * 1000 +
    milliseconds
  )
}

interface ParsedTimeRange {
  startMs: number
  endMs: number
}

const parseTimeRange = (line: string): ParsedTimeRange | null => {
  const parts = line.split('-->')

  if (parts.length !== 2) {
    return null
  }

  const startMs = parseTimestamp(parts[0])
  const endMs = parseTimestamp(parts[1])

  if (startMs === null || endMs === null) {
    return null
  }

  if (endMs <= startMs) {
    return null
  }

  return {
    startMs,
    endMs,
  }
}

const parseCueBlock = (block: string): ParsedCue | null => {
  const lines = block.trim().split(/\r?\n/)

  if (lines.length < 3) {
    return null
  }

  const timeRange = parseTimeRange(lines[1])

  if (!timeRange) {
    return null
  }

  const text = lines.slice(2).join('\n').trim()

  if (!text) {
    return null
  }

  return {
    startMs: timeRange.startMs,
    endMs: timeRange.endMs,
    text,
  }
}

export const parseSrt = (srt: string): SrtParseResult => {
  const blocks = srt.trim().split(/\r?\n\s*\r?\n/)

  if (!srt.trim()) {
    return {
      ok: false,
      error: 'invalid-srt',
    }
  }

  const cues: ParsedCue[] = []
  let skippedCount = 0

  for (const block of blocks) {
    const cue = parseCueBlock(block)

    if (!cue) {
      skippedCount += 1
      continue
    }

    cues.push(cue)
  }

  if (cues.length === 0) {
    return {
      ok: false,
      error: 'invalid-srt',
    }
  }

  cues.sort((a, b) => a.startMs - b.startMs)

  return {
    ok: true,
    cues,
    skippedCount,
  }
}