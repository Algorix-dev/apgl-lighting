import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { auth, getSettings, listProducts, listCategories, ratingsMap } from './store'

/* useAsync: run an async loader, get [data, loading, reload, error] */
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    setLoading(true); setError(null)
    fn().then((d) => live && setData(d)).catch((e) => { console.error(e); live && setError(e) }).finally(() => live && setLoading(false))
    return () => { live = false }
  // eslint-disable-next-line
  }, [...deps, tick])
  return [data, loading, useCallback(() => setTick((t) => t + 1), []), error]
}

/* Site settings (WhatsApp number etc.) available everywhere */
const SettingsCtx = createContext({})
export const useSettings = () => useContext(SettingsCtx)
export function SettingsProvider({ children }) {
  const [s, , reload] = useAsync(getSettings)
  return <SettingsCtx.Provider value={{ ...(s || {}), reload }}>{children}</SettingsCtx.Provider>
}

/* Admin auth state */
const AuthCtx = createContext({})
export const useAuth = () => useContext(AuthCtx)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [me, setMe] = useState(null) // { email, mustChange }
  const refresh = useCallback(async () => {
    const s = await auth.session()
    setMe(s ? await auth.me() : null)
    setSession(s)
  }, [])
  useEffect(() => { refresh() }, [refresh])
  return <AuthCtx.Provider value={{ session, me, refresh }}>{children}</AuthCtx.Provider>
}

/* Enquiry list: like a shopping cart, but it ends in ONE WhatsApp message instead of a checkout */
const EnqCtx = createContext({})
export const useEnquiry = () => useContext(EnqCtx)
export function EnquiryProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('apgl_enq')) || [] } catch { return [] } })
  useEffect(() => { localStorage.setItem('apgl_enq', JSON.stringify(items)) }, [items])
  // TIP: adding the same product again increases its quantity instead of creating a duplicate row.
  const add = (id, qty = 1) => setItems((l) => (l.find((i) => i.id === id) ? l.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i)) : [...l, { id, qty }]))
  const remove = (id) => setItems((l) => l.filter((i) => i.id !== id))
  const setQty = (id, qty) => setItems((l) => l.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)))
  const clear = () => setItems([])
  const has = (id) => items.some((i) => i.id === id)
  return <EnqCtx.Provider value={{ items, add, remove, setQty, clear, has }}>{children}</EnqCtx.Provider>
}

/* Catalogue: products + categories + ratings are loaded ONCE and shared by the header search,
   homepage, shop and footer, instead of each component fetching its own copy. */
const CatalogCtx = createContext({ products: [], categories: [], ratings: {}, loading: true, error: null, reload() {} })
export const useCatalog = () => useContext(CatalogCtx)
export function CatalogProvider({ children }) {
  const [d, loading, reload, error] = useAsync(async () => {
    const [products, categories, ratings] = await Promise.all([listProducts(), listCategories(), ratingsMap()])
    return { products, categories, ratings }
  })
  const value = useMemo(() => ({ products: d?.products || [], categories: d?.categories || [], ratings: d?.ratings || {}, loading, error, reload }), [d, loading, error, reload])
  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>
}
