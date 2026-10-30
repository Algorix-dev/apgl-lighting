import { useState } from 'react'
import { Trash2, Plus, Copy } from 'lucide-react'
import { listOrders, saveOrder, deleteOrder } from '../../lib/store'
import { useAsync, useSettings } from '../../lib/hooks'
import { ORDER_STATUSES, naira, waLink } from '../../lib/format'
import { Loading, WaIcon } from '../../components/ui'

const blank = { customer_name: '', phone: '', items: '', total: '', status: 'Pending', note: '' }

// TIP: Orders are agreed on WhatsApp. Log one here so the customer gets a code
// and can check progress on /order-status. Changing the dropdown updates it instantly.
export default function Orders() {
  const [orders, loading, reload] = useAsync(listOrders)
  const s = useSettings()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState(blank)
  if (loading || !orders) return <Loading />
  const submit = async (e) => { e.preventDefault(); await saveOrder(f); setF(blank); setOpen(false); reload() }
  const msg = (o) => `Hello ${o.customer_name}, your APGL order ${o.code} is now: *${o.status}*. You can track it at ${location.origin}/order-status (use your code and phone number).`
  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-extrabold">Orders</h1><button onClick={() => setOpen(!open)} className="btn btn-primary"><Plus size={18} />New order</button></div>
      {open && (
        <form onSubmit={submit} className="bg-white rounded-xl p-4 grid sm:grid-cols-2 gap-3 mb-4">
          <input required className="input" placeholder="Customer name" value={f.customer_name} onChange={(e) => setF({ ...f, customer_name: e.target.value })} />
          <input required className="input" placeholder="Customer phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <input required className="input sm:col-span-2" placeholder="Items (e.g. 2x Black Dome Pendant, 1x Floor Lamp)" value={f.items} onChange={(e) => setF({ ...f, items: e.target.value })} />
          <input type="number" className="input" placeholder="Total (₦)" value={f.total} onChange={(e) => setF({ ...f, total: e.target.value })} />
          <select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{ORDER_STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
          <input className="input sm:col-span-2" placeholder="Note shown to customer (optional)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
          <button className="btn btn-primary w-fit">Create order</button>
        </form>)}
      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="text-left text-slate-500 bg-slate-50"><tr><th className="p-3">Code</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>{orders.map((o) => (
            <tr key={o.id} className="border-t align-top">
              <td className="p-3 font-bold whitespace-nowrap">{o.code}</td>
              <td><div className="font-semibold">{o.customer_name}</div><div className="text-xs text-slate-500">{o.phone}</div></td>
              <td className="max-w-56">{o.items}</td><td className="whitespace-nowrap">{naira(o.total)}</td>
              <td><select className="input !py-1.5 !w-auto" value={o.status} onChange={async (e) => { await saveOrder({ ...o, status: e.target.value }); reload() }}>{ORDER_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></td>
              <td className="whitespace-nowrap pr-3 text-right">
                <a title="Tell customer on WhatsApp" target="_blank" rel="noreferrer" href={waLink(o.phone.replace(/\D/g, '').replace(/^0/, '234'), msg(o))} className="inline-block p-2 text-green-600"><WaIcon /></a>
                <button title="Copy code" onClick={() => navigator.clipboard.writeText(o.code)} className="p-2"><Copy size={16} /></button>
                <button onClick={async () => { if (confirm('Delete this order?')) { await deleteOrder(o.id); reload() } }} className="p-2 text-accent"><Trash2 size={16} /></button>
              </td>
            </tr>))}
          </tbody>
        </table>
        {!orders.length && <p className="p-8 text-center text-slate-500">No orders yet.</p>}
      </div>
    </div>
  )
}
