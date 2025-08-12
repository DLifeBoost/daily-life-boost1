// pages/index.js
import { useEffect, useState } from 'react';

function uidCreate() {
  if (typeof window === 'undefined') return 'server';
  let uid = localStorage.getItem('dlifeboost_user_id');
  if (!uid) {
    uid = (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'u-' + Math.random().toString(36).slice(2,9);
    localStorage.setItem('dlifeboost_user_id', uid);
  }
  return uid;
}

export default function Home() {
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [uid, setUid] = useState('');

  useEffect(() => {
    setUid(uidCreate());
    loadMission();
  }, []);

  async function loadMission() {
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/mission');
      if (!res.ok) {
        const j = await res.json().catch(()=>({error:'unknown'}));
        setFeedback('Грешка при зареждане: ' + (j.error || res.status));
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMission(data.mission);
    } catch (e) {
      setFeedback('Грешка: ' + e.message);
    }
    setLoading(false);
  }

  async function sendHistory(status) {
    if (!mission) { setFeedback('Няма мисия'); return; }
    setFeedback('Изпращам...');
    const body = {
      user_id: uidCreate(),
      mission_id: mission.id,
      mission_date: new Date().toISOString().slice(0,10),
      status
    };
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setFeedback('Записано: ' + status);
      } else {
        const j = await res.json().catch(()=>({error:res.status}));
        setFeedback('Грешка при запис: ' + (j.error || res.status));
      }
    } catch (e) {
      setFeedback('Грешка при запис: ' + e.message);
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 20, display:'flex', justifyContent:'center' }}>
      <div style={{ width: '100%', maxWidth: 540, background:'#fff', padding: 24, borderRadius: 14, boxShadow:'0 8px 30px rgba(0,0,0,0.06)' }}>
        <h1 style={{ margin:0 }}>Твоята мисия за днес</h1>
        <div style={{ marginTop: 14, minHeight: 80 }}>
          { loading ? <div>Зареждам...</div> :
            mission ? <div style={{ fontSize:18 }}>{mission.text}</div> :
            <div>Няма налична мисия.</div>
          }
        </div>

        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <button onClick={() => sendHistory('done')} style={{ flex:1, padding:10, borderRadius:10, border:0, background:'#82B1FF', color:'#fff', fontWeight:700, cursor:'pointer' }}>
            Готово ✅
          </button>
          <button onClick={() => sendHistory('skipped')} style={{ flex:1, padding:10, borderRadius:10, border:0, background:'#FFC107', color:'#222', fontWeight:700, cursor:'pointer' }}>
            Пропусни ❌
          </button>
        </div>

        <div style={{ marginTop:12, color:'#666' }}>{feedback}</div>

        <hr style={{ margin:'18px 0', border:0, borderTop:'1px solid #f0f0f0' }} />
        <div style={{ color:'#999', fontSize:13 }}>Локален потребител ID: <strong>{uid}</strong></div>
        <div style={{ marginTop:8 }}>
          <button onClick={loadMission} style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #eee', background:'#fafafa', cursor:'pointer' }}>Презареди мисия</button>
        </div>
      </div>
    </div>
  );
}
