import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Phone, Share2, Plus, Check } from 'lucide-react'
import { getProduct, listProducts, listCategories, listReviews, addReview, logEnquiry, ratingsMap } from '../lib/store'
import { useAsync, useSettings, useEnquiry } from '../lib/hooks'
import { naira, discountPct, waLink, STOCK } from '../lib/format'
import { Stars, StarPicker, Loading, WaIcon } from '../components/ui'
import ProductCard from '../components/ProductCard'

export default function Product() {
  const { id } = useParams()
  const s = useSettings()
  const enq = useEnquiry()
  const [p, loading] = useAsync(() => getProduct(id), [id])
  const [cats] = useAsync(listCategories)
  const [all] = useAsync(listProducts)
  const [reviews, , reload] = useAsync(() => listReviews({ productId: id }), [id])
  const [ratings] = useAsync(ratingsMap)
  const [img, setImg] = useState(0)
  const [tab, setTab] = useState('desc')
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => { setImg(0); setTab('desc'); setSent(false) }, [id])
  useEffect(() => { if (p) document.title = `${p.name} | APGL` }, [p])

  if (loading) return <Loading />
  if (!p || !p.visible) return <div className="container-x py-20 text-center">Product not found. <Link to="/shop" className="text-brand font-bold">Back to shop</Link></div>

  const cat = (cats || []).find((c) => c.id === p.category_id)
  const off = discountPct(p.price, p.old_price)
  const avg = reviews?.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0
  const stock = STOCK[p.stock_status] || STOCK.in_stock
  const url = `${location.origin}/product/${p.id}`
  const related = (all || []).filter((x) => x.category_id === p.category_id && x.id !== p.id).slice(0, 5)

  const enquire = () => {
    logEnquiry(p.id)
    window.open(waLink(s.whatsapp, `Hello APGL, I'm interested in *${p.name}* (${naira(p.price)}).\n${url}\nIs it available? What are the delivery options?`), '_blank')
  }
  const share = async () => { try { navigator.share ? await navigator.share({ title: p.name, url }) : await navigator.clipboard.writeText(url) } catch {} }
  const submit = async (e) => {
    e.preventDefault()
    await addReview({ ...form, product_id: p.id })
    setSent(true); setForm({ name: '', rating: 5, comment: '' }); reload()
  }
  const dist = [5, 4, 3, 2, 1].map((n) => [n, (reviews || []).filter((r) => r.rating === n).length])
  const specs = Object.entries(p.specs || {})

  return (
    <div className="container-x pt-4">
      <nav className="text-sm text-slate-500 mb-3"><Link to="/" className="hover:text-brand">Home</Link> › {cat && <><Link to={`/shop?category=${cat.id}`} className="hover:text-brand">{cat.name}</Link> › </>}<span className="text-slate-800">{p.name}</span></nav>

      <div className="bg-white rounded-lg p-4 sm:p-6 grid md:grid-cols-2 gap-6">
        <div>
          <div className="aspect-square rounded-lg border bg-white grid place-items-center overflow-hidden"><img src={p.images?.[img]} alt={p.name} className="max-h-full max-w-full object-contain" /></div>
          {p.images?.length > 1 && <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">{p.images.map((u, n) => <button key={n} onClick={() => setImg(n)} className={`w-16 h-16 shrink-0 rounded border-2 ${n === img ? 'border-brand' : 'border-transparent'}`}><img src={u} alt="" className="w-full h-full object-contain" /></button>)}</div>}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3"><h1 className="text-xl sm:text-2xl font-extrabold">{p.name}</h1><button onClick={share} className="p-2 rounded-full hover:bg-slate-100" title="Share"><Share2 size={20} /></button></div>
          <button onClick={() => setTab('reviews')} className="flex items-center gap-2 mt-1 text-sm"><Stars value={avg} /><span className="text-brand">{reviews?.length ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}` : 'No reviews yet'}</span></button>
          <div className="flex items-end gap-3 mt-4 flex-wrap">
            <span className="text-3xl font-extrabold text-brand">{naira(p.price)}</span>
            {off > 0 && <><span className="text-slate-400 line-through">{naira(p.old_price)}</span><span className="bg-accent/10 text-accent font-extrabold text-sm px-2 py-0.5 rounded">-{off}%</span></>}
          </div>
          <span className={`inline-block mt-3 text-xs font-bold px-2.5 py-1 rounded-full ${stock.cls}`}>{stock.label}</span>
          <p className="text-xs text-slate-500 mt-3">Prices may vary with quantity. Message us for bulk or project pricing.</p>

          <div className="mt-5 grid gap-2.5">
            <button onClick={enquire} className="btn btn-wa !py-3.5 text-lg"><WaIcon size={22} />Enquire on WhatsApp</button>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => enq.add(p.id)} className="btn btn-ghost">{enq.has(p.id) ? <><Check size={18} className="text-green-600" />In list</> : <><Plus size={18} />Add to list</>}</button>
              <a href={`tel:${(s.phone || '').replace(/\s/g, '')}`} className="btn btn-ghost"><Phone size={18} />Call us</a>
            </div>
          </div>
          {specs.length > 0 && <dl className="mt-5 text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">{specs.slice(0, 4).map(([k, v]) => <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>}
        </div>
      </div>

      <div className="bg-white rounded-lg mt-4">
        <div className="flex border-b overflow-x-auto scrollbar-none">
          {[['desc', 'Description'], ['specs', 'Specifications'], ['reviews', `Reviews (${reviews?.length || 0})`]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-5 py-3 font-bold whitespace-nowrap border-b-2 ${tab === k ? 'border-accent text-accent' : 'border-transparent text-slate-500'}`}>{l}</button>
          ))}
        </div>
        <div className="p-4 sm:p-6">
          {tab === 'desc' && <p className="whitespace-pre-line leading-relaxed">{p.description || 'No description yet.'}</p>}
          {tab === 'specs' && (specs.length ? <table className="w-full max-w-xl text-sm"><tbody>{specs.map(([k, v]) => <tr key={k} className="odd:bg-slate-50"><td className="p-2.5 font-semibold w-1/3">{k}</td><td className="p-2.5">{v}</td></tr>)}</tbody></table> : <p className="text-slate-500">No specifications listed.</p>)}
          {tab === 'reviews' && (
            <div className="grid md:grid-cols-[260px_1fr] gap-8">
              <div>
                <div className="text-5xl font-extrabold">{avg ? avg.toFixed(1) : '–'}<span className="text-lg text-slate-400">/5</span></div>
                <Stars value={avg} size={18} />
                <div className="mt-4 space-y-1.5">{dist.map(([n, c]) => <div key={n} className="flex items-center gap-2 text-xs"><span className="w-3">{n}</span><div className="flex-1 h-2 bg-slate-100 rounded"><div className="h-2 bg-gold rounded" style={{ width: reviews?.length ? `${(c / reviews.length) * 100}%` : 0 }} /></div><span className="w-4 text-slate-500">{c}</span></div>)}</div>
              </div>
              <div>
                <div className="space-y-4">
                  {(reviews || []).map((r) => <div key={r.id} className="border-b pb-4"><div className="flex items-center gap-2"><Stars value={r.rating} /><span className="font-bold text-sm">{r.name}</span><span className="text-xs text-green-600">✓ Customer</span></div><p className="mt-1.5 text-sm">{r.comment}</p><p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</p></div>)}
                  {!reviews?.length && <p className="text-slate-500">Be the first to review this product.</p>}
                </div>
                <form onSubmit={submit} className="mt-6 bg-slate-50 rounded-lg p-4 grid gap-3">
                  <h3 className="font-bold">Write a review</h3>
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

      {related.length > 0 && <section className="mt-8"><h2 className="font-extrabold text-xl mb-3">You may also like</h2><div className="grid grid-cols-2 md:grid-cols-5 gap-2">{related.map((x) => <ProductCard key={x.id} p={x} rating={(ratings || {})[x.id]} />)}</div></section>}
    </div>
  )
}
