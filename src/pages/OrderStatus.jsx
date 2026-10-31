import { useState } from 'react'
import { Check, PackageSearch, Loader2 } from 'lucide-react'
import { lookupOrder } from '../lib/store'
import { ORDER_STEPS } from '../lib/format'
import { useSeo } from '../lib/seo'
import { Breadcrumbs } from '../components/ui'

export default function OrderStatus() {
  useSeo({ title: 'Check order status | APGL', description: 'Track your APGL order with your order code and phone number.', path: '/order-status' })
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [res, setRes] = useState(undefined) // undefined = not searched yet, null = not found
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const go = async (e) => {
    e.preventDefault(); setErr(''); setRes(undefined)
    if (phone.replace(/\D/g, '').length < 10) return setErr('Enter the full phone number you ordered with.')
    setBusy(true)
    try { setRes(await lookupOrder(code, phone)) } catch { setErr('Something went wrong. Please try again, or message us on WhatsApp.') }
    setBusy(false)
  }
  const step = res ? ORDER_STEPS.indexOf(res.status) : -1

  return (
    <div className="container-x pt-5 max-w-xl pb-4">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Order status' }]} />
      <div className="card p-6 sm:p-8">
        <div className="w-12 h-12 rounded-full bg-brand/10 text-brand grid place-items-center"><PackageSearch size={24} /></div>
        <h1 className="text-2xl font-extrabold mt-4">Check order status</h1>
        <p className="text-slate-500 text-sm mt-1">Enter the order code APGL sent you on WhatsApp and the phone number you ordered with.</p>
        <form onSubmit={go} className="grid gap-3 mt-5">
          <label className="grid gap-1 text-sm font-bold">Order code<input required className="input font-normal" placeholder="e.g. APGL-1001" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" /></label>
          <label className="grid gap-1 text-sm font-bold">Phone number<input required type="tel" className="input font-normal" placeholder="e.g. 08012345678" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
          {err && <p role="alert" className="text-accent text-sm font-semibold">{err}</p>}
          <button disabled={busy} className="btn btn-primary !py-3">{busy ? <><Loader2 size={18} className="animate-spin" />Checking…</> : 'Check status'}</button>
        </form>
      </div>
      {res === null && <p role="alert" className="mt-4 card p-4 text-sm text-accent font-semibold">No order found. Check the code and phone number, or message us on WhatsApp.</p>}
      {res && (
        <div className="card p-6 mt-4">
          <div className="flex justify-between flex-wrap gap-2 items-center"><b className="text-lg">{res.code}</b><span className={`text-sm font-extrabold px-3 py-1 rounded-full ${res.status === 'Cancelled' ? 'bg-red-100 text-accent' : 'bg-brand/10 text-brand'}`}>{res.status}</span></div>
          <p className="text-sm text-slate-600 mt-2">{res.items}</p>
          {res.status !== 'Cancelled' && (
            <ol className="mt-6 space-y-4">
              {ORDER_STEPS.map((s, n) => (
                <li key={s} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${n <= step ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{n <= step ? <Check size={14} /> : n + 1}</span>
                  <span className={n <= step ? 'font-bold' : 'text-slate-400'}>{s}</span>
                </li>
              ))}
            </ol>
          )}
          {res.note && <p className="mt-5 text-sm bg-slate-50 rounded-lg p-3">Note: {res.note}</p>}
        </div>
      )}
    </div>
  )
}
