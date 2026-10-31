import { createClient } from '@supabase/supabase-js'

// TIP: .env values often arrive with stray spaces, quotes or a trailing "/". We clean them up here
// so a small copy-paste slip doesn't crash the whole site.
const clean = (v) => (v || '').trim().replace(/^["']|["']$/g, '')
const url = clean(import.meta.env.VITE_SUPABASE_URL).replace(/\/(rest\/v1)?\/?$/, '')
const key = clean(import.meta.env.VITE_SUPABASE_ANON_KEY)

const valid = /^https:\/\/[^\s/]+\.[^\s/]+$/.test(url) && key.length > 20

// TIP: No (valid) keys = DEMO mode. Everything is saved in the browser (localStorage)
// so you can click around and test before connecting a real database.
export const DEMO = !valid

// If you filled .env in but something is wrong, we say so on screen instead of showing a blank page.
export const CONFIG_PROBLEM =
  (url || key) && !valid
    ? 'Your .env looks wrong, so the site is running in DEMO mode. VITE_SUPABASE_URL must look like https://abcdxyz.supabase.co and VITE_SUPABASE_ANON_KEY must be the long "anon public" key. Save .env, then stop and restart npm run dev.'
    : ''

export const supabase = DEMO ? null : createClient(url, key)
