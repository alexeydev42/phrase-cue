export const translatePhrase = async (text: string): Promise<string> => {
  const url = import.meta.env.VITE_TRANSLATION_API_URL

  if (!url) {
    throw new Error('Translation API URL is not configured')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(20_000),
  })

  if (!response.ok) {
    throw new Error(`Translation request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (
    typeof data !== 'object' ||
    data === null ||
    !('translation' in data) ||
    typeof data.translation !== 'string'
  ) {
    throw new Error('Invalid translation response')
  }

  return data.translation
}
