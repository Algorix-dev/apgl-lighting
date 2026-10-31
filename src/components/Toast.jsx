import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

// Small confirmation message, e.g. "Added to your enquiry list". Usage: const toast = useToast(); toast('Saved')
export function ToastProvider({ children }) {
  const [t, setT] = useState(null)
  const show = useCallback((msg) => setT({ msg, id: Date.now() }), [])
  useEffect(() => {
    if (!t) return undefined
    const id = setTimeout(() => setT(null), 2200)
    return () => clearTimeout(id)
  }, [t])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t && <div role="status" className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-brand-dark text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg">{t.msg}</div>}
    </ToastCtx.Provider>
  )
}
