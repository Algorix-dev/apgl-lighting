// ONE data layer for the whole app. Every page calls these functions and never
// talks to Supabase directly. TIP: that means demo mode and live mode behave the same.
import { supabase, DEMO } from './supabase'
import { seed } from './seed'
import { compressImage, blobToDataUrl } from './format'

const KEY = 'apgl_demo_v2' // bumped when the real catalogue replaced the sample products
const db = () => {
  let d; try { d = JSON.parse(localStorage.getItem(KEY)) } catch {}
  let dirty = false
  if (!d) { d = structuredClone(seed); dirty = true }
  if (!d.admins) { d.admins = structuredClone(seed.admins); dirty = true } // older demo data
  if (dirty) localStorage.setItem(KEY, JSON.stringify(d))
  return d
}
const commit = (d) => localStorage.setItem(KEY, JSON.stringify(d))
const uid = () => crypto.randomUUID()
const ok = ({ data, error }) => { if (error) throw error; return data }
const last10 = (p) => String(p || '').replace(/\D/g, '').slice(-10)
export const resetDemo = () => localStorage.removeItem(KEY)

/* ---------- auth ---------- */
// Creating/deleting OTHER admins needs Supabase's secret key, which must never sit in the browser.
// So those actions go through a small Edge Function (supabase/functions/admin-users) that checks you are an admin first.
const fn = async (body) => {
  const { data, error } = await supabase.functions.invoke('admin-users', { body })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}
