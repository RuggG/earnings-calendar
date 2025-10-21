import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('Connected to database');

  const result = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'company'
    ORDER BY ordinal_position
  `);

  console.log('\nCompany Table Columns:');
  console.log('======================');
  result.rows.forEach(row => {
    const name = row.column_name.padEnd(40);
    console.log(name + ' ' + row.data_type);
  });

  await client.end();
} catch (err) {
  console.error('Error:', err.message);
  await client.end();
  process.exit(1);
}
