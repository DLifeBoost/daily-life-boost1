// pages/api/mission.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1) Виждаме дали вече има избрана мисия за днес
    const { data: existing, error: e1 } = await supabase
      .from('daily_missions')
      .select('mission_id')
      .eq('mission_date', today)
      .limit(1);

    if (e1) throw e1;
    if (existing && existing.length > 0) {
      const missionId = existing[0].mission_id;
      const { data: mission, error: e2 } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();
      if (e2) throw e2;
      return res.status(200).json({ mission });
    }

    // 2) Ако няма — избираме произволна мисия
    const { count, error: countErr } = await supabase
      .from('missions')
      .select('id', { count: 'exact', head: true });

    if (countErr) throw countErr;
    const total = count || 0;
    if (total === 0) return res.status(404).json({ error: 'No missions in DB' });

    const offset = Math.floor(Math.random() * total);
    const { data: missionRows, error: errRand } = await supabase
      .from('missions')
      .select('*')
      .range(offset, offset)
      .limit(1);

    if (errRand) throw errRand;
    const mission = missionRows && missionRows[0];
    if (!mission) return res.status(500).json({ error: 'Could not pick mission' });

    // 3) Записваме глобалната мисия за деня
    const { error: errInsert } = await supabase
      .from('daily_missions')
      .insert([{ mission_id: mission.id, mission_date: today }]);

    if (errInsert) console.error('Could not insert daily mission', errInsert);

    return res.status(200).json({ mission });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || err });
  }
}
