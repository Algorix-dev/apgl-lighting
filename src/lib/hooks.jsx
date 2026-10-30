import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { auth, getSettings } from './store'

/* useAsync: run an async loader, get [data, loading, reload] */
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    setLoading(true)
    fn().then((d) => live && setData(d)).catch(console.error).finally(() => live && setLoading(false))
    return () => { live = false }
  // eslint-disable-next-line
  }, [...deps, tick])
  return [data, loading, useCallback(() => setTick((t) => t + 1), [])]
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
  useEffect(() => localStorage.setItem('apgl_enq', JSON.stringify(items)), [items])
  const add = (id) => setItems((l) => (l.find((i) => i.id === id) ? l : [...l, { id, qty: 1 }]))
  const remove = (id) => setItems((l) => l.filter((i) => i.id !== id))
  const setQty = (id, qty) => setItems((l) => l.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)))
  const clear = () => setItems([])
  const has = (id) => items.some((i) => i.id === id)
  return <EnqCtx.Provider value={{ items, add, remove, setQty, clear, has }}>{children}</EnqCtx.Provider>
}
