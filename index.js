import { supabase } from '../lib/supabaseClient'

export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Daily Life Boost 🚀</h1>
      <p>Добре дошъл! Приложението е свързано със Supabase.</p>
    </div>
  )
}