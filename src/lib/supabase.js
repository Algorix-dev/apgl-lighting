import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// TIP: No keys in .env = DEMO mode. Everything is saved in the browser (localStorage)
// so you can click around and test before connecting a real database.
export const DEMO = !url || !key
export const supabase = DEMO ? null : createClient(url, key)
