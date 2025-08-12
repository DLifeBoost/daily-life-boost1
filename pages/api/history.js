// pages/api/history.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { user_id, mission_id, mission_date, status } = req.body;
    if (!user_id || !mission_id || !mission_date || !status) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const { error } = await supabase
      .from('history')
      .insert([{ user_id, mission_id, mission_date, status }]);

    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || err });
  }
}
