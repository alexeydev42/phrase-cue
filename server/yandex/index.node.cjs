const test = require('node:test')
const assert = require('node:assert/strict')
const { handler } = require('./index.js')

const allowedOrigin = 'https://alexeydev42.com'

const request = (text = 'Hello') => ({
  httpMethod: 'POST',
  headers: {
    origin: allowedOrigin,
    'content-type': 'application/json',
  },
  body: JSON.stringify({ text }),
  isBase64Encoded: false,
})

test('GET returns the health check without contacting Google', async () => {
  const response = await handler({ httpMethod: 'GET', headers: {} })
  assert.equal(response.statusCode, 200)
  assert.deepEqual(JSON.parse(response.body), { ok: true })
})

test('OPTIONS permits the configured origin', async () => {
  const response = await handler({
    httpMethod: 'OPTIONS',
    headers: { origin: allowedOrigin },
  })
  assert.equal(response.statusCode, 204)
  assert.equal(response.headers['Access-Control-Allow-Origin'], allowedOrigin)
  assert.equal(response.headers['Access-Control-Allow-Methods'], 'POST')
})

test('POST rejects requests from another origin', async () => {
  const response = await handler({
    ...request(),
    headers: { origin: 'https://unknown.example', 'content-type': 'application/json' },
  })
  assert.equal(response.statusCode, 403)
})

test('POST rejects invalid JSON, oversized text, and unsupported content type', async () => {
  const badJson = await handler({ ...request(), body: '{invalid' })
  const longText = await handler(request('a'.repeat(301)))
  const wrongType = await handler({
    ...request(),
    headers: { origin: allowedOrigin, 'content-type': 'text/plain' },
  })

  assert.equal(badJson.statusCode, 400)
  assert.equal(longText.statusCode, 400)
  assert.equal(wrongType.statusCode, 415)
})

test('POST calls Google and returns the translated text', async (t) => {
  const previousKey = process.env.GOOGLE_TRANSLATE_API_KEY
  process.env.GOOGLE_TRANSLATE_API_KEY = 'fake-key-for-test'
  t.after(() => {
    if (previousKey === undefined) delete process.env.GOOGLE_TRANSLATE_API_KEY
    else process.env.GOOGLE_TRANSLATE_API_KEY = previousKey
  })

  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://translation.googleapis.com/language/translate/v2')
    assert.equal(options.headers['x-goog-api-key'], 'fake-key-for-test')
    assert.equal(JSON.parse(options.body).q, 'Hello')
    return Response.json({ data: { translations: [{ translatedText: 'Привет' }] } })
  })

  const response = await handler(request())
  assert.equal(response.statusCode, 200)
  assert.deepEqual(JSON.parse(response.body), { translation: 'Привет' })
  assert.match(response.headers['Content-Type'], /charset=utf-8/)
  assert.equal(fetchMock.mock.callCount(), 1)
})

test('Google rate limiting is forwarded as HTTP 429', async (t) => {
  const previousKey = process.env.GOOGLE_TRANSLATE_API_KEY
  process.env.GOOGLE_TRANSLATE_API_KEY = 'fake-key-for-test'
  t.after(() => {
    if (previousKey === undefined) delete process.env.GOOGLE_TRANSLATE_API_KEY
    else process.env.GOOGLE_TRANSLATE_API_KEY = previousKey
  })

  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 429 }))
  const response = await handler(request())
  assert.equal(response.statusCode, 429)
})

test('Google errors are returned as HTTP 502 without exposing details', async (t) => {
  const previousKey = process.env.GOOGLE_TRANSLATE_API_KEY
  process.env.GOOGLE_TRANSLATE_API_KEY = 'fake-key-for-test'
  t.after(() => {
    if (previousKey === undefined) delete process.env.GOOGLE_TRANSLATE_API_KEY
    else process.env.GOOGLE_TRANSLATE_API_KEY = previousKey
  })

  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Sensitive internal error')
  })
  const response = await handler(request())
  assert.equal(response.statusCode, 502)
  assert.doesNotMatch(response.body, /Sensitive internal error/)
})
