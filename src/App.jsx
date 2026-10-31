import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import EnquiryList from './pages/EnquiryList'
import OrderStatus from './pages/OrderStatus'
import AdminLayout from './pages/admin/AdminLayout'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import ProductForm from './pages/admin/ProductForm'
import Categories from './pages/admin/Categories'
import Reviews from './pages/admin/Reviews'
import Orders from './pages/admin/Orders'
import Settings from './pages/admin/Settings'
import { CONFIG_PROBLEM } from './lib/supabase'
import Profile from './pages/admin/Profile'
import Admins from './pages/admin/Admins'

function Storefront() {
  const { pathname } = useLocation()
  // TIP: braces matter! `() => window.scrollTo()` would RETURN scrollTo's result, and React treats a returned value as a cleanup function.
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (<>{CONFIG_PROBLEM && <div className="bg-red-600 text-white text-sm p-3 text-center">{CONFIG_PROBLEM}</div>}<Header /><main className="min-h-[60vh]"><Outlet /></main><Footer /></>)
}

export default function App() {
  return (
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
  )
}
