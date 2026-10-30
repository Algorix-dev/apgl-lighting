import { useEffect, useState } from 'react'
import { saveSettings, getSettings } from '../../lib/store'
import { useSettings } from '../../lib/hooks'

const fields = [
  ['whatsapp', 'WhatsApp number', 'International format, e.g. 2348012345678. Every Enquire button uses this.'],
  ['phone', 'Phone number (shown in footer + Call button)', ''], ['email', 'Email', ''], ['address', 'Shop address', ''],
  ['hours', 'Opening hours', ''], ['announcement', 'Top banner text', 'Leave empty to hide the banner.'],
]
export default function Settings() {
  const { reload } = useSettings()
  const [f, setF] = useState(null)
  const [saved, setSaved] = useState(false)
  useEffect(() => { getSettings().then(setF) }, [])
  if (!f) return null
  const submit = async (e) => { e.preventDefault(); await saveSettings(f); reload(); setSaved(true); setTimeout(() => setSaved(false), 2500) }
  return (
    <form onSubmit={submit} className="max-w-xl grid gap-4">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <div className="bg-white rounded-xl p-4 grid gap-4">
        {fields.map(([k, l, hint]) => <label key={k} className="grid gap-1 text-sm font-semibold">{l}{hint && <span className="font-normal text-xs text-slate-500">{hint}</span>}<input className="input font-normal" value={f[k] || ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
      </div>
      <div className="flex items-center gap-3"><button className="btn btn-primary">Save settings</button>{saved && <span className="text-green-600 font-semibold text-sm">Saved ✓</span>}</div>
    </form>
  )
}
