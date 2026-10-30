import { Link } from 'react-router-dom'
import { Package, Tags, MessageSquareText, Truck, MousePointerClick } from 'lucide-react'
import { listProducts, listCategories, listReviews, listOrders, enquiryCounts } from '../../lib/store'
import { useAsync } from '../../lib/hooks'
import { naira } from '../../lib/format'
import { Loading } from '../../components/ui'

export default function Dashboard() {
  const [d, loading] = useAsync(async () => {
    const [products, cats, reviews, orders, enq] = await Promise.all([listProducts({ admin: true }), listCategories(), listReviews({ all: true }), listOrders(), enquiryCounts()])
    return { products, cats, reviews, orders, enq }
  })
  if (loading || !d) return <Loading />
  const { products, cats, reviews, orders, enq } = d
  const pending = reviews.filter((r) => !r.approved).length
  const active = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status)).length
  const totalEnq = Object.values(enq).reduce((a, b) => a + b, 0)
  const top = products.map((p) => ({ p, n: enq[p.id] || 0 })).filter((x) => x.n).sort((a, b) => b.n - a.n).slice(0, 5)
  const stats = [
    ['Products', products.length, Package, '/admin/products', 'bg-brand'], ['Categories', cats.length, Tags, '/admin/categories', 'bg-sky'],
    ['Reviews to approve', pending, MessageSquareText, '/admin/reviews', 'bg-accent'], ['Active orders', active, Truck, '/admin/orders', 'bg-gold'],
    ['WhatsApp enquiries', totalEnq, MousePointerClick, '/admin/dashboard', 'bg-green-600'],
  ]
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map(([l, n, Icon, to, c]) => <Link to={to} key={l} className="bg-white rounded-xl p-4 hover:shadow-md"><span className={`${c} text-white w-9 h-9 rounded-lg grid place-items-center`}><Icon size={18} /></span><div className="text-3xl font-extrabold mt-3">{n}</div><div className="text-xs text-slate-500">{l}</div></Link>)}
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mt-5">
        <div className="bg-white rounded-xl p-4"><h2 className="font-bold mb-3">Most enquired products</h2>
          {top.length ? top.map(({ p, n }) => <div key={p.id} className="flex items-center gap-3 py-2 border-b last:border-0"><img src={p.images?.[0]} className="w-10 h-10 object-contain border rounded" /><span className="flex-1 text-sm line-clamp-1">{p.name}</span><b>{n}</b></div>) : <p className="text-sm text-slate-500">Counts every time someone taps Enquire. Nothing yet.</p>}
        </div>
        <div className="bg-white rounded-xl p-4"><h2 className="font-bold mb-3">Recent orders</h2>
          {orders.slice(0, 5).map((o) => <div key={o.id} className="flex justify-between py-2 border-b last:border-0 text-sm"><span><b>{o.code}</b> · {o.customer_name}</span><span className="text-brand font-semibold">{o.status}</span></div>)}
          {!orders.length && <p className="text-sm text-slate-500">No orders logged yet.</p>}
          <Link to="/admin/orders" className="text-brand text-sm font-bold mt-2 inline-block">Manage orders ›</Link>
        </div>
      </div>
    </div>
  )
}
