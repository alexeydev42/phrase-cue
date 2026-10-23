let storePromise;

const createYdbStore = async () => {
  const connectionString = process.env.YDB_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error('YDB_CONNECTION_STRING is not configured');
  }

  // Load only in the deployed function: ordinary Node tests require no credentials.
  const [{ Driver }, { query }, { MetadataCredentialsProvider }, { Uint64 }] = await Promise.all([
    import('@ydbjs/core'),
    import('@ydbjs/query'),
    import('@ydbjs/auth/metadata'),
    import('@ydbjs/value/primitive'),
  ]);

  // Cloud Functions obtains short-lived IAM tokens for its attached service account.
  const driver = new Driver(connectionString, {
    credentialsProvider: new MetadataCredentialsProvider(),
  });
  await driver.ready();
  const sql = query(driver, { poolOptions: { maxSize: 4 } });

  return {
    async checkAndIncrement({ ipSlot, dailySlot, maxPerIp, maxPerDay }) {
      return sql.begin({ isolation: 'serializableReadWrite', idempotent: true }, async (tx) => {
        const ipRows = await tx`
          SELECT requests FROM rate_limits
          WHERE scope = ${ipSlot.scope} AND slot = ${ipSlot.slot}
        `;
        const dailyRows = await tx`
          SELECT requests FROM rate_limits
          WHERE scope = ${dailySlot.scope} AND slot = ${dailySlot.slot}
        `;

        const ipCount = Number(ipRows[0]?.[0]?.requests ?? 0);
        const dailyCount = Number(dailyRows[0]?.[0]?.requests ?? 0);

        if (ipCount >= maxPerIp || dailyCount >= maxPerDay) {
          return false;
        }

        await tx`
          UPSERT INTO rate_limits (scope, slot, requests, expires_at)
          VALUES (
            ${ipSlot.scope}, ${ipSlot.slot},
            ${new Uint64(BigInt(ipCount + 1))},
            ${new Uint64(BigInt(ipSlot.expiresAt))}
          )
        `;
        await tx`
          UPSERT INTO rate_limits (scope, slot, requests, expires_at)
          VALUES (
            ${dailySlot.scope}, ${dailySlot.slot},
            ${new Uint64(BigInt(dailyCount + 1))},
            ${new Uint64(BigInt(dailySlot.expiresAt))}
          )
        `;

        return true;
      });
    },
  };
};

const getYdbStore = () => {
  if (!storePromise) {
    storePromise = createYdbStore().catch((error) => {
      storePromise = undefined;
      throw error;
    });
  }
  return storePromise;
};

module.exports = { getYdbStore };
