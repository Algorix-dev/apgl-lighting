// Edge Function: lets a signed-in ADMIN create / reset / remove other admins.
// It runs on Supabase's servers, where the secret service key is safe.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const reply = (body: unknown) => new Response(JSON.stringify(body), { headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // 1) Who is calling? 2) Are they an admin? If not, stop here.
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '')
  const { data: { user } } = await sb.auth.getUser(token)
  if (!user) return reply({ error: 'Not signed in' })
  const { data: me } = await sb.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!me) return reply({ error: 'Admins only' })

  const { action, id, email, password } = await req.json()

  if (action === 'create') {
    if (!email || !password || password.length < 8) return reply({ error: 'Email and an 8+ character password are required' })
    const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true })
    if (error) return reply({ error: error.message })
    await sb.from('admins').insert({ user_id: data.user.id, email, must_change_password: true })
    return reply({ ok: true })
  }
  if (action === 'reset') {
    if (!password || password.length < 8) return reply({ error: 'Password must be 8+ characters' })
    const { error } = await sb.auth.admin.updateUserById(id, { password })
    if (error) return reply({ error: error.message })
    await sb.from('admins').update({ must_change_password: true }).eq('user_id', id)
    return reply({ ok: true })
  }
  if (action === 'delete') {
    if (id === user.id) return reply({ error: 'You cannot remove yourself' })
    const { error } = await sb.auth.admin.deleteUser(id) // the admins row is removed automatically (cascade)
    if (error) return reply({ error: error.message })
    return reply({ ok: true })
  }
  return reply({ error: 'Unknown action' })
})
