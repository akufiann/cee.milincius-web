const { createClient } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // Menyiapkan header agar data bisa dibaca oleh Frontend (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const client = createClient();
  
  try {
    await client.connect();
    // Mengambil data produk, diurutkan berdasarkan kategori agar rapi di web
    const { rows } = await client.query('SELECT * FROM produk ORDER BY kategori ASC, nama ASC');
    
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Gagal mengambil data dari database' });
  } finally {
    await client.end();
  }
};