export const auth = {
  async session() {
    if (DEMO) return sessionStorage.getItem('apgl_admin') ? { demo: true } : null
    return (await supabase.auth.getSession()).data.session
  },
  async signIn(email, password) {
    if (DEMO) {
      const a = db().admins.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
      if (!a) throw new Error('Wrong email or password')
      return sessionStorage.setItem('apgl_admin', a.email)
    }
    const { data: s, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Wrong email or password')
    const { data } = await supabase.from('admins').select('user_id').eq('user_id', s.user.id).maybeSingle()
    if (!data) { await supabase.auth.signOut(); throw new Error('This account is not an admin') }
  },
  // Who is signed in + do they still have the default password?
  async me() {
    if (DEMO) {
      const a = db().admins.find((x) => x.email === sessionStorage.getItem('apgl_admin'))
      return a ? { email: a.email, mustChange: a.must_change } : null
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from('admins').select('must_change_password').eq('user_id', user.id).maybeSingle()
    return data ? { email: user.email, mustChange: data.must_change_password } : null
  },
  async changePassword(pw) {
    if (DEMO) {
      const d = db(), email = sessionStorage.getItem('apgl_admin')
      d.admins = d.admins.map((a) => (a.email === email ? { ...a, password: pw, must_change: false } : a))
      return commit(d)
    }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) throw error
    ok(await supabase.from('admins').update({ must_change_password: false }).eq('user_id', user.id))
  },
  async signOut() { DEMO ? sessionStorage.removeItem('apgl_admin') : await supabase.auth.signOut() },
}

/* ---------- admin accounts ---------- */
export async function listAdmins() {
  if (DEMO) return db().admins.map(({ password, ...a }) => a)
  return ok(await supabase.from('admins').select('*').order('created_at')).map((a) => ({ ...a, id: a.user_id, must_change: a.must_change_password }))
}
export async function createAdmin(email, password) {
  if (DEMO) {
    const d = db()
    if (d.admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) throw new Error('That email is already an admin')
    d.admins.push({ id: uid(), email, password, must_change: true, created_at: new Date().toISOString() })
    return commit(d)
  }
  await fn({ action: 'create', email, password })
}
export async function resetAdminPassword(id, password) {
  if (DEMO) { const d = db(); d.admins = d.admins.map((a) => (a.id === id ? { ...a, password, must_change: true } : a)); return commit(d) }
  await fn({ action: 'reset', id, password })
}
export async function deleteAdmin(id) {
  if (DEMO) { const d = db(); d.admins = d.admins.filter((a) => a.id !== id); return commit(d) }
  await fn({ action: 'delete', id })
}

/* ---------- settings ---------- */
export async function getSettings() {
  if (DEMO) return db().settings
  const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle()
  return { ...seed.settings, ...(data || {}) }
}
export async function saveSettings(s) {
  if (DEMO) { const d = db(); d.settings = { ...d.settings, ...s }; return commit(d) }
  ok(await supabase.from('settings').upsert({ ...s, id: 1 }))
}

/* ---------- categories ---------- */
export async function listCategories() {
  if (DEMO) return db().categories.slice().sort((a, b) => a.sort - b.sort)
  return ok(await supabase.from('categories').select('*').order('sort').order('name'))
}
export async function saveCategory(c) {
  if (DEMO) {
    const d = db()
    if (c.id) d.categories = d.categories.map((x) => (x.id === c.id ? { ...x, ...c } : x))
    else d.categories.push({ ...c, id: uid(), sort: d.categories.length + 1 })
    return commit(d)
  }
  const row = { name: c.name, image_url: c.image_url || null }
  c.id ? ok(await supabase.from('categories').update(row).eq('id', c.id)) : ok(await supabase.from('categories').insert(row))
}
export async function deleteCategory(id) {
  if (DEMO) { const d = db(); d.categories = d.categories.filter((x) => x.id !== id); d.products.forEach((p) => p.category_id === id && (p.category_id = null)); return commit(d) }
  ok(await supabase.from('categories').delete().eq('id', id))
}

/* ---------- products ---------- */
export async function listProducts({ admin = false } = {}) {
  const rows = DEMO ? db().products : ok(await supabase.from('products').select('*').order('created_at', { ascending: false }))
  const sorted = rows.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return admin ? sorted : sorted.filter((p) => p.visible)
}
export async function getProduct(id) {
  if (DEMO) return db().products.find((p) => p.id === id) || null
  return (await supabase.from('products').select('*').eq('id', id).maybeSingle()).data
}
export async function saveProduct(p) {
  const row = {
    name: p.name.trim(), category_id: p.category_id || null, price: Number(p.price) || 0,
    old_price: p.old_price ? Number(p.old_price) : null, stock_status: p.stock_status, description: p.description || '',
    specs: p.specs || {}, images: p.images || [], featured: !!p.featured, is_new: !!p.is_new, visible: p.visible !== false,
  }
  if (DEMO) {
    const d = db()
    if (p.id) d.products = d.products.map((x) => (x.id === p.id ? { ...x, ...row } : x))
    else d.products.unshift({ ...row, id: uid(), created_at: new Date().toISOString() })
    return commit(d)
  }
  p.id ? ok(await supabase.from('products').update(row).eq('id', p.id)) : ok(await supabase.from('products').insert(row))
}
export async function deleteProduct(id) {
  if (DEMO) { const d = db(); d.products = d.products.filter((x) => x.id !== id); return commit(d) }
  ok(await supabase.from('products').delete().eq('id', id))
}
export async function uploadImage(file) {
  const blob = await compressImage(file)
  if (DEMO) return blobToDataUrl(blob) // stored inside the browser for the demo
  const path = `${uid()}.jpg`
  const { error } = await supabase.storage.from('products').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
  if (error) throw error
  return supabase.storage.from('products').getPublicUrl(path).data.publicUrl
}

/* ---------- reviews ---------- */
export async function listReviews({ productId, all = false } = {}) {
  let rows = DEMO ? db().reviews : ok(await supabase.from('reviews').select('*').order('created_at', { ascending: false }))
  if (productId) rows = rows.filter((r) => r.product_id === productId)
  if (!all) rows = rows.filter((r) => r.approved)
  return rows.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}
// { productId: { avg, count } } — used by product cards
export async function ratingsMap() {
  const map = {}
  for (const r of await listReviews()) {
    const m = (map[r.product_id] ||= { sum: 0, count: 0 })
    m.sum += r.rating; m.count++
  }
  Object.values(map).forEach((m) => (m.avg = m.sum / m.count))
  return map
}
// Customer reviews arrive UNAPPROVED. Admin approves them in the dashboard.
export async function addReview(r, { approved = false } = {}) {
  const row = { product_id: r.product_id, name: r.name.trim(), rating: Number(r.rating), comment: r.comment.trim(), approved }
  if (DEMO) { const d = db(); d.reviews.push({ ...row, id: uid(), created_at: new Date().toISOString() }); return commit(d) }
  ok(await supabase.from('reviews').insert(row))
}
export async function setReviewApproved(id, approved) {
  if (DEMO) { const d = db(); d.reviews = d.reviews.map((r) => (r.id === id ? { ...r, approved } : r)); return commit(d) }
  ok(await supabase.from('reviews').update({ approved }).eq('id', id))
}
export async function deleteReview(id) {
  if (DEMO) { const d = db(); d.reviews = d.reviews.filter((r) => r.id !== id); return commit(d) }
  ok(await supabase.from('reviews').delete().eq('id', id))
}

/* ---------- enquiries (just a click counter for the dashboard) ---------- */
export function logEnquiry(productId) {
  if (DEMO) { const d = db(); d.enquiries.push({ product_id: productId, created_at: new Date().toISOString() }); return commit(d) }
  supabase.from('enquiries').insert({ product_id: productId }).then(() => {})
}
export async function enquiryCounts() {
  const rows = DEMO ? db().enquiries : ok(await supabase.from('enquiries').select('product_id').limit(5000))
  const out = {}
  rows.forEach((r) => (out[r.product_id] = (out[r.product_id] || 0) + 1))
  return out
}

/* ---------- orders (status updates only; the chat happens on WhatsApp) ---------- */
export async function listOrders() {
  const rows = DEMO ? db().orders : ok(await supabase.from('orders').select('*').order('created_at', { ascending: false }))
  return rows.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}
export async function saveOrder(o) {
  const row = { customer_name: o.customer_name, phone: o.phone, items: o.items, total: Number(o.total) || 0, status: o.status, note: o.note || '' }
  if (DEMO) {
    const d = db()
    if (o.id) d.orders = d.orders.map((x) => (x.id === o.id ? { ...x, ...row } : x))
    else {
      const n = Math.max(1000, ...d.orders.map((x) => Number(x.code.split('-')[1]) || 0)) + 1
      d.orders.unshift({ ...row, id: uid(), code: `APGL-${n}`, created_at: new Date().toISOString() })
    }
    return commit(d)
  }
  o.id ? ok(await supabase.from('orders').update({ ...row, updated_at: new Date().toISOString() }).eq('id', o.id)) : ok(await supabase.from('orders').insert(row))
}
export async function deleteOrder(id) {
  if (DEMO) { const d = db(); d.orders = d.orders.filter((x) => x.id !== id); return commit(d) }
  ok(await supabase.from('orders').delete().eq('id', id))
}
// Public lookup: needs BOTH the order code and the phone number, so nobody can browse other people's orders.
export async function lookupOrder(code, phone) {
  if (DEMO) {
    const o = db().orders.find((x) => x.code.toLowerCase() === code.trim().toLowerCase() && last10(x.phone) === last10(phone))
    return o ? { code: o.code, status: o.status, items: o.items, note: o.note, updated_at: o.created_at } : null
  }
  const { data, error } = await supabase.rpc('lookup_order', { p_code: code.trim(), p_phone: phone })
  if (error) throw error
  return data?.[0] || null
}
