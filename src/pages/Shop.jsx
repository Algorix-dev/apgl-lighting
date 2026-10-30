import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { listProducts, listCategories, ratingsMap } from '../lib/store'
import { useAsync } from '../lib/hooks'
import { discountPct } from '../lib/format'
import ProductCard from '../components/ProductCard'
import { Loading } from '../components/ui'

export default function Shop() {
  const [sp, setSp] = useSearchParams()
  const [products, loading] = useAsync(listProducts)
  const [cats] = useAsync(listCategories)
  const [ratings] = useAsync(ratingsMap)
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [inStock, setInStock] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const category = sp.get('category') || ''
  const q = (sp.get('q') || '').toLowerCase()
  const sort = sp.get('sort') || 'newest'
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n) }

  const list = useMemo(() => {
    let l = (products || []).filter((p) =>
      (!category || p.category_id === category) &&
      (!q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)) &&
      (!min || p.price >= +min) && (!max || p.price <= +max) &&
      (!inStock || p.stock_status !== 'out_of_stock'))
    const by = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      discount: (a, b) => discountPct(b.price, b.old_price) - discountPct(a.price, a.old_price),
    }
    return l.sort(by[sort] || by.newest)
  }, [products, category, q, min, max, inStock, sort])

  if (loading) return <Loading />
  const current = (cats || []).find((c) => c.id === category)

  const Filters = (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold mb-2">Category</h3>
        <button onClick={() => set('category', '')} className={`block w-full text-left py-1 text-sm ${!category ? 'text-brand font-bold' : ''}`}>All products</button>
        {(cats || []).map((c) => <button key={c.id} onClick={() => set('category', c.id)} className={`block w-full text-left py-1 text-sm hover:text-brand ${category === c.id ? 'text-brand font-bold' : ''}`}>{c.name}</button>)}
      </div>
      <div>
        <h3 className="font-bold mb-2">Price (₦)</h3>
        <div className="flex gap-2"><input className="input" placeholder="Min" type="number" value={min} onChange={(e) => setMin(e.target.value)} /><input className="input" placeholder="Max" type="number" value={max} onChange={(e) => setMax(e.target.value)} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />Hide out of stock</label>
    </div>
  )

  return (
    <div className="container-x pt-4 grid lg:grid-cols-[240px_1fr] gap-4">
      <aside className="hidden lg:block bg-white rounded-lg p-4 h-fit sticky top-36">{Filters}</aside>
      <div>
        <div className="bg-white rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 mb-3">
          <div><h1 className="font-extrabold text-lg">{current?.name || (q ? `Results for “${sp.get('q')}”` : 'All lighting')}</h1><p className="text-sm text-slate-500">{list.length} product{list.length !== 1 && 's'}</p></div>
          <div className="flex gap-2">
            <button className="lg:hidden btn btn-ghost !py-2" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16} />Filters</button>
            <select className="input !w-auto" value={sort} onChange={(e) => set('sort', e.target.value)}>
              <option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="discount">Biggest discount</option>
            </select>
          </div>
        </div>
        {showFilters && <div className="lg:hidden bg-white rounded-lg p-4 mb-3">{Filters}</div>}
        {list.length === 0 ? <div className="bg-white rounded-lg p-12 text-center text-slate-500">No products match. Try clearing filters.</div> : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">{list.map((p) => <ProductCard key={p.id} p={p} rating={(ratings || {})[p.id]} />)}</div>
        )}
      </div>
    </div>
  )
}
