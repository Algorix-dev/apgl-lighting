import { Link } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import { naira, discountPct, waLink } from '../lib/format'
import { useSettings, useEnquiry } from '../lib/hooks'
import { logEnquiry } from '../lib/store'
import { Stars, WaIcon } from './ui'

export default function ProductCard({ p, rating }) {
  const { whatsapp } = useSettings()
  const enq = useEnquiry()
  const off = discountPct(p.price, p.old_price)
  const soldOut = p.stock_status === 'out_of_stock'

  const enquire = () => {
    logEnquiry(p.id)
    const url = `${location.origin}/product/${p.id}`
    window.open(waLink(whatsapp, `Hello APGL, I'm interested in *${p.name}* (${naira(p.price)}).\n${url}\nIs it available?`), '_blank')
  }

  return (
    <div className="group bg-white rounded-lg overflow-hidden border border-transparent hover:border-brand/30 hover:shadow-lg transition flex flex-col">
      <Link to={`/product/${p.id}`} className="relative block aspect-square bg-white">
        <img src={p.images?.[0]} alt={p.name} loading="lazy" className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300" />
        {off > 0 && <span className="absolute top-2 right-2 bg-accent/10 text-accent text-xs font-extrabold px-2 py-1 rounded">-{off}%</span>}
        {p.is_new && <span className="absolute top-2 left-2 bg-gold text-white text-[10px] font-extrabold px-2 py-1 rounded">NEW</span>}
        {soldOut && <span className="absolute inset-x-0 bottom-0 bg-slate-800/80 text-white text-xs text-center py-1">Out of stock</span>}
      </Link>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <Link to={`/product/${p.id}`} className="text-sm font-medium line-clamp-2 min-h-10 hover:text-brand">{p.name}</Link>
        <div className="font-extrabold text-lg text-brand">{naira(p.price)}</div>
        <div className="h-4 text-xs text-slate-400 line-through">{off > 0 ? naira(p.old_price) : ''}</div>
        <div className="flex items-center gap-1 h-4">
          {rating ? <><Stars value={rating.avg} size={12} /><span className="text-xs text-slate-500">({rating.count})</span></> : null}
        </div>
        <div className="mt-auto pt-2 flex gap-2">
          <button onClick={enquire} className="btn btn-wa flex-1 !py-2 text-sm"><WaIcon size={16} />Enquire</button>
          <button onClick={() => enq.add(p.id)} title="Add to enquiry list" className="btn btn-ghost !px-2.5 !py-2">
            {enq.has(p.id) ? <Check size={18} className="text-green-600" /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
