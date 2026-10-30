import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus } from 'lucide-react'
import { listProducts, logEnquiry } from '../lib/store'
import { useAsync, useEnquiry, useSettings } from '../lib/hooks'
import { naira, waLink } from '../lib/format'
import { Loading, WaIcon } from '../components/ui'

export default function EnquiryList() {
  const { items, remove, setQty, clear } = useEnquiry()
  const { whatsapp } = useSettings()
  const [products, loading] = useAsync(listProducts)
  if (loading) return <Loading />
  const rows = items.map((i) => ({ ...i, p: products.find((p) => p.id === i.id) })).filter((r) => r.p)
  const total = rows.reduce((a, r) => a + r.p.price * r.qty, 0)

  const send = () => {
    rows.forEach((r) => logEnquiry(r.p.id))
    const lines = rows.map((r, n) => `${n + 1}. ${r.p.name} x${r.qty} — ${naira(r.p.price * r.qty)}\n   ${location.origin}/product/${r.p.id}`).join('\n')
    window.open(waLink(whatsapp, `Hello APGL, I'd like to enquire about these items:\n\n${lines}\n\nEstimated total: ${naira(total)}\nPlease confirm availability and delivery.`), '_blank')
  }

  return (
    <div className="container-x pt-6 max-w-3xl">
      <h1 className="text-2xl font-extrabold">My enquiry list</h1>
      <p className="text-slate-500 text-sm mb-4">Add the lights you like, then send everything to us in one WhatsApp message. No payment on this site.</p>
      {rows.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">Your list is empty. <Link className="text-brand font-bold" to="/shop">Browse products</Link></div>
      ) : (
        <div className="bg-white rounded-lg divide-y">
          {rows.map(({ p, qty }) => (
            <div key={p.id} className="flex gap-3 p-3 items-center">
              <img src={p.images?.[0]} alt="" className="w-20 h-20 object-contain border rounded" />
              <div className="flex-1 min-w-0"><Link to={`/product/${p.id}`} className="font-semibold line-clamp-2 hover:text-brand">{p.name}</Link><div className="text-brand font-bold">{naira(p.price)}</div></div>
              <div className="flex items-center border rounded"><button className="p-2" onClick={() => setQty(p.id, qty - 1)}><Minus size={14} /></button><span className="w-8 text-center text-sm">{qty}</span><button className="p-2" onClick={() => setQty(p.id, qty + 1)}><Plus size={14} /></button></div>
              <button onClick={() => remove(p.id)} className="p-2 text-accent"><Trash2 size={18} /></button>
            </div>
          ))}
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div><div className="text-sm text-slate-500">Estimated total</div><div className="text-2xl font-extrabold text-brand">{naira(total)}</div></div>
            <div className="flex gap-2"><button onClick={clear} className="btn btn-ghost">Clear</button><button onClick={send} className="btn btn-wa"><WaIcon />Send on WhatsApp</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
