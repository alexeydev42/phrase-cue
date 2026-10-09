import { describe, expect, it } from 'vitest'
import { parseSrt } from './srtParser'

describe('parseSrt', () => {
  it('parses a valid SRT file', () => {
    const srt = `1
00:00:01,500 --> 00:00:03,200
Hello.

2
00:00:04,000 --> 00:00:06,100
How are you?
I'm fine.`

    const result = parseSrt(srt)
    const expectedResult = {
      ok: true,
      cues: [
        {
          startMs: 1500,
          endMs: 3200,
          text: 'Hello.',
        },
        {
          startMs: 4000,
          endMs: 6100,
          text: 'How are you?\nI\'m fine.',
        },
      ],
      skippedCount: 0,
    }

    expect(result).toEqual(expectedResult)
  })

  it('skips invalid cues and keeps valid ones', () => {
    const srt = `1
00:00:01,500 --> 00:00:03,200
Hello.

2
invalid timecode
Broken cue.

3
00:00:07,000 --> 00:00:09,500
Goodbye.`

    const result = parseSrt(srt)

    const expectedResult = {
      ok: true,
      cues: [
        {
          startMs: 1500,
          endMs: 3200,
          text: 'Hello.',
        },
        {
          startMs: 7000,
          endMs: 9500,
          text: 'Goodbye.',
        },
      ],
      skippedCount: 1,
    }

    expect(result).toEqual(expectedResult)
  })

  it('returns an error when no valid cues can be parsed', () => {
    const srt = `1
invalid timecode
Broken cue.

2
also invalid
Another broken cue.`

    const result = parseSrt(srt)

    expect(result).toEqual({
      ok: false,
      error: 'invalid-srt',
    })
  })

  it('sorts parsed cues by start time', () => {
    const srt = `1
00:00:07,000 --> 00:00:09,000
Third

2
00:00:01,000 --> 00:00:03,000
First

3
00:00:04,000 --> 00:00:06,000
Second`

    const result = parseSrt(srt)

    expect(result).toEqual({
      ok: true,
      cues: [
        {
          startMs: 1000,
          endMs: 3000,
          text: 'First',
        },
        {
          startMs: 4000,
          endMs: 6000,
          text: 'Second',
        },
        {
          startMs: 7000,
          endMs: 9000,
          text: 'Third',
        },
      ],
      skippedCount: 0,
    })
  })

  it('parses SRT with Windows line endings', () => {
    const srt =
      '1\r\n' +
      '00:00:01,500 --> 00:00:03,200\r\n' +
      'Hello.\r\n' +
      '\r\n' +
      '2\r\n' +
      '00:00:04,000 --> 00:00:06,100\r\n' +
      'How are you?'

    const result = parseSrt(srt)

    expect(result).toEqual({
      ok: true,
      cues: [
        {
          startMs: 1500,
          endMs: 3200,
          text: 'Hello.',
        },
        {
          startMs: 4000,
          endMs: 6100,
          text: 'How are you?',
        },
      ],
      skippedCount: 0,
    })
  })

  it('skips a cue when end time is not after start time', () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
Valid cue.

2
00:00:05,000 --> 00:00:03,000
Broken time range.

3
00:00:07,000 --> 00:00:09,000
Another valid cue.`

    const result = parseSrt(srt)

    expect(result).toEqual({
      ok: true,
      cues: [
        {
          startMs: 1000,
          endMs: 3000,
          text: 'Valid cue.',
        },
        {
          startMs: 7000,
          endMs: 9000,
          text: 'Another valid cue.',
        },
      ],
      skippedCount: 1,
    })
  })

  it('returns an error for an empty SRT file', () => {
    const result = parseSrt('')

    expect(result).toEqual({
      ok: false,
      error: 'invalid-srt',
    })
    expect(parseSrt('   \n\n   ')).toEqual({
      ok: false,
      error: 'invalid-srt',
    })
  })

  it('skips a cue without text', () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
Valid cue.

2
00:00:04,000 --> 00:00:06,000

3
00:00:07,000 --> 00:00:09,000
Another valid cue.`

    const result = parseSrt(srt)

    expect(result).toEqual({
      ok: true,
      cues: [
        {
          startMs: 1000,
          endMs: 3000,
          text: 'Valid cue.',
        },
        {
          startMs: 7000,
          endMs: 9000,
          text: 'Another valid cue.',
        },
      ],
      skippedCount: 1,
    })
  })
})