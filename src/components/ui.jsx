import { Link } from 'react-router-dom'
import { Star, ChevronRight } from 'lucide-react'

export function Stars({ value = 0, size = 14 }) {
  return (
    <span className="inline-flex" aria-label={`${value.toFixed ? value.toFixed(1) : value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-gold text-gold' : 'text-slate-300'} />)}
    </span>
  )
}

export function StarPicker({ value, onChange }) {
  return (
    <span className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button type="button" key={i} onClick={() => onChange(i)} aria-label={`${i} stars`}><Star size={26} className={i <= value ? 'fill-gold text-gold' : 'text-slate-300'} /></button>
      ))}
    </span>
  )
}

export const WaIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden>
    <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.3.7 4.5 1.9 6.4L4 29l7.9-1.8a12.1 12.1 0 0 0 4.1.7c6.6 0 12-5.3 12-11.9S22.600 3 16 3Zm0 21.800c-1.300 0-2.600-.3-3.700-.9l-.5-.3-4.700 1.100 1.200-4.500-.3-.5a9.600 9.600 0 0 1-1.500-5.200C6.500 9.900 10.800 5.600 16 5.600s9.500 4.300 9.500 9.600-4.300 9.600-9.500 9.600Zm5.300-7.200c-.3-.1-1.700-.8-2-.9-.3-.1-.5-.1-.7.1l-.9 1.100c-.2.200-.3.200-.6.100a7.800 7.800 0 0 1-3.800-3.300c-.3-.5.300-.5.800-1.500.1-.2 0-.3 0-.5l-.9-2.100c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1 1-1 2.500s1.100 2.900 1.200 3.100c.1.200 2.100 3.200 5.100 4.500 1.900.8 2.600.9 3.600.7.600-.1 1.700-.7 2-1.400.2-.7.200-1.300.2-1.400-.1-.1-.3-.2-.6-.3Z" />
  </svg>
)

export const Loading = () => <div className="py-20 text-center text-slate-500">Loading…</div>

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500 flex flex-wrap items-center gap-1 mb-4">
      {items.map((it, n) => (
        <span key={n} className="inline-flex items-center gap-1">
          {n > 0 && <ChevronRight size={14} className="text-slate-300" />}
          {it.to ? <Link to={it.to} className="hover:text-brand">{it.label}</Link> : <span className="text-slate-800 font-semibold line-clamp-1" aria-current="page">{it.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function Skeleton({ className = '' }) { return <div className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`} /> }

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-3"><Skeleton className="aspect-square" /><Skeleton className="h-4 mt-3 w-4/5" /><Skeleton className="h-5 mt-2 w-1/2" /><Skeleton className="h-9 mt-3" /></div>
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="card p-10 text-center">
      {Icon && <div className="mx-auto w-14 h-14 rounded-full bg-brand/10 text-brand grid place-items-center mb-4"><Icon size={26} /></div>}
      <h2 className="font-extrabold text-lg">{title}</h2>
      {text && <p className="text-slate-500 text-sm mt-1.5 max-w-md mx-auto">{text}</p>}
      {children && <div className="mt-5 flex flex-wrap gap-2 justify-center">{children}</div>}
    </div>
  )
}
