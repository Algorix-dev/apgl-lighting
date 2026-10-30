import { useState } from 'react'
import { Check, Trash2, EyeOff } from 'lucide-react'
import { listReviews, listProducts, setReviewApproved, deleteReview, addReview } from '../../lib/store'
import { useAsync } from '../../lib/hooks'
import { Stars, StarPicker, Loading } from '../../components/ui'

export default function Reviews() {
  const [reviews, loading, reload] = useAsync(() => listReviews({ all: true }))
  const [products] = useAsync(() => listProducts({ admin: true }))
  const [tab, setTab] = useState('pending')
  const [f, setF] = useState({ product_id: '', name: '', rating: 5, comment: '' })
  if (loading || !reviews) return <Loading />
  const pName = (id) => (products || []).find((p) => p.id === id)?.name || 'Deleted product'
  const rows = reviews.filter((r) => (tab === 'pending' ? !r.approved : r.approved))
  // TIP: reviews you add by hand (e.g. screenshots from WhatsApp) go live immediately: approved = true
  const add = async (e) => { e.preventDefault(); await addReview(f, { approved: true }); setF({ product_id: f.product_id, name: '', rating: 5, comment: '' }); setTab('approved'); reload() }
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold mb-4">Reviews</h1>
      <div className="flex gap-2 mb-3">{[['pending', 'Waiting for approval'], ['approved', 'Live']].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`btn !py-1.5 text-sm ${tab === k ? 'btn-primary' : 'btn-ghost'}`}>{l} ({reviews.filter((r) => (k === 'pending') === !r.approved).length})</button>)}</div>
      <div className="bg-white rounded-xl divide-y">
        {rows.map((r) => (
          <div key={r.id} className="p-4 flex gap-3">
            <div className="flex-1"><div className="flex items-center gap-2"><Stars value={r.rating} /><b className="text-sm">{r.name}</b></div><p className="text-sm mt-1">{r.comment}</p><p className="text-xs text-slate-400 mt-1">on {pName(r.product_id)}</p></div>
            <div className="flex items-start gap-1">
              {r.approved ? <button title="Unpublish" onClick={async () => { await setReviewApproved(r.id, false); reload() }} className="p-2"><EyeOff size={18} /></button>
                : <button title="Approve" onClick={async () => { await setReviewApproved(r.id, true); reload() }} className="p-2 text-green-600"><Check size={20} /></button>}
              <button title="Delete" onClick={async () => { if (confirm('Delete this review?')) { await deleteReview(r.id); reload() } }} className="p-2 text-accent"><Trash2 size={18} /></button>
            </div>
          </div>))}
        {!rows.length && <p className="p-8 text-center text-slate-500">Nothing here.</p>}
      </div>
      <form onSubmit={add} className="bg-white rounded-xl p-4 mt-6 grid gap-3">
        <h2 className="font-bold">Add a review manually</h2>
        <select required className="input" value={f.product_id} onChange={(e) => setF({ ...f, product_id: e.target.value })}><option value="">Product…</option>{(products || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <StarPicker value={f.rating} onChange={(rating) => setF({ ...f, rating })} />
        <input required className="input" placeholder="Customer name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <textarea required rows={2} className="input" placeholder="Review text" value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} />
        <button className="btn btn-primary w-fit">Publish review</button>
      </form>
    </div>
  )
}
