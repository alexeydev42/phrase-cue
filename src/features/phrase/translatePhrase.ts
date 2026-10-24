class NonRetryableTranslationError extends Error {}
export class TranslationLimitError extends NonRetryableTranslationError {}

const REQUEST_TIMEOUT_MS = 12_000

const requestTranslation = async (url: string, text: string): Promise<string> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    const message = `Translation request failed: ${response.status}`

    if (response.status === 429) {
      throw new TranslationLimitError(message)
    }

    if (response.status < 500 && response.status !== 408) {
      throw new NonRetryableTranslationError(message)
    }

    throw new Error(message)
  }

  const data: unknown = await response.json()

  if (
    typeof data !== 'object' ||
    data === null ||
    !('translation' in data) ||
    typeof data.translation !== 'string' ||
    data.translation.trim() === ''
  ) {
    throw new Error('Invalid translation response')
  }

  return data.translation
}

export const translatePhrase = async (text: string): Promise<string> => {
  const primaryUrl = import.meta.env.VITE_TRANSLATION_API_URL?.trim()
  const fallbackUrl = import.meta.env.VITE_TRANSLATION_FALLBACK_API_URL?.trim()

  if (!primaryUrl) {
    throw new Error('Translation API URL is not configured')
  }

  const urls = fallbackUrl && fallbackUrl !== primaryUrl ? [primaryUrl, fallbackUrl] : [primaryUrl]

  for (const [index, url] of urls.entries()) {
    try {
      return await requestTranslation(url, text)
    } catch (error) {
      if (error instanceof NonRetryableTranslationError || index === urls.length - 1) {
        throw error
      }
    }
  }

  throw new Error('Translation unavailable')
}
