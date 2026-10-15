import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT text FROM words ORDER BY created_at ASC`;
      return res.status(200).json(rows.map(r => r.text));
    }

    if (req.method === 'POST') {
      const { t } = req.body || {};
      if (!t || typeof t !== 'string' || t.trim() === '') {
        return res.status(400).json({ error: 'Palabra vacía' });
      }
      const limpio = t.trim().slice(0, 100);
      await sql`INSERT INTO words (text) VALUES (${limpio})`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM words`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error DB:', error);
    return res.status(500).json({ error: 'Error en la base de datos' });
  }
}
