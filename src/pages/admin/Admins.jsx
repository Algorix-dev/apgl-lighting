import { useState } from 'react'
import { Trash2, KeyRound, Copy, Wand2 } from 'lucide-react'
import { listAdmins, createAdmin, deleteAdmin, resetAdminPassword } from '../../lib/store'
import { useAsync, useAuth } from '../../lib/hooks'
import { Loading } from '../../components/ui'

// TIP: this makes a readable temporary password like "Lamp-4821-Glow". The new admin must replace it on first login anyway.
const temp = () => `Lamp-${Math.floor(1000 + Math.random() * 9000)}-Glow`

export default function Admins() {
  const { me } = useAuth()
  const [admins, loading, reload] = useAsync(listAdmins)
  const [f, setF] = useState({ email: '', password: temp() })
  const [created, setCreated] = useState(null)
  const [err, setErr] = useState('')
  if (loading || !admins) return <Loading />

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try { await createAdmin(f.email.trim(), f.password); setCreated(f); setF({ email: '', password: temp() }); reload() }
    catch (x) { setErr(x.message) }
  }
  const reset = async (a) => {
    const pw = prompt(`New temporary password for ${a.email}:`, temp())
    if (!pw) return
    try { await resetAdminPassword(a.id, pw); alert(`Done. Tell ${a.email} the temporary password: ${pw}`); reload() } catch (x) { alert(x.message) }
  }
  const del = async (a) => { if (confirm(`Remove ${a.email} as admin?`)) { try { await deleteAdmin(a.id); reload() } catch (x) { alert(x.message) } } }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold mb-1">Admins</h1>
      <p className="text-sm text-slate-500 mb-4">People who can sign in to this dashboard. New admins get a temporary password and must choose their own on first login.</p>
      <form onSubmit={submit} className="bg-white rounded-xl p-4 grid gap-3 mb-4">
        <h2 className="font-bold">Add an admin</h2>
        <input required type="email" className="input" placeholder="Email address" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <div className="flex gap-2"><input required minLength={8} className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /><button type="button" title="Generate another" onClick={() => setF({ ...f, password: temp() })} className="btn btn-ghost"><Wand2 size={16} /></button></div>
        {err && <p className="text-accent text-sm">{err}</p>}
        <button className="btn btn-primary w-fit">Create admin</button>
      </form>
      {created && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-sm">
          <b>Admin created.</b> Send them these details (they will be asked to change the password):
          <div className="mt-2 font-mono bg-white rounded p-2">Email: {created.email}<br />Temporary password: {created.password}</div>
          <button onClick={() => navigator.clipboard.writeText(`Email: ${created.email}\nTemporary password: ${created.password}\nSign in at ${location.origin}/admin`)} className="btn btn-ghost !py-1.5 mt-2 text-sm"><Copy size={14} />Copy message</button>
        </div>)}
      <div className="bg-white rounded-xl divide-y">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-3">
            <div className="flex-1 min-w-0"><div className="font-semibold truncate">{a.email}{a.email === me.email && <span className="text-xs text-slate-400"> (you)</span>}</div>
              {a.must_change && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Hasn't changed temporary password</span>}</div>
            {a.email !== me.email && <>
              <button title="Reset password" onClick={() => reset(a)} className="p-2 hover:text-brand"><KeyRound size={18} /></button>
              <button title="Remove admin" onClick={() => del(a)} className="p-2 text-accent"><Trash2 size={18} /></button></>}
          </div>))}
      </div>
    </div>
  )
}
