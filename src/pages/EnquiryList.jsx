import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ClipboardList, ArrowLeft } from 'lucide-react'
import { logEnquiry } from '../lib/store'
import { useEnquiry, useSettings, useCatalog } from '../lib/hooks'
import { naira, waLink } from '../lib/format'
import { useSeo } from '../lib/seo'
import { Breadcrumbs, EmptyState, WaIcon, Skeleton } from '../components/ui'

export default function EnquiryList() {
  useSeo({ title: 'My enquiry list | APGL', description: 'Review the lighting products you want to enquire about and send them to APGL on WhatsApp.', path: '/enquiry-list', noindex: true })
  const { items, remove, setQty, clear } = useEnquiry()
  const { whatsapp } = useSettings()
  const { products, loading } = useCatalog()
  if (loading) return <div className="container-x pt-8"><Skeleton className="h-64" /></div>

  const rows = items.map((i) => ({ ...i, p: products.find((p) => p.id === i.id) })).filter((r) => r.p)
  const total = rows.reduce((a, r) => a + r.p.price * r.qty, 0)
  const units = rows.reduce((a, r) => a + r.qty, 0)

  const send = () => {
    rows.forEach((r) => logEnquiry(r.p.id))
    const lines = rows.map((r, n) => `${n + 1}. ${r.p.name} x${r.qty}${r.p.price > 0 ? ` (${naira(r.p.price)} each)` : ''}\n   ${location.origin}/product/${r.p.id}`).join('\n')
    window.open(waLink(whatsapp, `Hello APGL, I'd like to enquire about these items:\n\n${lines}\n\n${total > 0 ? `Estimated total: ${naira(total)}\n` : ''}Please confirm availability and delivery.`), '_blank')
  }

  return (
    <div className="container-x pt-5">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Enquiry list' }]} />
      <h1 className="text-2xl font-extrabold">My enquiry list</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">Collect the lights you like, then send everything to APGL in one WhatsApp message. There is no payment on this site.</p>

      {rows.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Your enquiry list is empty" text="Browse our lighting and tap “Add to enquiry” on the products you like. They will be saved here.">
          <Link to="/shop" className="btn btn-primary !px-6">Browse products</Link>
        </EmptyState>
      ) : (
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          <ul className="card divide-y divide-slate-100">
            {rows.map(({ p, qty }) => (
              <li key={p.id} className="flex gap-4 p-4 items-center flex-wrap sm:flex-nowrap">
                <Link to={`/product/${p.id}`} className="shrink-0"><img src={p.images?.[0]} alt={p.name} className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg border bg-white" /></Link>
                <div className="flex-1 min-w-[10rem]"><Link to={`/product/${p.id}`} className="font-bold leading-snug line-clamp-2 hover:text-brand">{p.name}</Link><div className="text-brand font-extrabold mt-1">{p.price > 0 ? naira(p.price) : 'Price on request'}</div></div>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white"><button className="p-2.5" onClick={() => setQty(p.id, qty - 1)} aria-label="Decrease quantity"><Minus size={15} /></button><span className="w-9 text-center font-bold text-sm">{qty}</span><button className="p-2.5" onClick={() => setQty(p.id, qty + 1)} aria-label="Increase quantity"><Plus size={15} /></button></div>
                <button onClick={() => remove(p.id)} className="p-2.5 text-accent hover:bg-red-50 rounded-lg" aria-label={`Remove ${p.name}`}><Trash2 size={18} /></button>
              </li>
            ))}
          </ul>
          <aside className="card p-5 lg:sticky lg:top-36" aria-label="Enquiry summary">
            <h2 className="font-extrabold">Summary</h2>
            <dl className="mt-3 text-sm space-y-2"><div className="flex justify-between"><dt className="text-slate-500">Products</dt><dd className="font-bold">{rows.length}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Total units</dt><dd className="font-bold">{units}</dd></div>{total > 0 && <div className="flex justify-between border-t pt-3 mt-3"><dt className="font-bold">Estimated total</dt><dd className="font-extrabold text-brand text-lg">{naira(total)}</dd></div>}</dl>
            <button onClick={send} className="btn btn-wa w-full !py-3.5 mt-5 text-base"><WaIcon size={19} />Send on WhatsApp</button>
            <Link to="/shop" className="btn btn-ghost w-full mt-2.5"><ArrowLeft size={16} />Continue browsing</Link>
            <button onClick={() => { if (confirm('Clear your whole enquiry list?')) clear() }} className="w-full text-center text-sm font-semibold text-accent mt-4 hover:underline">Clear enquiry list</button>
          </aside>
        </div>
      )}
    </div>
  )
}
