import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { auth } from '../../lib/store'
import { DEMO } from '../../lib/supabase'
import { useAuth } from '../../lib/hooks'

export default function Login() {
  const { session, refresh } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  if (session) return <Navigate to="/admin/dashboard" replace />
  const go = async (e) => {
    e.preventDefault(); setErr('')
    try { await auth.signIn(email, pw); refresh() } catch (x) { setErr(x.message) }
  }
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-dark to-brand p-4">
      <form onSubmit={go} className="bg-white rounded-xl p-6 w-full max-w-sm grid gap-3 shadow-2xl">
        <img src="/logo.jpg" alt="APGL" className="h-14 mx-auto" />
        <h1 className="text-center font-extrabold text-lg">Admin sign in</h1>
        {DEMO && <p className="text-xs bg-amber-50 text-amber-800 rounded p-2">Demo mode: use any email and the password <b>admin123</b>.</p>}
        <input required type="email" className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" className="input" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        {err && <p className="text-accent text-sm">{err}</p>}
        <button className="btn btn-primary">Sign in</button>
      </form>
    </div>
  )
}
