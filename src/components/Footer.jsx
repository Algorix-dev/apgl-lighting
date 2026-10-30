import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useSettings, useAsync } from '../lib/hooks'
import { listCategories } from '../lib/store'
import { waLink } from '../lib/format'
import { WaIcon } from './ui'

export default function Footer() {
  const s = useSettings()
  const [cats] = useAsync(listCategories)
  return (
    <footer className="bg-brand-dark text-white mt-12">
      <div className="container-x py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="bg-white rounded-lg p-2 inline-block"><img src="/logo.jpg" alt="APGL" className="h-12" /></div>
          <p className="text-sm text-white/70 mt-3">Distributors of electrical materials. Quality lighting for homes, offices, hotels and projects.</p>
        </div>
        <div>
          <h3 className="font-bold mb-3 text-gold">Shop</h3>
          <ul className="space-y-1.5 text-sm text-white/80">
            {(cats || []).map((c) => <li key={c.id}><Link className="hover:text-white" to={`/shop?category=${c.id}`}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3 text-gold">Help</h3>
          <ul className="space-y-1.5 text-sm text-white/80">
            <li><Link className="hover:text-white" to="/order-status">Check order status</Link></li>
            <li><Link className="hover:text-white" to="/enquiry-list">My enquiry list</Link></li>
            <li><a className="hover:text-white" href={waLink(s.whatsapp, 'Hello APGL, I need a bulk quote.')} target="_blank" rel="noreferrer">Bulk / contractor quote</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3 text-gold">Contact</h3>
          <ul className="space-y-2 text-sm text-white/80">
            {s.address && <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" />{s.address}</li>}
            {s.phone && <li className="flex gap-2"><Phone size={16} className="mt-0.5" />{s.phone}</li>}
            {s.email && <li className="flex gap-2"><Mail size={16} className="mt-0.5" />{s.email}</li>}
            {s.hours && <li className="flex gap-2"><Clock size={16} className="mt-0.5" />{s.hours}</li>}
          </ul>
          <a href={waLink(s.whatsapp, 'Hello APGL')} target="_blank" rel="noreferrer" className="btn btn-wa mt-4"><WaIcon />WhatsApp us</a>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs text-white/60 py-4">© {new Date().getFullYear()} Ajay Pristine Golden Links Limited. All rights reserved.</div>
    </footer>
  )
}
