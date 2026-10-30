import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../lib/store'
import { useAuth } from '../../lib/hooks'

export default function Profile() {
  const { me, refresh } = useAuth()
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const first = me?.mustChange

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setOk(false)
    if (pw.length < 8) return setErr('Use at least 8 characters.')
    if (pw !== pw2) return setErr('The two passwords do not match.')
    if (['admin123', 'password', '12345678'].includes(pw.toLowerCase())) return setErr('That password is too easy to guess.')
    try {
      await auth.changePassword(pw)
      await refresh(); setPw(''); setPw2(''); setOk(true)
      if (first) nav('/admin/dashboard')
    } catch (x) { setErr(x.message) }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-extrabold mb-4">My profile</h1>
      {first && <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mb-4 text-sm"><b>Welcome!</b> You are using a temporary password. Choose your own now to unlock the dashboard.</div>}
      <div className="bg-white rounded-xl p-4 mb-4"><div className="text-xs text-slate-500">Signed in as</div><div className="font-bold">{me?.email}</div></div>
      <form onSubmit={submit} className="bg-white rounded-xl p-4 grid gap-3">
        <h2 className="font-bold">Change password</h2>
        <input required type="password" className="input" placeholder="New password (8+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} />
        <input required type="password" className="input" placeholder="Repeat new password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        {err && <p className="text-accent text-sm">{err}</p>}
        {ok && <p className="text-green-600 text-sm font-semibold">Password updated ✓</p>}
        <button className="btn btn-primary w-fit">Save password</button>
      </form>
    </div>
  )
}
