import { describe, expect, it } from 'vitest'
import { parseTimecode } from './timecode'

describe('parseTimecode', () => {
  it('parses MM:SS timecode', () => {
    expect(parseTimecode('18:42')).toBe(1122000)
    expect(parseTimecode('00:00')).toBe(0)
    expect(parseTimecode('75:30')).toBe(4530000)
  })

  it('parses HH:MM:SS timecode', () => {
    expect(parseTimecode('01:18:42')).toBe(4722000)
    expect(parseTimecode('01:02:03')).toBe(3723000)
  })

  it('accepts single-digit components and surrounding spaces', () => {
    expect(parseTimecode('1:2')).toBe(62000)
    expect(parseTimecode(' 18:42 ')).toBe(1122000)
  })

  it('rejects invalid seconds', () => {
    expect(parseTimecode('18:92')).toBeNull()
    expect(parseTimecode('18:60')).toBeNull()
    expect(parseTimecode('01:18:60')).toBeNull()
  })

  it('rejects invalid minutes in HH:MM:SS format', () => {
    expect(parseTimecode('01:75:30')).toBeNull()
    expect(parseTimecode('01:60:00')).toBeNull()
  })

  it('rejects malformed timecodes', () => {
    const invalidValues = [
      '',
      '   ',
      'abc',
      '18',
      '12::30',
      '01:02:03:04',
      '18:xx',
      '-1:20',
      '1: 20',
      '1.5:30',
    ]

    invalidValues.forEach((value) => {
      expect(parseTimecode(value)).toBeNull()
    })
  })

  it('rejects results outside the safe integer range', () => {
    expect(parseTimecode('999999999999:00')).toBeNull()
    expect(parseTimecode('999999999999:00:00')).toBeNull()
  })
})
