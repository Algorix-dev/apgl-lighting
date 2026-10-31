import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ClipboardList, Menu, X, PackageSearch, Search } from 'lucide-react'
import { useSettings, useEnquiry, useCatalog } from '../lib/hooks'
import { waLink } from '../lib/format'
import { WaIcon } from './ui'
import SearchBox from './SearchBox'

export default function Header() {
  const s = useSettings()
  const { items } = useEnquiry()
  const { categories } = useCatalog()
  const { pathname, search } = useLocation()
  const [menu, setMenu] = useState(false)
  const [mSearch, setMSearch] = useState(false)
  useEffect(() => { setMenu(false); setMSearch(false) }, [pathname, search])

  const cat = new URLSearchParams(search).get('category')
  const onShop = pathname === '/shop'
  const goContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  const link = (active) => `px-3.5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${active ? 'border-gold text-white' : 'border-transparent text-white/80 hover:text-white'}`

  return (
    <header className="sticky top-0 z-40">
      {s.announcement && <div className="bg-brand-dark text-white/90 text-xs text-center py-1.5 px-3 leading-snug">{s.announcement}</div>}

      <div className="bg-white border-b border-slate-200">
        <div className="container-x flex items-center gap-3 py-2.5">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}>{menu ? <X /> : <Menu />}</button>
          <Link to="/" className="shrink-0" aria-label="APGL home"><img src="/logo.jpg" alt="APGL - Ajay Pristine Golden Links Limited" className="h-9 sm:h-12 w-auto" /></Link>
          <div className="hidden md:block flex-1 max-w-2xl mx-auto"><SearchBox /></div>

          <nav aria-label="Account shortcuts" className="ml-auto flex items-center gap-1 sm:gap-2">
            <button className="md:hidden p-2" onClick={() => setMSearch(!mSearch)} aria-label="Search"><Search size={21} /></button>
            <Link to="/order-status" className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 text-sm font-semibold hover:text-brand"><PackageSearch size={19} />Order status</Link>
            <Link to="/enquiry-list" className="relative flex items-center gap-1.5 px-2.5 py-2 text-sm font-semibold hover:text-brand" aria-label={`Enquiry list, ${items.length} items`}>
              <ClipboardList size={21} /><span className="hidden lg:inline">Enquiry list</span>
              {items.length > 0 && <span className="absolute -top-0.5 left-6 bg-accent text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">{items.length}</span>}
            </Link>
            <a href={waLink(s.whatsapp, 'Hello APGL, I need help choosing a light.')} target="_blank" rel="noreferrer" className="hidden sm:inline-flex btn btn-wa !py-2 !px-3.5 text-sm"><WaIcon size={17} />WhatsApp</a>
          </nav>
        </div>
        {mSearch && <div className="md:hidden container-x pb-3"><SearchBox autoFocus /></div>}
      </div>

      <nav aria-label="Categories" className="bg-brand hidden lg:block">
        <div className="container-x flex overflow-x-auto scrollbar-none">
          <Link to="/" className={link(pathname === '/')}>Home</Link>
          <Link to="/shop" className={link(onShop && !cat)}>All products</Link>
          {categories.map((c) => <Link key={c.id} to={`/shop?category=${c.id}`} className={link(onShop && cat === c.id)}>{c.name}</Link>)}
          <button onClick={goContact} className={link(false) + ' ml-auto'}>Contact</button>
        </div>
      </nav>

      {menu && (
        <nav aria-label="Mobile menu" className="lg:hidden bg-white border-b shadow-lg max-h-[70vh] overflow-y-auto">
          {[['/', 'Home'], ['/shop', 'All products'], ...categories.map((c) => [`/shop?category=${c.id}`, c.name]), ['/order-status', 'Check order status']].map(([to, label]) => (
            <Link key={to} to={to} className="block px-5 py-3.5 border-b border-slate-100 font-semibold">{label}</Link>
          ))}
          <button onClick={() => { setMenu(false); setTimeout(goContact, 50) }} className="block w-full text-left px-5 py-3.5 border-b border-slate-100 font-semibold">Contact</button>
          <a href={waLink(s.whatsapp, 'Hello APGL')} className="flex items-center gap-2 px-5 py-3.5 text-green-700 font-bold"><WaIcon />Chat on WhatsApp</a>
        </nav>
      )}
    </header>
  )
}
