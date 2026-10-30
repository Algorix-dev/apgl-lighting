import { useState } from 'react'
import { Check } from 'lucide-react'
import { lookupOrder } from '../lib/store'
import { ORDER_STEPS } from '../lib/format'

export default function OrderStatus() {
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [res, setRes] = useState(undefined)
  const [busy, setBusy] = useState(false)

  const go = async (e) => {
    e.preventDefault(); setBusy(true)
    try { setRes(await lookupOrder(code, phone)) } catch { setRes(null) }
    setBusy(false)
  }
  const step = res ? ORDER_STEPS.indexOf(res.status) : -1

  return (
    <div className="container-x pt-8 max-w-xl">
      <h1 className="text-2xl font-extrabold">Check order status</h1>
      <p className="text-slate-500 text-sm mb-4">Enter the order code we sent you on WhatsApp and the phone number you ordered with.</p>
      <form onSubmit={go} className="bg-white rounded-lg p-4 grid gap-3">
        <input required className="input" placeholder="Order code (e.g. APGL-1001)" value={code} onChange={(e) => setCode(e.target.value)} />
        <input required className="input" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button disabled={busy} className="btn btn-primary">{busy ? 'Checking…' : 'Check status'}</button>
      </form>
      {res === null && <p className="mt-4 bg-red-50 text-accent rounded-lg p-3 text-sm">No order found. Check the code and phone number, or message us on WhatsApp.</p>}
      {res && (
        <div className="bg-white rounded-lg p-5 mt-4">
          <div className="flex justify-between flex-wrap gap-2"><b>{res.code}</b><span className={`text-sm font-bold ${res.status === 'Cancelled' ? 'text-accent' : 'text-brand'}`}>{res.status}</span></div>
          <p className="text-sm text-slate-600 mt-1">{res.items}</p>
          {res.status !== 'Cancelled' && (
            <ol className="mt-5 space-y-4">
              {ORDER_STEPS.map((s, n) => (
                <li key={s} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${n <= step ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{n <= step ? <Check size={14} /> : n + 1}</span>
                  <span className={n <= step ? 'font-bold' : 'text-slate-400'}>{s}</span>
                </li>
              ))}
            </ol>
          )}
          {res.note && <p className="mt-4 text-sm bg-slate-50 rounded p-3">Note: {res.note}</p>}
        </div>
      )}
    </div>
  )
}
