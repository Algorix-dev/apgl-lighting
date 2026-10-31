import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Phone, Share2, Plus, Minus, Check, PackageX } from 'lucide-react'
import { listReviews, addReview, logEnquiry } from '../lib/store'
import { useAsync, useSettings, useEnquiry, useCatalog } from '../lib/hooks'
import { naira, discountPct, waLink, STOCK } from '../lib/format'
import { useSeo, siteUrl } from '../lib/seo'
import { Stars, StarPicker, Breadcrumbs, WaIcon, Skeleton, EmptyState } from '../components/ui'
import { useToast } from '../components/Toast'
import ProductCard from '../components/ProductCard'

export default function Product() {
  const { id } = useParams()
  const s = useSettings()
  const enq = useEnquiry()
  const toast = useToast()
  const { products, categories, ratings, loading } = useCatalog()
  const p = products.find((x) => x.id === id)
  const cat = categories.find((c) => c.id === p?.category_id)
  const [reviews, , reload] = useAsync(() => listReviews({ productId: id }), [id])
  const [img, setImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('desc')
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' })
  const [sent, setSent] = useState(false)
  useEffect(() => { setImg(0); setQty(1); setTab('desc'); setSent(false) }, [id])

  const avg = reviews?.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0
  const url = `${siteUrl()}/product/${id}`
  const abs = (u) => (u?.startsWith('http') ? u : siteUrl() + u)

  useSeo({
    title: p ? `${p.name} | APGL` : 'Product | APGL',
    description: p ? `${p.name}${cat ? ` - ${cat.name}` : ''}. ${(p.description || '').slice(0, 120)} Enquire on WhatsApp.` : undefined,
    image: p?.images?.[0], path: `/product/${id}`, type: 'product',
    jsonLd: p && [
      { '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: (p.images || []).map(abs), description: p.description || p.name, ...(cat ? { category: cat.name } : {}), brand: { '@type': 'Brand', name: 'APGL' },
        ...(p.price > 0 ? { offers: { '@type': 'Offer', url, priceCurrency: 'NGN', price: p.price, availability: `https://schema.org/${p.stock_status === 'out_of_stock' ? 'OutOfStock' : 'InStock'}` } } : {}),
        ...(reviews?.length ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: reviews.length } } : {}) },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }, ...(cat ? [{ name: cat.name, path: `/shop?category=${cat.id}` }] : []), { name: p.name, path: `/product/${id}` }].map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: siteUrl() + x.path })) },
    ],
  })

  const related = useMemo(() => products.filter((x) => x.category_id === p?.category_id && x.id !== id).slice(0, 4), [products, p, id])

  if (loading) return <div className="container-x pt-8 grid md:grid-cols-2 gap-8"><Skeleton className="aspect-square" /><div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-12" /></div></div>
  if (!p) return <div className="container-x pt-10"><EmptyState icon={PackageX} title="Product not found" text="It may have been removed or the link is incorrect."><Link to="/shop" className="btn btn-primary">Browse products</Link></EmptyState></div>

  const off = discountPct(p.price, p.old_price)
  const stock = STOCK[p.stock_status] || STOCK.in_stock
  const specs = Object.entries(p.specs || {})
  const enquire = () => {
    logEnquiry(p.id)
    window.open(waLink(s.whatsapp, `Hello APGL, I'd like to enquire about:\n*${p.name}* x${qty}${p.price > 0 ? `\nPrice: ${naira(p.price)} each` : ''}\n${url}\nIs it available? What are the delivery options?`), '_blank')
  }
  const share = async () => { try { if (navigator.share) await navigator.share({ title: p.name, url }); else { await navigator.clipboard.writeText(url); toast('Link copied') } } catch { /* cancelled */ } }
  const submit = async (e) => { e.preventDefault(); await addReview({ ...form, product_id: p.id }); setSent(true); setForm({ name: '', rating: 5, comment: '' }); reload() }
  const dist = [5, 4, 3, 2, 1].map((n) => [n, (reviews || []).filter((r) => r.rating === n).length])

  return (
    <div className="container-x pt-5">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, ...(cat ? [{ label: cat.name, to: `/shop?category=${cat.id}` }] : []), { label: p.name }]} />

      <div className="card p-4 sm:p-7 grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square rounded-xl border border-slate-200 bg-white grid place-items-center overflow-hidden"><img src={p.images?.[img]} alt={p.name} className="max-h-full max-w-full object-contain" /></div>
          {p.images?.length > 1 && <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">{p.images.map((u, n) => <button key={n} onClick={() => setImg(n)} aria-label={`Photo ${n + 1}`} className={`w-[4.5rem] h-[4.5rem] shrink-0 rounded-lg border-2 bg-white ${n === img ? 'border-brand' : 'border-slate-200'}`}><img src={u} alt="" className="w-full h-full object-contain p-1" /></button>)}</div>}
        </div>

        <div>
          {cat && <Link to={`/shop?category=${cat.id}`} className="text-xs font-extrabold uppercase tracking-wide text-brand/70 hover:text-brand">{cat.name}</Link>}
          <div className="flex items-start justify-between gap-3"><h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mt-1">{p.name}</h1><button onClick={share} className="p-2 rounded-full hover:bg-slate-100 shrink-0" aria-label="Share this product"><Share2 size={20} /></button></div>
          <button onClick={() => setTab('reviews')} className="flex items-center gap-2 mt-2 text-sm"><Stars value={avg} /><span className="text-brand font-semibold">{reviews?.length ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}` : 'No reviews yet'}</span></button>
          <div className="flex items-end gap-3 mt-5 flex-wrap">
            {p.price > 0 ? <><span className="text-3xl font-extrabold text-brand">{naira(p.price)}</span>{off > 0 && <><span className="text-slate-400 line-through">{naira(p.old_price)}</span><span className="bg-accent text-white font-extrabold text-xs px-2 py-1 rounded-md">-{off}%</span></>}</> : <span className="text-xl font-extrabold text-slate-600">Price on request</span>}
          </div>
          <span className={`inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-3 py-1 rounded-full ${stock.cls}`}><span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />{stock.label}</span>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-bold">Quantity</span>
            <div className="flex items-center border border-slate-300 rounded-lg bg-white">
              <button className="p-2.5" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"><Minus size={16} /></button>
              <input value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 text-center font-bold outline-none" inputMode="numeric" aria-label="Quantity" />
              <button className="p-2.5" onClick={() => setQty(qty + 1)} aria-label="Increase quantity"><Plus size={16} /></button>
            </div>
          </div>
          <div className="mt-4 grid gap-2.5">
            <button onClick={() => { enq.add(p.id, qty); toast(`Added ${qty} to your enquiry list`) }} className="btn btn-primary !py-3.5 text-base">{enq.has(p.id) ? <><Check size={19} />Add {qty} more to enquiry list</> : <><Plus size={19} />Add to enquiry list</>}</button>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={enquire} className="btn btn-wa !py-3"><WaIcon size={18} />Enquire on WhatsApp</button>
              <a href={`tel:${(s.phone || '').replace(/\s/g, '')}`} className="btn btn-ghost !py-3"><Phone size={17} />Call us</a>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Prices may vary with quantity. Message us for bulk or project pricing.</p>
          {specs.length > 0 && <dl className="mt-5 pt-5 border-t text-sm grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">{specs.slice(0, 4).map(([k, v]) => <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>}
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex border-b overflow-x-auto scrollbar-none" role="tablist">
          {[['desc', 'Description'], ['specs', 'Specifications'], ['reviews', `Reviews (${reviews?.length || 0})`]].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-5 py-3.5 font-extrabold text-sm whitespace-nowrap border-b-2 -mb-px ${tab === k ? 'border-brand text-brand' : 'border-transparent text-slate-500'}`}>{l}</button>
          ))}
        </div>
        <div className="p-5 sm:p-7">
          {tab === 'desc' && <p className="whitespace-pre-line leading-relaxed max-w-3xl">{p.description || 'No description yet.'}</p>}
          {tab === 'specs' && (specs.length ? <table className="w-full max-w-xl text-sm"><tbody>{specs.map(([k, v]) => <tr key={k} className="odd:bg-slate-50"><th scope="row" className="p-3 font-bold text-left w-1/3">{k}</th><td className="p-3">{v}</td></tr>)}</tbody></table> : <p className="text-slate-500">No specifications listed.</p>)}
          {tab === 'reviews' && (
            <div className="grid md:grid-cols-[260px_1fr] gap-8">
              <div>
                <div className="text-5xl font-extrabold">{avg ? avg.toFixed(1) : '–'}<span className="text-lg text-slate-400">/5</span></div>
                <Stars value={avg} size={18} />
                <div className="mt-4 space-y-1.5">{dist.map(([n, c]) => <div key={n} className="flex items-center gap-2 text-xs"><span className="w-3">{n}</span><div className="flex-1 h-2 bg-slate-100 rounded"><div className="h-2 bg-gold rounded" style={{ width: reviews?.length ? `${(c / reviews.length) * 100}%` : 0 }} /></div><span className="w-4 text-slate-500">{c}</span></div>)}</div>
              </div>
              <div>
                <div className="space-y-4">
                  {(reviews || []).map((r) => <div key={r.id} className="border-b pb-4"><div className="flex items-center gap-2"><Stars value={r.rating} /><span className="font-bold text-sm">{r.name}</span></div><p className="mt-1.5 text-sm">{r.comment}</p><p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</p></div>)}
                  {!reviews?.length && <p className="text-slate-500">Be the first to review this product.</p>}
                </div>
                <form onSubmit={submit} className="mt-6 bg-slate-50 rounded-xl p-4 grid gap-3">
                  <h3 className="font-extrabold">Write a review</h3>
                  {sent && <p className="text-green-700 text-sm font-semibold">Thank you! Your review will appear once approved.</p>}
                  <StarPicker value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
                  <input required className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <textarea required rows={3} className="input" placeholder="How was the product?" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
                  <button className="btn btn-primary w-fit">Submit review</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && <section className="mt-10"><h2 className="font-extrabold text-xl mb-4">You may also like</h2><div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{related.map((x) => <ProductCard key={x.id} p={x} rating={ratings[x.id]} category={cat} />)}</div></section>}
    </div>
  )
}
