const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    return client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'company'
      ORDER BY ordinal_position
    `);
  })
  .then(result => {
    console.log('\nCompany Table Schema:');
    console.log('====================');
    result.rows.forEach(row => {
      console.log(row.column_name.padEnd(35) + ' ' + row.data_type);
    });
    return client.end();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err.message);
    client.end();
    process.exit(1);
  });
