import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Headset, Boxes, Truck, ArrowRight, Lightbulb, CheckCircle2, PackageOpen } from 'lucide-react'
import { useCatalog, useSettings } from '../lib/hooks'
import { waLink } from '../lib/format'
import { useSeo, siteUrl } from '../lib/seo'
import ProductCard from '../components/ProductCard'
import { Skeleton, ProductGridSkeleton, EmptyState, WaIcon } from '../components/ui'

// TIP: the hero uses fixed brand photos from /public/brand (hero-1/2/3.jpg), NOT database products,
// so the homepage never looks empty. Replace those three files with your best photos to change the look.
const HERO = ['/brand/hero-1.jpg', '/brand/hero-2.jpg', '/brand/hero-3.jpg']
const TRUST = [
  [ShieldCheck, 'Genuine quality products', 'Lighting you can rely on'],
  [Headset, 'WhatsApp support', 'Talk to a real person'],
  [Boxes, 'Bulk & contractor pricing', 'Ask for a project quote'],
  [Truck, 'Delivery available', 'Ask us about your location'], // TIP: edit these 4 lines to match what APGL really offers
]

export default function Home() {
  const s = useSettings()
  const { products, categories, ratings, loading, error, reload } = useCatalog()
  const [chip, setChip] = useState('')

  useSeo({
    title: 'APGL | Lighting & Electrical Materials in Nigeria',
    description: 'Chandeliers, pendant lights, wall lights, ceiling lights and electrical materials from Ajay Pristine Golden Links Limited. Bulk and contractor pricing. Enquire on WhatsApp.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Organization', name: 'Ajay Pristine Golden Links Limited', alternateName: 'APGL',
      url: siteUrl(), logo: siteUrl() + '/logo.jpg', description: 'Distributors of electrical materials and lighting products.',
      ...(s.phone ? { telephone: s.phone } : {}), ...(s.email ? { email: s.email } : {}), ...(s.address ? { address: { '@type': 'PostalAddress', streetAddress: s.address } } : {}),
    },
  })

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
  const counts = useMemo(() => { const o = {}; products.forEach((p) => { o[p.category_id] = (o[p.category_id] || 0) + 1 }); return o }, [products])
  const cards = categories.filter((c) => counts[c.id])
  const imgFor = (c) => c.image_url || products.find((p) => p.category_id === c.id)?.images?.[0]
  const showcase = useMemo(() => {
    const rank = (p) => (p.featured ? 0 : 1)
    return [...products].filter((p) => !chip || p.category_id === chip).sort((a, b) => rank(a) - rank(b) || new Date(b.created_at) - new Date(a.created_at)).slice(0, 8)
  }, [products, chip])

  const quote = waLink(s.whatsapp, 'Hello APGL, I would like to request a quote for a project.\nProject type:\nLocation:\nProducts needed:\nApproximate quantities:')

  return (
    <>
      {/* HERO */}
      <section className="bg-brand-dark text-white">
        <div className="container-x grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center py-10 lg:py-14">
          <div>
            <span className="inline-block text-gold text-xs font-extrabold tracking-widest uppercase">Lighting &amp; electrical materials</span>
            <h1 className="text-[2rem] sm:text-5xl font-extrabold leading-[1.1] mt-3">Illuminate every space. Elevate every experience.</h1>
            <p className="text-white/80 mt-4 text-base sm:text-lg max-w-xl leading-relaxed">Discover quality lighting and electrical solutions for homes, offices, hotels and commercial projects.</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/shop" className="btn btn-gold !px-6 !py-3">Explore products <ArrowRight size={18} /></Link>
              <a href={quote} target="_blank" rel="noreferrer" className="btn btn-outline-light !px-6 !py-3">Request a project quote</a>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-7 text-sm text-white/75">
              {['Homes', 'Offices', 'Hotels', 'Estates'].map((x) => <li key={x} className="inline-flex items-center gap-1.5"><CheckCircle2 size={16} className="text-gold" />{x}</li>)}
            </ul>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-3 h-64 sm:h-[22rem] lg:h-[26rem]">
            <img src={HERO[0]} alt="Crystal chandelier" className="row-span-2 w-full h-full object-cover rounded-2xl" />
            <img src={HERO[1]} alt="Ring chandelier" className="w-full h-full object-cover rounded-2xl" />
            <img src={HERO[2]} alt="Gold table lamp" className="w-full h-full object-cover rounded-2xl" />
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section aria-label="Why APGL" className="bg-white border-b border-slate-200">
        <ul className="container-x grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 py-4">
          {TRUST.map(([Icon, t, d]) => (
            <li key={t} className="flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-brand/10 text-brand grid place-items-center shrink-0"><Icon size={19} /></span><div><div className="text-sm font-extrabold leading-tight">{t}</div><div className="text-xs text-slate-500 hidden sm:block">{d}</div></div></li>
          ))}
        </ul>
      </section>

      <div className="container-x">
        {error && <div className="card p-4 mt-8 flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-accent font-semibold">We could not load the catalogue.</span><button className="btn btn-ghost !py-2 text-sm" onClick={reload}>Try again</button></div>}

        {/* CATEGORIES */}
        {(loading || cards.length > 0) && (
          <section className="mt-12" aria-labelledby="cat-h">
            <div className="flex items-end justify-between mb-5"><div><h2 id="cat-h" className="text-2xl font-extrabold">Shop by category</h2><p className="text-slate-500 text-sm mt-1">Find the right fitting for every room and project.</p></div></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />) : cards.slice(0, 8).map((c) => (
                <Link key={c.id} to={`/shop?category=${c.id}`} className="card card-hover overflow-hidden group">
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    {imgFor(c) ? <img src={imgFor(c)} alt={c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full grid place-items-center text-slate-300"><Lightbulb size={40} /></div>}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3.5"><div><div className="font-extrabold text-sm sm:text-base leading-tight">{c.name}</div><div className="text-xs text-slate-500">{counts[c.id]} product{counts[c.id] > 1 ? 's' : ''}</div></div><ArrowRight size={18} className="text-brand shrink-0 group-hover:translate-x-1 transition-transform" /></div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FEATURED PRODUCTS */}
        <section className="mt-14" aria-labelledby="feat-h">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div><h2 id="feat-h" className="text-2xl font-extrabold">Explore our lighting collection</h2><p className="text-slate-500 text-sm mt-1">Find the perfect lighting solutions for your space.</p></div>
            <Link to="/shop" className="text-sm font-extrabold text-brand inline-flex items-center gap-1 hover:underline">View all products <ArrowRight size={16} /></Link>
          </div>
          {cards.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3 -mx-1 px-1" role="tablist" aria-label="Filter products by category">
              {[{ id: '', name: 'All' }, ...cards].map((c) => (
                <button key={c.id} role="tab" aria-selected={chip === c.id} onClick={() => setChip(c.id)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border transition-colors ${chip === c.id ? 'bg-brand text-white border-brand' : 'bg-white text-slate-700 border-slate-200 hover:border-brand'}`}>{c.name}</button>
              ))}
            </div>
          )}
          {loading ? <ProductGridSkeleton /> : showcase.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">{showcase.map((p) => <ProductCard key={p.id} p={p} rating={ratings[p.id]} category={catMap[p.category_id]} />)}</div>
          ) : (
            <EmptyState icon={PackageOpen} title="Our catalogue is being updated" text="New lighting products are being added. Message us and we will help you find what you need.">
              <a href={waLink(s.whatsapp, 'Hello APGL, what lighting products do you have available?')} target="_blank" rel="noreferrer" className="btn btn-wa"><WaIcon />Ask on WhatsApp</a>
            </EmptyState>
          )}
        </section>

        {/* CONTRACTORS */}
        <section className="mt-14 rounded-2xl overflow-hidden bg-brand text-white grid md:grid-cols-2" aria-labelledby="proj-h">
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <span className="text-gold text-xs font-extrabold tracking-widest uppercase">Contractors &amp; businesses</span>
            <h2 id="proj-h" className="text-2xl sm:text-3xl font-extrabold mt-2 leading-tight">Lighting solutions for your next project</h2>
            <p className="text-white/80 mt-3 leading-relaxed">Planning a hotel, estate, office or construction project? Get in touch with APGL for bulk pricing and tailored product quotations.</p>
            <ul className="mt-4 space-y-2 text-sm text-white/90">{['Bulk and contractor pricing', 'Tailored product quotations', 'Help choosing the right fittings'].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 size={17} className="text-gold shrink-0 mt-0.5" />{x}</li>)}</ul>
            <div className="mt-6"><a href={quote} target="_blank" rel="noreferrer" className="btn btn-gold !px-6 !py-3">Request a project quote</a></div>
          </div>
          <div className="relative min-h-56"><img src="/brand/project.jpg" alt="Modern linear LED lighting installed in a dining area" loading="lazy" className="absolute inset-0 w-full h-full object-cover" /></div>
        </section>

        {/* SUPPORT */}
        <section className="mt-8 card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4" aria-labelledby="help-h">
          <div><h2 id="help-h" className="text-xl font-extrabold">Need help choosing the right lighting?</h2><p className="text-slate-500 text-sm mt-1">Our team is available to help you find suitable lighting products for your space.</p></div>
          <a href={waLink(s.whatsapp, 'Hello APGL, I need help choosing lighting for my space.')} target="_blank" rel="noreferrer" className="btn btn-wa !px-6 !py-3"><WaIcon />Chat with APGL</a>
        </section>
      </div>
    </>
  )
}
