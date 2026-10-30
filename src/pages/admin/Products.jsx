import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { listProducts, listCategories, deleteProduct, saveProduct } from '../../lib/store'
import { useAsync } from '../../lib/hooks'
import { naira, STOCK } from '../../lib/format'
import { Loading } from '../../components/ui'

export default function Products() {
  const [products, loading, reload] = useAsync(() => listProducts({ admin: true }))
  const [cats] = useAsync(listCategories)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  if (loading || !products) return <Loading />
  const name = (id) => (cats || []).find((c) => c.id === id)?.name || '—'
  const rows = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) && (!cat || p.category_id === cat))
  const del = async (p) => { if (confirm(`Delete "${p.name}"? This cannot be undone.`)) { await deleteProduct(p.id); reload() } }
  const toggle = async (p) => { await saveProduct({ ...p, visible: !p.visible }); reload() }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-extrabold">Products <span className="text-slate-400 text-lg">({products.length})</span></h1>
        <Link to="/admin/products/new" className="btn btn-primary"><Plus size={18} />Add product</Link>
      </div>
      <div className="flex gap-2 mb-3"><input className="input" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{(cats || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="text-left text-slate-500 bg-slate-50"><tr><th className="p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>{rows.map((p) => (
            <tr key={p.id} className={`border-t ${p.visible ? '' : 'opacity-50'}`}>
              <td className="p-3"><div className="flex items-center gap-3"><img src={p.images?.[0]} className="w-12 h-12 object-contain border rounded bg-white" /><span className="font-semibold line-clamp-2">{p.name}</span></div></td>
              <td>{name(p.category_id)}</td><td className="font-semibold">{naira(p.price)}</td>
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
