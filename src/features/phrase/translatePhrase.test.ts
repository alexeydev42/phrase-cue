import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { translatePhrase, TranslationLimitError } from './translatePhrase'

const yandexUrl = 'https://functions.yandexcloud.net/test-function'
const vercelUrl = 'https://phrase-cue-api.vercel.app/api/translate'

beforeEach(() => {
  vi.stubEnv('VITE_TRANSLATION_API_URL', yandexUrl)
  vi.stubEnv('VITE_TRANSLATION_FALLBACK_API_URL', vercelUrl)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('translatePhrase', () => {
  it('uses Yandex Cloud first when translation succeeds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ translation: 'Привет!' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).resolves.toBe('Привет!')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(yandexUrl)
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ text: 'Hello!' }),
    })
  })

  it('tries Vercel after a network error', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(Response.json({ translation: 'Привет!' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).resolves.toBe('Привет!')
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([yandexUrl, vercelUrl])
  })

  it('tries Vercel after a timeout', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new DOMException('Timed out', 'TimeoutError'))
      .mockResolvedValueOnce(Response.json({ translation: 'Привет!' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).resolves.toBe('Привет!')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each([408, 502, 503])('tries Vercel after HTTP %i', async (status) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ error: 'Unavailable' }, { status }))
      .mockResolvedValueOnce(Response.json({ translation: 'Привет!' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).resolves.toBe('Привет!')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each([400, 403, 429])('does not retry HTTP %i through Vercel', async (status) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ error: 'Request rejected' }, { status }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).rejects.toThrow(String(status))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('tries Vercel when the Yandex response is malformed', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ result: 'Wrong response shape' }))
      .mockResolvedValueOnce(Response.json({ translation: 'Привет!' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).resolves.toBe('Привет!')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('fails when both endpoints fail', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Yandex unreachable'))
      .mockRejectedValueOnce(new TypeError('Vercel unreachable'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).rejects.toThrow('Vercel unreachable')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('still works with only the primary endpoint configured', async () => {
    vi.stubEnv('VITE_TRANSLATION_FALLBACK_API_URL', '')
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ translation: 'Привет!' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).resolves.toBe('Привет!')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not call the same endpoint twice', async () => {
    vi.stubEnv('VITE_TRANSLATION_FALLBACK_API_URL', yandexUrl)
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Unavailable'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).rejects.toThrow('Unavailable')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('fails clearly when the primary endpoint is not configured', async () => {
    vi.stubEnv('VITE_TRANSLATION_API_URL', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).rejects.toThrow('not configured')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports rate limit errors without using fallback', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: 'Translation rate limit exceeded' }, { status: 429 }),
      )

    vi.stubGlobal('fetch', fetchMock)

    await expect(translatePhrase('Hello!')).rejects.toBeInstanceOf(TranslationLimitError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
