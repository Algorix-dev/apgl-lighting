import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { listProducts, listCategories, deleteProduct, saveProduct } from '../../lib/store'
import { useAsync } from '../../lib/hooks'
import { STOCK } from '../../lib/format'
import { Loading } from '../../components/ui'

// Type a price straight into the table; it saves when you press Enter or click away.
function PriceCell({ p, onSave }) {
  const [v, setV] = useState(p.price > 0 ? String(p.price) : '')
  return (
    <div className="flex items-center gap-1">
      <span className="text-slate-400">₦</span>
      <input type="number" min="0" inputMode="numeric" value={v} placeholder="Set price" aria-label={`Price for ${p.name}`}
        onChange={(e) => setV(e.target.value)} onBlur={() => onSave(p, v)} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className={`input !py-1.5 !w-32 font-semibold ${p.price > 0 ? '' : '!border-amber-300 !bg-amber-50'}`} />
    </div>
  )
}

export default function Products() {
  const [products, loading, reload] = useAsync(() => listProducts({ admin: true }))
  const [cats] = useAsync(listCategories)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [noPrice, setNoPrice] = useState(false)
  const [picked, setPicked] = useState(new Set()) // ids ticked for bulk actions
  const [busy, setBusy] = useState(false)
  if (!products) return <Loading /> // (not `loading`: the table must stay on screen while a price saves)
  const name = (id) => (cats || []).find((c) => c.id === id)?.name || '—'
  const rows = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) && (!cat || p.category_id === cat) && (!noPrice || !(p.price > 0)))
  const del = async (p) => { if (confirm(`Delete "${p.name}"? This cannot be undone.`)) { await deleteProduct(p.id); reload() } }
  const unpriced = products.filter((p) => !(p.price > 0)).length
  const setPrice = async (p, v) => { if (Number(v || 0) === Number(p.price || 0)) return; await saveProduct({ ...p, price: v }); reload() }
  const allShown = rows.length > 0 && rows.every((p) => picked.has(p.id))
  const tick = (id) => setPicked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const tickAll = () => setPicked(allShown ? new Set() : new Set(rows.map((p) => p.id)))
  // One product at a time on purpose: it is slower than all-at-once but never loses a change.
  const bulk = async (fn) => { setBusy(true); try { for (const p of products.filter((x) => picked.has(x.id))) await fn(p) } finally { setPicked(new Set()); setBusy(false); reload() } }
  const bulkDelete = () => { if (confirm(`Delete ${picked.size} product${picked.size > 1 ? 's' : ''}? This cannot be undone.`)) bulk((p) => deleteProduct(p.id)) }
  const bulkVisible = (visible) => bulk((p) => (p.visible === visible ? null : saveProduct({ ...p, visible })))
  const toggle = async (p) => { await saveProduct({ ...p, visible: !p.visible }); reload() }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-extrabold">Products <span className="text-slate-400 text-lg">({products.length})</span></h1>
        <Link to="/admin/products/new" className="btn btn-primary"><Plus size={18} />Add product</Link>
      </div>
      <div className="flex gap-2 mb-3"><input className="input" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Filter by category…</option>{(cats || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <label className="flex items-center gap-2 text-sm font-semibold mb-3"><input type="checkbox" checked={noPrice} onChange={(e) => setNoPrice(e.target.checked)} />Show only products without a price <span className="text-amber-600">({unpriced} to price)</span></label>
      {picked.size > 0 && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-brand-dark text-white rounded-xl px-4 py-3 mb-3 shadow-lg">
          <span className="font-bold mr-auto">{picked.size} selected</span>
          <button disabled={busy} onClick={() => bulkVisible(false)} className="btn btn-outline-light !py-1.5 text-sm"><EyeOff size={16} />Hide from shop</button>
          <button disabled={busy} onClick={() => bulkVisible(true)} className="btn btn-outline-light !py-1.5 text-sm"><Eye size={16} />Show in shop</button>
          <button disabled={busy} onClick={bulkDelete} className="btn !py-1.5 text-sm bg-accent text-white"><Trash2 size={16} />{busy ? 'Working…' : 'Delete selected'}</button>
          <button disabled={busy} onClick={() => setPicked(new Set())} className="p-2" title="Clear selection" aria-label="Clear selection"><X size={18} /></button>
        </div>)}
      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="text-left text-slate-500 bg-slate-50"><tr><th className="p-3 w-10"><input type="checkbox" checked={allShown} onChange={tickAll} aria-label="Select all shown products" /></th><th className="p-3 pl-0">Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>{rows.map((p) => (
            <tr key={p.id} className={`border-t ${p.visible ? '' : 'opacity-50'} ${picked.has(p.id) ? '!bg-blue-50' : ''}`}>
              <td className="p-3 w-10"><input type="checkbox" checked={picked.has(p.id)} onChange={() => tick(p.id)} aria-label={`Select ${p.name}`} /></td>
              <td className="p-3 pl-0"><div className="flex items-center gap-3"><img src={p.images?.[0]} className="w-12 h-12 object-contain border rounded bg-white" /><span className="font-semibold line-clamp-2">{p.name}</span></div></td>
              <td>{name(p.category_id)}</td><td><PriceCell key={p.id + '-' + p.price} p={p} onSave={setPrice} /></td>
              <td><span className={`text-xs font-bold px-2 py-1 rounded-full ${STOCK[p.stock_status]?.cls}`}>{STOCK[p.stock_status]?.label}</span></td>
              <td className="text-right pr-3 whitespace-nowrap">
                <button title={p.visible ? 'Hide from shop' : 'Show in shop'} onClick={() => toggle(p)} className="p-2 hover:text-brand">{p.visible ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                <Link to={`/admin/products/${p.id}`} className="p-2 inline-block hover:text-brand"><Pencil size={18} /></Link>
                <button onClick={() => del(p)} className="p-2 text-accent"><Trash2 size={18} /></button>
              </td>
            </tr>))}
          </tbody>
        </table>
        {!rows.length && <p className="p-8 text-center text-slate-500">No products found.</p>}
      </div>
    </div>
  )
}
