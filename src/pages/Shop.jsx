import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, SearchX, AlertTriangle } from 'lucide-react'
import { useCatalog } from '../lib/hooks'
import { searchProducts } from '../lib/search'
import { discountPct } from '../lib/format'
import { useSeo } from '../lib/seo'
import ProductCard from '../components/ProductCard'
import { Breadcrumbs, ProductGridSkeleton, EmptyState } from '../components/ui'

const PAGE = 24 // TIP: how many products show before the "Show more" button
const SORTS = [['featured', 'Featured'], ['newest', 'Newest'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['az', 'Alphabetical'], ['discount', 'Biggest discount']]

export default function Shop() {
  const [sp, setSp] = useSearchParams()
  const { products, categories, ratings, loading, error, reload } = useCatalog()
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [avail, setAvail] = useState(false)
  const [sale, setSale] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const [filters, setFilters] = useState(false)
  const category = sp.get('category') || ''
  const q = sp.get('q') || ''
  const sort = sp.get('sort') || 'featured'
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n) }
  useEffect(() => { setShown(PAGE) }, [category, q, sort, min, max, avail, sale])

  const current = categories.find((c) => c.id === category)
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
  const counts = useMemo(() => { const o = {}; products.forEach((p) => { o[p.category_id] = (o[p.category_id] || 0) + 1 }); return o }, [products])

  const list = useMemo(() => {
    const base = q ? searchProducts(products, categories, q) : products
    const l = base.filter((p) => (!category || p.category_id === category) && (!min || p.price >= +min) && (!max || p.price <= +max) && (!avail || p.stock_status !== 'out_of_stock') && (!sale || p.old_price > p.price))
    const t = (p) => new Date(p.created_at)
    const by = {
      featured: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || t(b) - t(a), newest: (a, b) => t(b) - t(a),
      low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, az: (a, b) => a.name.localeCompare(b.name),
      discount: (a, b) => discountPct(b.price, b.old_price) - discountPct(a.price, a.old_price),
    }
    return q && sort === 'featured' ? l : l.sort(by[sort] || by.featured) // searches keep best-match order
  }, [products, categories, q, category, min, max, avail, sale, sort])

  const heading = current?.name || (q ? `Results for “${q}”` : 'All lighting products')
  useSeo({
    title: `${current?.name || (q ? `Search: ${q}` : 'Lighting Products')} | APGL`,
    description: current ? `Shop ${current.name.toLowerCase()} from APGL. Genuine lighting, bulk and contractor pricing, enquire on WhatsApp.` : 'Browse chandeliers, pendant lights, wall lights and more from APGL. Add products to your enquiry list and send it on WhatsApp.',
    path: current ? `/shop?category=${current.id}` : '/shop', noindex: !!q,
  })

  const Filters = (
    <div className="space-y-6">
      <div>
        <h3 className="font-extrabold text-sm mb-2">Category</h3>
        <button onClick={() => set('category', '')} className={`flex justify-between w-full py-1.5 text-sm ${!category ? 'text-brand font-extrabold' : 'hover:text-brand'}`}><span>All products</span><span className="text-slate-400">{products.length}</span></button>
        {categories.filter((c) => counts[c.id]).map((c) => <button key={c.id} onClick={() => set('category', c.id)} className={`flex justify-between w-full py-1.5 text-sm ${category === c.id ? 'text-brand font-extrabold' : 'hover:text-brand'}`}><span>{c.name}</span><span className="text-slate-400">{counts[c.id]}</span></button>)}
      </div>
      <div><h3 className="font-extrabold text-sm mb-2">Price (₦)</h3><div className="flex gap-2"><input className="input" placeholder="Min" type="number" min="0" value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minimum price" /><input className="input" placeholder="Max" type="number" min="0" value={max} onChange={(e) => setMax(e.target.value)} aria-label="Maximum price" /></div></div>
      <div className="space-y-2.5 text-sm font-semibold">
        <label className="flex items-center gap-2"><input type="checkbox" checked={avail} onChange={(e) => setAvail(e.target.checked)} />Hide out of stock</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={sale} onChange={(e) => setSale(e.target.checked)} />On sale only</label>
      </div>
    </div>
  )

  return (
    <div className="container-x pt-5">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: current || q ? '/shop' : undefined }, ...(current ? [{ label: current.name }] : q ? [{ label: 'Search' }] : [])]} />
      <div className="grid lg:grid-cols-[250px_1fr] gap-6 items-start">
        <aside className="hidden lg:block card p-5 sticky top-36" aria-label="Filters">{Filters}</aside>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div><h1 className="text-2xl font-extrabold">{heading}</h1><p className="text-sm text-slate-500">{loading ? 'Loading…' : `${list.length} product${list.length !== 1 ? 's' : ''}`}</p></div>
            <div className="flex gap-2">
              <button className="lg:hidden btn btn-ghost !py-2 text-sm" onClick={() => setFilters(!filters)} aria-expanded={filters}><SlidersHorizontal size={16} />Filters</button>
              <select className="input !w-auto !py-2 text-sm font-semibold" value={sort} onChange={(e) => set('sort', e.target.value === 'featured' ? '' : e.target.value)} aria-label="Sort products">{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </div>
          </div>
          {filters && <div className="lg:hidden card p-5 mb-4">{Filters}</div>}
          {loading ? <ProductGridSkeleton /> : error ? (
            <EmptyState icon={AlertTriangle} title="We could not load the products" text="Check your connection and try again."><button className="btn btn-primary" onClick={reload}>Try again</button></EmptyState>
          ) : list.length === 0 ? (
            <EmptyState icon={SearchX} title={products.length ? 'No products match' : 'Products coming soon'} text={products.length ? 'Try a simpler search word or clear some filters.' : 'The catalogue is being updated. Please check back shortly.'}>
              {products.length > 0 && <button className="btn btn-primary" onClick={() => { setSp({}); setMin(''); setMax(''); setAvail(false); setSale(false) }}>Clear filters</button>}
            </EmptyState>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">{list.slice(0, shown).map((p) => <ProductCard key={p.id} p={p} rating={ratings[p.id]} category={catMap[p.category_id]} />)}</div>
              {shown < list.length && <div className="text-center mt-8"><p className="text-sm text-slate-500 mb-3">Showing {shown} of {list.length}</p><button className="btn btn-ghost !px-8" onClick={() => setShown(shown + PAGE)}>Show more</button></div>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
