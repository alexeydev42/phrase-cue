const allowedOrigins = ['https://alexeydev42.com', 'http://localhost:5173']

export default {
  async fetch(request: Request) {
    const origin = request.headers.get('origin')
    const isAllowedOrigin = origin !== null && allowedOrigins.includes(origin)

    const corsHeaders = new Headers({
      Vary: 'Origin',
    })

    if (isAllowedOrigin && origin !== null) {
      corsHeaders.set('Access-Control-Allow-Origin', origin)
    }

    const jsonResponse = (data: unknown, status = 200) =>
      Response.json(data, {
        status,
        headers: corsHeaders,
      })

    if (request.method === 'OPTIONS') {
      if (!isAllowedOrigin || origin === null) {
        return new Response(null, {
          status: 403,
          headers: corsHeaders,
        })
      }

      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '600',
          Vary: 'Origin',
        },
      })
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders,
      })
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400)
    }

    if (
      typeof body !== 'object' ||
      body === null ||
      !('text' in body) ||
      typeof body.text !== 'string'
    ) {
      return jsonResponse({ error: 'Invalid text' }, 400)
    }

    const text = body.text.trim()

    if (text.length === 0) {
      return jsonResponse({ error: 'Text is empty' }, 400)
    }

    if (text.length > 300) {
      return jsonResponse({ error: 'Text exceeds 300 characters' }, 400)
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

    if (!apiKey) {
      return jsonResponse({ error: 'Translation API key is missing' }, 500)
    }

    let googleResponse: Response

    try {
      googleResponse = await fetch('https://translation.googleapis.com/language/translate/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: 'ru',
          format: 'text',
        }),
        signal: AbortSignal.timeout(10_000),
      })
    } catch {
      return jsonResponse({ error: 'Translation request failed' }, 502)
    }

    if (!googleResponse.ok) {
      return jsonResponse({ error: 'Translation provider unavailable' }, 502)
    }

    let result: unknown

    try {
      result = await googleResponse.json()
    } catch {
      return jsonResponse({ error: 'Invalid translation response' }, 502)
    }

    if (
      typeof result !== 'object' ||
      result === null ||
      !('data' in result) ||
      typeof result.data !== 'object' ||
      result.data === null ||
      !('translations' in result.data) ||
      !Array.isArray(result.data.translations)
    ) {
      return jsonResponse({ error: 'Invalid translation response' }, 502)
    }

    const translation = result.data.translations[0]?.translatedText

    if (typeof translation !== 'string' || translation.trim() === '') {
      return jsonResponse({ error: 'Invalid translation response' }, 502)
    }

    return jsonResponse({ translation })
  },
}
