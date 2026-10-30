import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ClipboardList, Menu, X, PackageSearch, Phone } from 'lucide-react'
import { useSettings, useEnquiry, useAsync } from '../lib/hooks'
import { listCategories } from '../lib/store'
import { waLink } from '../lib/format'
import { WaIcon } from './ui'

export default function Header() {
  const s = useSettings()
  const { items } = useEnquiry()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [cats] = useAsync(listCategories)

  const search = (e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(q)}`); setOpen(false) }

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {s.announcement && (
        <div className="bg-brand-dark text-white text-xs sm:text-sm text-center py-1.5 px-3">{s.announcement}</div>
      )}
      <div className="bg-white">
        <div className="container-x flex items-center gap-3 py-2.5">
          <button className="lg:hidden p-1" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
          <Link to="/" className="shrink-0"><img src="/logo.jpg" alt="APGL" className="h-10 sm:h-14 w-auto" /></Link>

          <form onSubmit={search} className="hidden md:flex flex-1 max-w-2xl">
            <input value={q} onChange={(e) => setQ(e.target.value)} className="input !rounded-r-none" placeholder="Search chandeliers, pendants, wall lights…" />
            <button className="btn btn-primary !rounded-l-none px-5"><Search size={18} />Search</button>
          </form>

          <nav className="ml-auto flex items-center gap-1 sm:gap-3 text-sm font-semibold">
            <a href={waLink(s.whatsapp, 'Hello APGL, I need help choosing a light.')} target="_blank" rel="noreferrer" className="hidden sm:flex btn btn-wa !py-2"><WaIcon />Chat with us</a>
            <Link to="/order-status" className="hidden lg:flex items-center gap-1.5 px-2 hover:text-brand"><PackageSearch size={20} />Order status</Link>
            <Link to="/enquiry-list" className="relative flex items-center gap-1.5 px-2 hover:text-brand">
              <ClipboardList size={22} /><span className="hidden lg:inline">Enquiry list</span>
              {items.length > 0 && <span className="absolute -top-1 left-5 bg-accent text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">{items.length}</span>}
            </Link>
          </nav>
        </div>

        <form onSubmit={search} className="md:hidden container-x pb-2.5 flex">
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input !rounded-r-none" placeholder="Search lights…" />
          <button className="btn btn-primary !rounded-l-none"><Search size={18} /></button>
        </form>
      </div>

      {/* Category bar — TIP: change `bg-brand` to `bg-brand-dark` for a darker strip */}
      <div className="bg-brand text-white hidden lg:block">
        <div className="container-x flex gap-1 overflow-x-auto scrollbar-none">
          <NavLink to="/shop" end className="px-3 py-2.5 text-sm font-bold hover:bg-white/10 whitespace-nowrap">All products</NavLink>
          {(cats || []).map((c) => (
            <NavLink key={c.id} to={`/shop?category=${c.id}`} className="px-3 py-2.5 text-sm font-medium hover:bg-white/10 whitespace-nowrap">{c.name}</NavLink>
          ))}
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t max-h-[70vh] overflow-y-auto">
          <Link onClick={() => setOpen(false)} to="/shop" className="block px-4 py-3 font-bold border-b">All products</Link>
          {(cats || []).map((c) => (
            <Link onClick={() => setOpen(false)} key={c.id} to={`/shop?category=${c.id}`} className="block px-4 py-3 border-b">{c.name}</Link>
          ))}
          <Link onClick={() => setOpen(false)} to="/order-status" className="block px-4 py-3 border-b text-brand font-semibold">Check order status</Link>
          <a href={waLink(s.whatsapp, 'Hello APGL')} className="flex items-center gap-2 px-4 py-3 text-green-600 font-bold"><WaIcon />Chat on WhatsApp</a>
        </div>
      )}
    </header>
  )
}
