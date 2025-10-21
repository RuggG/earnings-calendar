(async () => {
  const pgModule = await import('pg');
  const { Client } = pgModule.default ?? pgModule;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'company'
      ORDER BY ordinal_position
    `);

    console.log('\nCompany Table Schema:');
    console.log('====================');
    for (const row of result.rows) {
      console.log(row.column_name.padEnd(35) + ' ' + row.data_type);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
