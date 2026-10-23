const test = require('node:test');
const assert = require('node:assert/strict');
const { consumeWithStore, getSlots } = require('./rateLimiter.js');

function memoryStore() {
  const counts = new Map();
  return {
    async checkAndIncrement({ ipSlot, dailySlot, maxPerIp, maxPerDay }) {
      const ipKey = `${ipSlot.scope}:${ipSlot.slot}`;
      const dailyKey = `${dailySlot.scope}:${dailySlot.slot}`;
      const count = counts.get(ipKey) ?? 0;
      const globalCount = counts.get(dailyKey) ?? 0;
      if (count >= maxPerIp || globalCount >= maxPerDay) return false;
      counts.set(ipKey, count + 1);
      counts.set(dailyKey, globalCount + 1);
      return true;
    },
  };
}

const time = Date.parse('2026-10-23T12:00:00Z');

test('allows five requests from one IP then rejects the sixth', async () => {
  const store = memoryStore();
  for (let i = 0; i < 5; i++) {
    assert.equal(await consumeWithStore(store, '198.51.100.1', time), true);
  }
  assert.equal(await consumeWithStore(store, '198.51.100.1', time), false);
});

test('another IP gets its own allowance, and the window resets', async () => {
  const store = memoryStore();
  for (let i = 0; i < 5; i++) await consumeWithStore(store, '198.51.100.1', time);
  assert.equal(await consumeWithStore(store, '198.51.100.2', time), true);
  assert.equal(await consumeWithStore(store, '198.51.100.1', time + 10 * 60 * 1000), true);
});

test('the total daily allowance is shared across IP addresses', async () => {
  const store = memoryStore();
  for (let i = 0; i < 40; i++) {
    assert.equal(await consumeWithStore(store, `198.51.100.${i + 1}`, time), true);
  }
  assert.equal(await consumeWithStore(store, '203.0.113.1', time), false);
  assert.equal(await consumeWithStore(store, '203.0.113.1', time + 24 * 60 * 60 * 1000), true);
});

test('does not write either counter for a rejected request', async () => {
  const store = memoryStore();
  for (let i = 0; i < 5; i++) await consumeWithStore(store, '198.51.100.10', time);
  assert.equal(await consumeWithStore(store, '198.51.100.10', time), false);
  // The denied request must not consume a slot in the shared daily counter.
  for (let i = 0; i < 35; i++) {
    assert.equal(await consumeWithStore(store, `203.0.113.${i + 1}`, time), true);
  }
  assert.equal(await consumeWithStore(store, '203.0.113.99', time), false);
});

test('does not store raw IP addresses in counter keys', () => {
  const { ip } = getSlots('198.51.100.10', time);
  assert.equal(ip.scope, 'ip');
  assert.doesNotMatch(ip.slot, /198\.51\.100\.10/);
});

test('invalid IP is rejected rather than grouped under one fallback key', async () => {
  await assert.rejects(() => consumeWithStore(memoryStore(), 'not-an-ip', time));
});
