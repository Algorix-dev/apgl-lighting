import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, MessageCircle, Boxes, Truck, ChevronLeft, ChevronRight } from 'lucide-react'
import { listProducts, listCategories, ratingsMap } from '../lib/store'
import { useAsync, useSettings } from '../lib/hooks'
import { naira, waLink } from '../lib/format'
import ProductCard from '../components/ProductCard'
import { SectionHead, Loading, WaIcon } from '../components/ui'

function Hero({ products }) {
  const slides = products.filter((p) => p.featured).slice(0, 4)
  const [i, setI] = useState(0)
  // TIP: change 5000 to speed up / slow down the auto-slide (milliseconds)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % Math.max(slides.length, 1)), 5000); return () => clearInterval(t) }, [slides.length])
  const s = slides[i]
  if (!s) return <div className="bg-brand rounded-lg h-72" />
  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-brand-dark via-brand to-sky text-white h-72 sm:h-80 lg:h-[22rem]">
      <div className="absolute inset-0 grid grid-rows-1 sm:grid-cols-2 items-center">
        <div className="p-6 sm:p-10 z-10">
          <span className="bg-gold text-brand-dark text-xs font-extrabold px-2.5 py-1 rounded">FEATURED</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mt-3 leading-tight">{s.name}</h1>
          <p className="mt-2 text-white/80">From <b className="text-gold text-xl">{naira(s.price)}</b></p>
          <Link to={`/product/${s.id}`} className="btn bg-accent hover:brightness-110 text-white mt-5">View product</Link>
        </div>
        <div className="hidden sm:flex h-full min-h-0 items-center justify-center p-6">
          <img src={s.images?.[0]} alt={s.name} className="max-h-full max-w-full object-contain bg-white rounded-xl p-2 shadow-2xl" />
        </div>
      </div>
      {slides.length > 1 && (<>
        <button onClick={() => setI((i - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-1.5"><ChevronLeft /></button>
        <button onClick={() => setI((i + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-1.5"><ChevronRight /></button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">{slides.map((_, n) => <span key={n} className={`h-2 rounded-full transition-all ${n === i ? 'w-6 bg-gold' : 'w-2 bg-white/50'}`} />)}</div>
      </>)}
    </div>
  )
}

function Row({ title, color, items, ratings, to }) {
  if (!items.length) return null
  return (
    <section className="mt-8">
      <SectionHead title={title} color={color}>{to && <Link to={to} className="text-sm font-bold hover:underline">See all ›</Link>}</SectionHead>
      <div className="bg-slate-100 rounded-b-lg p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {items.map((p) => <ProductCard key={p.id} p={p} rating={ratings[p.id]} />)}
      </div>
    </section>
  )
}

export default function Home() {
  const [products, loading] = useAsync(listProducts)
  const [cats] = useAsync(listCategories)
  const [ratings] = useAsync(ratingsMap)
  const s = useSettings()
  if (loading || !products) return <Loading />
  const r = ratings || {}
  const deals = products.filter((p) => p.old_price > p.price).slice(0, 10)
  const fresh = products.filter((p) => p.is_new).slice(0, 5)
  const trust = [
    [ShieldCheck, 'Quality assured', 'Genuine lighting products'],
    [MessageCircle, 'WhatsApp support', 'Fast replies, real people'],
    [Boxes, 'Bulk & contractor prices', 'Ask for a project quote'],
    [Truck, 'Delivery available', 'We ship to your location'], // TIP: edit these 4 lines to match what the client really offers
  ]
  return (
    <div className="container-x pt-4">
      <div className="grid lg:grid-cols-[230px_1fr_230px] gap-3">
        <aside className="hidden lg:block bg-white rounded-lg overflow-hidden">
          {(cats || []).map((c) => (
            <Link key={c.id} to={`/shop?category=${c.id}`} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 hover:text-brand text-sm font-medium border-b border-slate-100 last:border-0">
              <img src={c.image_url} alt="" className="w-8 h-8 rounded object-cover bg-slate-100" />{c.name}
            </Link>
          ))}
        </aside>
        <Hero products={products} />
        <div className="hidden lg:flex flex-col gap-3">
          <a href={waLink(s.whatsapp, 'Hello APGL, I need a quote for a project.')} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-white p-4 flex flex-col justify-center">
            <WaIcon size={32} /><b className="mt-2 text-lg leading-tight">Need help choosing?</b><span className="text-sm text-white/90">Chat with us on WhatsApp</span>
          </a>
          <div className="flex-1 rounded-lg bg-gradient-to-br from-accent to-red-800 text-white p-4 flex flex-col justify-center">
            <b className="text-lg leading-tight">Contractors & projects</b><span className="text-sm text-white/90 mt-1">Special bulk prices for hotels, estates and offices.</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg mt-4 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
        {trust.map(([Icon, t, d]) => (
          <div key={t} className="flex items-center gap-3 p-3"><Icon className="text-brand shrink-0" /><div><div className="text-sm font-bold">{t}</div><div className="text-xs text-slate-500">{d}</div></div></div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="font-extrabold text-xl mb-3">Shop by category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {(cats || []).map((c) => (
            <Link key={c.id} to={`/shop?category=${c.id}`} className="bg-white rounded-lg p-2 text-center hover:shadow-lg hover:-translate-y-0.5 transition">
              <img src={c.image_url} alt={c.name} loading="lazy" className="aspect-square w-full object-cover rounded-md bg-slate-100" />
              <div className="text-xs sm:text-sm font-bold mt-2 leading-tight">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <Row title="🔥 Hot Deals" color="bg-accent" items={deals} ratings={r} to="/shop?sort=discount" />
      <Row title="New Arrivals" color="bg-brand" items={fresh} ratings={r} to="/shop?sort=newest" />
      <Row title="All Lighting" color="bg-brand-dark" items={products.slice(0, 10)} ratings={r} to="/shop" />
    </div>
  )
}
