const { Client } = require('pg');

exports.handler = async (event, context) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM produk');
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gagal ambil data", detail: err.message }),
    };
  } finally {
    await client.end();
  }
};
