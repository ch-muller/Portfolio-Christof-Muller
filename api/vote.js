// api/vote.js
import { kv } from '@vercel/kv'; // Vercel KV nutzen

export default async function handler(req, res) {
  // Bestehende Stimmen laden oder Standardwerte setzen
  const votes = (await kv.get('votes')) || { yes: 0, maybe: 0, no: 0 };

  if (req.method === 'POST') {
    const { option } = req.body;
    if (['yes', 'maybe', 'no'].includes(option)) {
      votes[option]++;                     // Stimme erhöhen
      await kv.set('votes', votes);        // dauerhaft speichern
    }
    return res.status(200).json({ success: true, votes });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ votes });
  }

  res.status(405).json({ message: 'Method not allowed' });
}
