import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import EnquiryList from './pages/EnquiryList'
import OrderStatus from './pages/OrderStatus'
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Login = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Products = lazy(() => import('./pages/admin/Products'))
const ProductForm = lazy(() => import('./pages/admin/ProductForm'))
const Categories = lazy(() => import('./pages/admin/Categories'))
const Reviews = lazy(() => import('./pages/admin/Reviews'))
const Orders = lazy(() => import('./pages/admin/Orders'))
const Settings = lazy(() => import('./pages/admin/Settings'))
import { CONFIG_PROBLEM } from './lib/supabase'
import { useSettings } from './lib/hooks'
import { waLink } from './lib/format'
import { WaIcon } from './components/ui'
const Profile = lazy(() => import('./pages/admin/Profile'))
const Admins = lazy(() => import('./pages/admin/Admins'))

// One floating WhatsApp button on every storefront page (instead of several big ones scattered around).
function FloatingWhatsApp() {
  const { whatsapp } = useSettings()
  return (
    <a href={waLink(whatsapp, 'Hello APGL')} target="_blank" rel="noreferrer" aria-label="Chat with APGL on WhatsApp"
      className="fixed bottom-4 right-4 z-40 btn btn-wa !rounded-full !px-4 !py-3.5 shadow-xl"><WaIcon size={24} /><span className="hidden sm:inline">Chat with us</span></a>
  )
}

function Storefront() {
  const { pathname } = useLocation()
  // TIP: braces matter! `() => window.scrollTo()` would RETURN scrollTo's result, and React treats a returned value as a cleanup function.
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (<>{CONFIG_PROBLEM && <div className="bg-red-600 text-white text-sm p-3 text-center">{CONFIG_PROBLEM}</div>}<Header /><main className="min-h-[60vh]"><Outlet /></main><Footer /><FloatingWhatsApp /></>)
}

export default function App() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500">Loading…</div>}>
    <Routes>
      <Route element={<Storefront />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/enquiry-list" element={<EnquiryList />} />
        <Route path="/order-status" element={<OrderStatus />} />
      </Route>
      <Route path="/admin" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/products/new" element={<ProductForm />} />
        <Route path="/admin/products/:id" element={<ProductForm />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/reviews" element={<Reviews />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/profile" element={<Profile />} />
        <Route path="/admin/admins" element={<Admins />} />
      </Route>
    </Routes>
    </Suspense>
  )
}
