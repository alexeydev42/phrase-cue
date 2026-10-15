import { describe, expect, it } from 'vitest'
import { normalizePhraseDraft } from './normalizePhraseDraft'

describe('normalizePhraseDraft', () => {
  it('replaces line breaks with spaces', () => {
    const text = "Hello,\nhow are you?\nI'm fine."
    const result = normalizePhraseDraft(text)

    expect(result).toBe("Hello, how are you? I'm fine.")
  })

  it('replaces Windows and old Mac line breaks with spaces', () => {
    const text = "Hello,\r\nhow are you?\rI'm fine."
    const result = normalizePhraseDraft(text)

    expect(result).toBe("Hello, how are you? I'm fine.")
  })

  it('replaces repeated spaces with single spaces', () => {
    const text = "Hello,   how are you? I'm     fine."
    const result = normalizePhraseDraft(text)

    expect(result).toBe("Hello, how are you? I'm fine.")
  })

  it('preserves text without extra whitespace', () => {
    const text = "Hello, how are you? I'm fine."
    const result = normalizePhraseDraft(text)

    expect(result).toBe("Hello, how are you? I'm fine.")
  })
})
