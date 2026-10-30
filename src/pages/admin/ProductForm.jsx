import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ImagePlus, X, Star, Plus } from 'lucide-react'
import { getProduct, saveProduct, listCategories, uploadImage } from '../../lib/store'
import { useAsync } from '../../lib/hooks'

const empty = { name: '', category_id: '', price: '', old_price: '', stock_status: 'in_stock', description: '', images: [], featured: false, is_new: false, visible: true }

export default function ProductForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const [cats] = useAsync(listCategories)
  const [f, setF] = useState(empty)
  const [specs, setSpecs] = useState([['', '']])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  useEffect(() => {
    if (!id) return
    getProduct(id).then((p) => { if (p) { setF(p); const e = Object.entries(p.specs || {}); setSpecs(e.length ? e : [['', '']]) } })
  }, [id])

  const addImages = async (files) => {
    setBusy(true); setErr('')
    try { const urls = []; for (const file of files) urls.push(await uploadImage(file)); set('images', [...f.images, ...urls]) }
    catch (e) { setErr('Upload failed: ' + e.message) }
    setBusy(false)
  }
  const makeMain = (n) => set('images', [f.images[n], ...f.images.filter((_, i) => i !== n)])
  const submit = async (e) => {
    e.preventDefault()
    if (!f.images.length) return setErr('Add at least one photo.')
    setBusy(true)
    try {
      // specs rows -> object. TIP: rows with an empty name are ignored.
      const obj = Object.fromEntries(specs.filter(([k]) => k.trim()).map(([k, v]) => [k.trim(), v]))
      await saveProduct({ ...f, specs: obj }); nav('/admin/products')
    } catch (x) { setErr(x.message); setBusy(false) }
  }

  const Toggle = ({ k, label }) => <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={!!f[k]} onChange={(e) => set(k, e.target.checked)} />{label}</label>

  return (
    <form onSubmit={submit} className="grid gap-5 max-w-3xl">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">{id ? 'Edit product' : 'Add product'}</h1><Link to="/admin/products" className="text-sm text-slate-500">← Back</Link></div>

      <section className="bg-white rounded-xl p-4 grid gap-3">
        <label className="grid gap-1 text-sm font-semibold">Product name<input required className="input font-normal" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Crystal Ring Chandelier" /></label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold">Category
            <select required className="input font-normal" value={f.category_id || ''} onChange={(e) => set('category_id', e.target.value)}><option value="">Select…</option>{(cats || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="grid gap-1 text-sm font-semibold">Availability
            <select className="input font-normal" value={f.stock_status} onChange={(e) => set('stock_status', e.target.value)}><option value="in_stock">In stock</option><option value="on_request">Available on request</option><option value="out_of_stock">Out of stock</option></select></label>
          <label className="grid gap-1 text-sm font-semibold">Price (₦)<input required type="number" min="0" className="input font-normal" value={f.price} onChange={(e) => set('price', e.target.value)} /></label>
          <label className="grid gap-1 text-sm font-semibold">Old price (₦) <span className="font-normal text-slate-400 text-xs">optional — shows a discount badge</span><input type="number" min="0" className="input font-normal" value={f.old_price || ''} onChange={(e) => set('old_price', e.target.value)} /></label>
        </div>
        <label className="grid gap-1 text-sm font-semibold">Description<textarea rows={4} className="input font-normal" value={f.description} onChange={(e) => set('description', e.target.value)} /></label>
      </section>

      <section className="bg-white rounded-xl p-4">
        <h2 className="font-bold mb-1">Photos</h2><p className="text-xs text-slate-500 mb-3">The first photo is the main one. Photos are shrunk automatically, so phone photos are fine.</p>
        <div className="flex flex-wrap gap-3">
          {f.images.map((u, n) => (
            <div key={n} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
              <img src={u} className="w-full h-full object-contain bg-white" />
              <button type="button" onClick={() => set('images', f.images.filter((_, i) => i !== n))} className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"><X size={14} /></button>
              {n === 0 ? <span className="absolute bottom-0 inset-x-0 bg-brand text-white text-[10px] text-center">MAIN</span> : <button type="button" onClick={() => makeMain(n)} className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1"><Star size={10} />Make main</button>}
            </div>))}
          <label className="w-24 h-24 border-2 border-dashed rounded-lg grid place-items-center text-slate-500 cursor-pointer hover:border-brand hover:text-brand text-xs text-center"><input type="file" accept="image/*" multiple hidden onChange={(e) => addImages([...e.target.files])} /><span><ImagePlus className="mx-auto" />{busy ? 'Working…' : 'Add'}</span></label>
        </div>
      </section>

      <section className="bg-white rounded-xl p-4">
        <h2 className="font-bold mb-1">Specifications</h2><p className="text-xs text-slate-500 mb-3">e.g. Wattage → 24W, Colour temperature → Warm white, Size → 60cm</p>
        <div className="grid gap-2">{specs.map(([k, v], n) => (
          <div key={n} className="flex gap-2"><input className="input" placeholder="Name" value={k} onChange={(e) => setSpecs(specs.map((s, i) => (i === n ? [e.target.value, s[1]] : s)))} /><input className="input" placeholder="Value" value={v} onChange={(e) => setSpecs(specs.map((s, i) => (i === n ? [s[0], e.target.value] : s)))} /><button type="button" onClick={() => setSpecs(specs.length > 1 ? specs.filter((_, i) => i !== n) : [['', '']])} className="p-2 text-accent"><X size={18} /></button></div>))}
        </div>
        <button type="button" onClick={() => setSpecs([...specs, ['', '']])} className="btn btn-ghost !py-1.5 mt-3 text-sm"><Plus size={16} />Add row</button>
      </section>

      <section className="bg-white rounded-xl p-4 flex flex-wrap gap-x-6 gap-y-2">
        <Toggle k="featured" label="Featured (shows in the homepage banner)" /><Toggle k="is_new" label="Mark as NEW" /><Toggle k="visible" label="Visible in shop" />
      </section>

      {err && <p className="text-accent text-sm font-semibold">{err}</p>}
      <div className="flex gap-3"><button disabled={busy} className="btn btn-primary">{busy ? 'Please wait…' : 'Save product'}</button><Link to="/admin/products" className="btn btn-ghost">Cancel</Link></div>
    </form>
  )
}
