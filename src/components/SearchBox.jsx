import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useCatalog } from '../lib/hooks'
import { searchProducts } from '../lib/search'
import { naira } from '../lib/format'

// Search with live suggestions (product photo, name, price). Enter or the button opens the full results on /shop.
export default function SearchBox({ autoFocus = false }) {
  const nav = useNavigate()
  const { products, categories } = useCatalog()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const results = useMemo(() => (q.trim() ? searchProducts(products, categories, q).slice(0, 6) : []), [q, products, categories])
  const submit = (e) => { e.preventDefault(); if (!q.trim()) return; setOpen(false); nav(`/shop?q=${encodeURIComponent(q.trim())}`) }

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={submit} role="search" className="flex">
        <input autoFocus={autoFocus} value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
          className="input !rounded-r-none !py-2.5" placeholder="Search chandeliers, pendants, wall lights…" aria-label="Search products" />
        <button className="btn btn-primary !rounded-l-none !px-4" aria-label="Search"><Search size={18} /></button>
      </form>
      {open && q.trim() && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 card overflow-hidden shadow-xl">
          {results.length ? (
            <>
              {results.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50">
                  <img src={p.images?.[0]} alt="" className="w-11 h-11 object-contain rounded bg-white border" />
                  <span className="flex-1 min-w-0 text-sm font-semibold line-clamp-1">{p.name}</span>
                  {p.price > 0 && <span className="text-sm font-extrabold text-brand">{naira(p.price)}</span>}
                </Link>
              ))}
              <button onClick={submit} className="w-full text-left px-3 py-2.5 text-sm font-bold text-brand border-t hover:bg-slate-50">See all results for “{q.trim()}”</button>
            </>
          ) : (
            <p className="px-4 py-4 text-sm text-slate-500">No products match “{q.trim()}”. Try a simpler word like “pendant” or “wall”, or message us on WhatsApp.</p>
          )}
        </div>
      )}
    </div>
  )
}
