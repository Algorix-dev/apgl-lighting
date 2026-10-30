import { useState } from 'react'
import { ImagePlus, Trash2, Pencil } from 'lucide-react'
import { listCategories, saveCategory, deleteCategory, uploadImage } from '../../lib/store'
import { useAsync } from '../../lib/hooks'
import { Loading } from '../../components/ui'

export default function Categories() {
  const [cats, loading, reload] = useAsync(listCategories)
  const [f, setF] = useState({ name: '', image_url: '' })
  const [busy, setBusy] = useState(false)
  if (loading || !cats) return <Loading />
  const pick = async (file) => { if (!file) return; setBusy(true); setF({ ...f, image_url: await uploadImage(file) }); setBusy(false) }
  const submit = async (e) => { e.preventDefault(); await saveCategory(f); setF({ name: '', image_url: '' }); reload() }
  const del = async (c) => { if (confirm(`Delete "${c.name}"? Its products will become uncategorised.`)) { await deleteCategory(c.id); reload() } }
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold mb-4">Categories</h1>
      <form onSubmit={submit} className="bg-white rounded-xl p-4 flex flex-wrap items-center gap-3 mb-4">
        <label className="w-14 h-14 border-2 border-dashed rounded-lg grid place-items-center cursor-pointer overflow-hidden shrink-0"><input hidden type="file" accept="image/*" onChange={(e) => pick(e.target.files[0])} />{f.image_url ? <img src={f.image_url} className="w-full h-full object-cover" /> : <ImagePlus size={18} className="text-slate-400" />}</label>
        <input required className="input flex-1 min-w-40" placeholder="Category name (e.g. Chandeliers)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <button disabled={busy} className="btn btn-primary">{f.id ? 'Update' : 'Add category'}</button>
        {f.id && <button type="button" className="btn btn-ghost" onClick={() => setF({ name: '', image_url: '' })}>Cancel</button>}
      </form>
      <div className="bg-white rounded-xl divide-y">
        {cats.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3"><img src={c.image_url} className="w-12 h-12 rounded object-cover bg-slate-100" /><span className="flex-1 font-semibold">{c.name}</span>
            <button onClick={() => { setF(c); scrollTo(0, 0) }} className="p-2 hover:text-brand"><Pencil size={18} /></button><button onClick={() => del(c)} className="p-2 text-accent"><Trash2 size={18} /></button></div>))}
      </div>
    </div>
  )
}
