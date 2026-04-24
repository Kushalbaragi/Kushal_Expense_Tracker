import { createClient } from '@supabase/supabase-js'

// Public anon key — safe to expose in frontend builds
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hgqhwexyysxwaugtdwwv.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_X9Wf1RtoOeYMoTFzpjZdbg_GwASa9ce'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
