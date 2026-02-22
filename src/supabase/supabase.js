import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vvvdzxiwbmqigmtyjetw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dmR6eGl3Ym1xaWdtdHlqZXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDIyNTksImV4cCI6MjA4NzI3ODI1OX0.9UAjyr3gSrOPp6ROw1ckLvvviFeJ5-FZz7BJvTP4_tI'

if(!SUPABASE_URL || !SUPABASE_ANON_KEY ){
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})