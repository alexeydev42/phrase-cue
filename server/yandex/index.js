const allowedOrigins = [
  'https://alexeydev42.com',
  'https://alexeydev42.github.io',
  'http://localhost:5173',
]

const getHeader = (headers, name) => {
  const entry = Object.entries(headers || {}).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  )

  return entry?.[1]
}

module.exports.handler = async function (event) {
  const origin = getHeader(event.headers, 'origin')
  const isAllowedOrigin = allowedOrigins.includes(origin)

  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Origin',
    ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
  }

  const respond = (statusCode, data) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(data),
  })

  if (event.httpMethod === 'GET') {
    return respond(200, { ok: true })
  }

  if (event.httpMethod === 'OPTIONS') {
    if (!isAllowedOrigin) {
      return respond(403, { error: 'Forbidden origin' })
    }

    return {
      statusCode: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  if (!isAllowedOrigin) {
    return respond(403, { error: 'Forbidden origin' })
  }

  const contentType = getHeader(event.headers, 'content-type')

  if (!/^application\/json(?:\s*;|$)/i.test(contentType ?? '')) {
    return respond(415, { error: 'Unsupported media type' })
  }

  if (typeof event.body !== 'string' || event.body.length > 4096) {
    return respond(413, { error: 'Request body is too large' })
  }

  let body

  try {
    if (event.isBase64Encoded) {
      throw new Error('Invalid body')
    }

    body = JSON.parse(event.body)
  } catch {
    return respond(400, { error: 'Invalid JSON' })
  }

  if (typeof body?.text !== 'string') {
    return respond(400, { error: 'Invalid text' })
  }

  const text = body.text.trim()

  if (!text || text.length > 300) {
    return respond(400, { error: 'Text must be 1–300 characters' })
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

  if (!apiKey) {
    return respond(500, { error: 'API key is not configured' })
  }

  try {
    const googleResponse = await fetch('https://translation.googleapis.com/language/translate/v2', {
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
      signal: AbortSignal.timeout(9_000),
    })

    if (googleResponse.status === 429) {
      return respond(429, { error: 'Translation provider rate limit' })
    }

    if (!googleResponse.ok) {
      return respond(502, { error: 'Translation provider unavailable' })
    }

    const result = await googleResponse.json()
    const translation = result?.data?.translations?.[0]?.translatedText

    if (typeof translation !== 'string' || !translation.trim()) {
      return respond(502, { error: 'Invalid translation response' })
    }

    return respond(200, { translation })
  } catch {
    return respond(502, { error: 'Translation request failed' })
  }
}
