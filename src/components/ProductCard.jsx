import { Link } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import { naira, discountPct, STOCK } from '../lib/format'
import { useEnquiry } from '../lib/hooks'
import { useToast } from './Toast'
import { Stars } from './ui'

// Every card has the same structure and height: square photo, category, name (2 lines), price, availability, actions.
export default function ProductCard({ p, rating, category }) {
  const enq = useEnquiry()
  const toast = useToast()
  const off = discountPct(p.price, p.old_price)
  const stock = STOCK[p.stock_status] || STOCK.in_stock
  const added = enq.has(p.id)

  const add = () => {
    if (added) return toast('Already in your enquiry list')
    enq.add(p.id); toast('Added to your enquiry list')
  }

  return (
    <article className="card card-hover overflow-hidden flex flex-col h-full">
      <Link to={`/product/${p.id}`} className="relative block aspect-square overflow-hidden bg-white" aria-label={p.name}>
        <img src={p.images?.[0]} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-300 hover:scale-105" />
        {off > 0 && <span className="absolute top-2.5 right-2.5 bg-accent text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md">-{off}%</span>}
        {p.is_new && <span className="absolute top-2.5 left-2.5 bg-gold text-brand-dark text-[10px] font-extrabold px-2 py-1 rounded-md tracking-wide">NEW</span>}
      </Link>
      <div className="p-3.5 flex flex-col gap-1 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-wide text-brand/70 h-4 line-clamp-1">{category?.name || ''}</div>
        <Link to={`/product/${p.id}`} className="text-sm font-bold leading-snug line-clamp-2 min-h-10 hover:text-brand">{p.name}</Link>
        <div className="flex items-baseline gap-2 mt-0.5 h-7">
          {p.price > 0 ? <><span className="font-extrabold text-base sm:text-lg text-brand">{naira(p.price)}</span>{off > 0 && <span className="text-[11px] sm:text-xs text-slate-400 line-through">{naira(p.old_price)}</span>}</> : <span className="text-sm font-semibold text-slate-500">Price on request</span>}
        </div>
        <div className="flex items-center justify-between h-5 text-xs">
          <span className={`inline-flex items-center gap-1.5 font-semibold whitespace-nowrap ${stock.text}`}><span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />{stock.label}</span>
          {rating ? <span className="hidden sm:inline-flex items-center gap-1"><Stars value={rating.avg} size={12} /><span className="text-slate-500">({rating.count})</span></span> : null}
        </div>
        <div className="mt-auto pt-3 grid gap-1.5">
          <button onClick={add} className={`btn !py-2 !px-2 !gap-1.5 text-[13px] sm:text-sm whitespace-nowrap ${added ? 'btn-ghost !border-green-600 !text-green-700' : 'btn-primary'}`}>{added ? <><Check size={16} />In enquiry list</> : <><Plus size={16} />Add to enquiry</>}</button>
          <Link to={`/product/${p.id}`} className="text-center text-xs font-bold text-brand hover:underline py-1">View details</Link>
        </div>
      </div>
    </article>
  )
}
