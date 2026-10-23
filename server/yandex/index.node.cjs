const test = require('node:test');
const assert = require('node:assert/strict');
const limiter = require('./rateLimiter.js');
const { handler } = require('./index.js');
const origin = 'https://alexeydev42.com';

const request = (text = 'Hello') => ({
  httpMethod: 'POST',
  headers: { origin, 'content-type': 'application/json' },
  requestContext: { identity: { sourceIp: '198.51.100.1' } },
  body: JSON.stringify({ text }),
  isBase64Encoded: false,
});

const withKey = (t) => {
  const oldKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  process.env.GOOGLE_TRANSLATE_API_KEY = 'test-key';
  t.after(() => {
    if (oldKey === undefined) delete process.env.GOOGLE_TRANSLATE_API_KEY;
    else process.env.GOOGLE_TRANSLATE_API_KEY = oldKey;
  });
};

test('GET health check does not query the database or Google', async (t) => {
  const mock = t.mock.method(limiter, 'allowRequest', async () => { throw Error('unreachable'); });
  const response = await handler({ httpMethod: 'GET', headers: {} });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { ok: true });
  assert.equal(mock.mock.callCount(), 0);
});

test('OPTIONS supports the approved origin', async () => {
  const response = await handler({ httpMethod: 'OPTIONS', headers: { origin } });
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers['Access-Control-Allow-Origin'], origin);
});

test('invalid requests are rejected before rate-limit operations', async (t) => {
  const mock = t.mock.method(limiter, 'allowRequest', async () => true);
  assert.equal((await handler({ ...request(), headers: { origin: 'https://wrong.example', 'content-type': 'application/json' } })).statusCode, 403);
  assert.equal((await handler({ ...request(), body: '{bad' })).statusCode, 400);
  assert.equal((await handler(request('x'.repeat(301)))).statusCode, 400);
  assert.equal(mock.mock.callCount(), 0);
});

test('approved POST checks the limit before calling Google', async (t) => {
  withKey(t);
  const check = t.mock.method(limiter, 'allowRequest', async (ip) => {
    assert.equal(ip, '198.51.100.1');
    return true;
  });
  const google = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://translation.googleapis.com/language/translate/v2');
    assert.equal(options.headers['x-goog-api-key'], 'test-key');
    assert.equal(check.mock.callCount(), 1);
    return Response.json({ data: { translations: [{ translatedText: 'Привет' }] } });
  });
  const response = await handler(request());
  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { translation: 'Привет' });
  assert.equal(google.mock.callCount(), 1);
});

test('429 prevents any Google request', async (t) => {
  withKey(t);
  t.mock.method(limiter, 'allowRequest', async () => false);
  const google = t.mock.method(globalThis, 'fetch', async () => { throw Error('should not fetch'); });
  const response = await handler(request());
  assert.equal(response.statusCode, 429);
  assert.equal(google.mock.callCount(), 0);
});

test('YDB outage rejects the request before Google', async (t) => {
  withKey(t);
  t.mock.method(limiter, 'allowRequest', async () => { throw Error('DB failed'); });
  const google = t.mock.method(globalThis, 'fetch', async () => { throw Error('should not fetch'); });
  const errorLog = t.mock.method(console, 'error', () => {});
  const response = await handler(request());
  assert.equal(response.statusCode, 503);
  assert.equal(google.mock.callCount(), 0);
  assert.equal(errorLog.mock.callCount(), 1);
  assert.doesNotMatch(response.body, /DB failed/);
});

test('missing source IP rejects the request before Google', async (t) => {
  withKey(t);
  const check = t.mock.method(limiter, 'allowRequest', async () => true);
  const google = t.mock.method(globalThis, 'fetch', async () => { throw Error('should not fetch'); });
  const response = await handler({ ...request(), requestContext: undefined, headers: { ...request().headers, 'x-forwarded-for': '8.8.8.8' } });
  assert.equal(response.statusCode, 503);
  assert.equal(check.mock.callCount(), 0);
  assert.equal(google.mock.callCount(), 0);
});

test('provider 429 remains 429, and other Google failures return 502', async (t) => {
  withKey(t);
  t.mock.method(limiter, 'allowRequest', async () => true);
  const google = t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 429 }));
  assert.equal((await handler(request())).statusCode, 429);
  google.mock.mockImplementation(async () => { throw Error('not connected'); });
  assert.equal((await handler(request())).statusCode, 502);
});
