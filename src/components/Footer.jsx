import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useSettings, useCatalog } from '../lib/hooks'
import { waLink } from '../lib/format'
import { WaIcon } from './ui'

// Four balanced columns on desktop (identity, shop, support, contact); stacks on phones.
export default function Footer() {
  const s = useSettings()
  const { categories } = useCatalog()
  const head = 'text-gold font-extrabold text-sm uppercase tracking-wide mb-4'
  const a = 'text-white/75 hover:text-white text-sm'
  return (
    <footer id="contact" className="bg-brand-dark text-white mt-16">
      <div className="container-x py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div>
          <div className="bg-white rounded-lg p-2 inline-block"><img src="/logo.jpg" alt="APGL" className="h-11" /></div>
          <p className="text-sm text-white/75 mt-4 max-w-xs leading-relaxed">Ajay Pristine Golden Links Limited distributes electrical materials and quality lighting for homes, offices, hotels and commercial projects.</p>
        </div>
        <div>
          <h2 className={head}>Shop</h2>
          <ul className="space-y-2.5">
            <li><Link className={a} to="/shop">All products</Link></li>
            {categories.slice(0, 6).map((c) => <li key={c.id}><Link className={a} to={`/shop?category=${c.id}`}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className={head}>Customer support</h2>
          <ul className="space-y-2.5">
            <li><Link className={a} to="/order-status">Check order status</Link></li>
            <li><Link className={a} to="/enquiry-list">My enquiry list</Link></li>
            <li><a className={a} href={waLink(s.whatsapp, 'Hello APGL, I need a bulk / contractor quote.')} target="_blank" rel="noreferrer">Bulk / contractor quote</a></li>
            <li><a className={a} href={waLink(s.whatsapp, 'Hello APGL')} target="_blank" rel="noreferrer">Contact us</a></li>
          </ul>
        </div>
        <div>
          <h2 className={head}>Contact</h2>
          <ul className="space-y-3 text-sm text-white/80">
            <li><a href={waLink(s.whatsapp, 'Hello APGL')} target="_blank" rel="noreferrer" className="btn btn-wa !py-2 text-sm"><WaIcon size={17} />Chat on WhatsApp</a></li>
            {s.phone && <li className="flex gap-2.5"><Phone size={16} className="mt-0.5 shrink-0" /><a href={`tel:${s.phone.replace(/\s/g, '')}`} className="hover:text-white">{s.phone}</a></li>}
            {s.email && <li className="flex gap-2.5"><Mail size={16} className="mt-0.5 shrink-0" /><a href={`mailto:${s.email}`} className="hover:text-white break-all">{s.email}</a></li>}
            {s.address && <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0" />{s.address}</li>}
            {s.hours && <li className="flex gap-2.5"><Clock size={16} className="mt-0.5 shrink-0" />{s.hours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10"><div className="container-x py-4 text-xs text-white/60 text-center sm:text-left">© {new Date().getFullYear()} Ajay Pristine Golden Links Limited. All rights reserved.</div></div>
    </footer>
  )
}
