import { NavLink, Navigate, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Package, Tags, MessageSquareText, Truck, Settings as Cog, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '../../lib/hooks'
import { auth, resetDemo } from '../../lib/store'
import { DEMO } from '../../lib/supabase'

const links = [
  ['/admin/dashboard', 'Dashboard', LayoutDashboard], ['/admin/products', 'Products', Package], ['/admin/categories', 'Categories', Tags],
  ['/admin/reviews', 'Reviews', MessageSquareText], ['/admin/orders', 'Orders', Truck], ['/admin/settings', 'Settings', Cog],
]

// TIP: every admin page sits inside this layout, so the login check lives in ONE place.
export default function AdminLayout() {
  const { session, refresh } = useAuth()
  if (session === undefined) return <div className="p-10">Loading…</div>
  if (!session) return <Navigate to="/admin" replace />
  const out = async () => { await auth.signOut(); refresh() }
  return (
    <div className="min-h-screen lg:flex">
      <aside className="lg:w-60 bg-brand-dark text-white lg:min-h-screen lg:sticky lg:top-0 lg:self-start shrink-0">
        <div className="p-4 flex lg:block items-center justify-between"><div className="bg-white rounded-lg p-1.5 inline-block"><img src="/logo.jpg" alt="APGL" className="h-9" /></div><span className="lg:hidden text-sm font-bold">Admin</span></div>
        <nav className="flex lg:block overflow-x-auto scrollbar-none px-2 pb-2 lg:pb-0">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap ${isActive ? 'bg-white text-brand' : 'text-white/80 hover:bg-white/10'}`}><Icon size={18} />{label}</NavLink>
          ))}
        </nav>
        <div className="hidden lg:block p-3 mt-4 space-y-1 text-sm">
          <Link to="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white"><ExternalLink size={16} />View site</Link>
          <button onClick={out} className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white w-full"><LogOut size={16} />Sign out</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        {DEMO && <div className="bg-amber-100 text-amber-900 text-sm px-4 py-2 flex flex-wrap gap-3 justify-between"><span>Demo mode: changes only live in this browser. Add your Supabase keys to go live.</span><button className="font-bold underline" onClick={() => { resetDemo(); location.reload() }}>Reset demo data</button></div>}
        <div className="p-4 sm:p-6 max-w-6xl"><Outlet /></div>
        <button onClick={out} className="lg:hidden m-4 text-sm text-accent font-bold">Sign out</button>
      </div>
    </div>
  )
}
