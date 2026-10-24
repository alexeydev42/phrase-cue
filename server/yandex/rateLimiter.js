const { createHash } = require('node:crypto');
const { isIP } = require('node:net');
const { getYdbStore } = require('./ydbStore.js');

const TEN_MINUTES_MS = 10 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_REQUESTS_PER_IP = 5;
const MAX_REQUESTS_PER_DAY = 100;

// Two fixed windows: ten minutes per IP, and one UTC day for all users.
const getSlots = (ip, nowMs) => {
  if (!isIP(ip) || !Number.isFinite(nowMs) || nowMs < 0) {
    throw new Error('Invalid rate-limit input');
  }

  const ipHash = createHash('sha256').update(ip).digest('hex');
  const tenMinuteWindow = Math.floor(nowMs / TEN_MINUTES_MS);
  const dayWindow = Math.floor(nowMs / DAY_MS);

  return {
    ip: {
      scope: 'ip',
      slot: `${ipHash}:${tenMinuteWindow}`,
      // TTL is only for cleaning up old windows, not for enforcing limits.
      expiresAt: (tenMinuteWindow + 1) * TEN_MINUTES_MS + DAY_MS,
    },
    daily: {
      scope: 'daily',
      slot: String(dayWindow),
      expiresAt: (dayWindow + 2) * DAY_MS,
    },
  };
};

const consumeWithStore = async (store, ip, nowMs = Date.now()) => {
  const { ip: ipSlot, daily: dailySlot } = getSlots(ip, nowMs);

  // The store checks both counters and increments them in one serializable transaction.
  // A rejected request must not increment either counter.
  return store.checkAndIncrement({
    ipSlot,
    dailySlot,
    maxPerIp: MAX_REQUESTS_PER_IP,
    maxPerDay: MAX_REQUESTS_PER_DAY,
  });
};

const allowRequest = async (ip) => consumeWithStore(await getYdbStore(), ip);

module.exports = { allowRequest, consumeWithStore, getSlots };
