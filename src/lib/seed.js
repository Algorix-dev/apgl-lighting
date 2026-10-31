// DEMO DATA: only used when no Supabase keys are set. The real starter catalogue lives in catalog.js.
// Products start with NO price (shown as "Price on request") and "Available on request" stock,
// because the shop owner sets real prices and stock himself in Admin > Products.
import { catalogCategories, catalogProducts } from './catalog'

const categories = catalogCategories.map((c) => ({ id: c.id, name: c.name, image_url: c.image, sort: c.sort }))
const products = []
Object.entries(catalogProducts).forEach(([category_id, rows]) =>
  rows.forEach(([num, name, featured, image]) => {
    products.push({
      id: 'p' + num, name, category_id, price: 0, old_price: null, images: [image],
      stock_status: 'on_request', featured: !!featured, is_new: false, visible: true,
      description: `${name} - available from APGL. Message us on WhatsApp to confirm price, availability, colour options and bulk pricing.`,
      specs: {},
      created_at: new Date(Date.now() - products.length * 60000).toISOString(), // keeps the list in catalogue order
    })
  }))

export const seed = {
  settings: {
    whatsapp: '2348000000000', phone: '+234 800 000 0000', email: 'info@apgl.com.ng',
    address: 'Your shop address here',
    hours: 'Mon – Sat: 8am – 6pm',
    announcement: 'Genuine lighting • Bulk & contractor prices available • Chat with us on WhatsApp',
  },
  categories,
  products,
  reviews: [],
  orders: [],
  enquiries: [],
  // DEMO login. Live mode uses real Supabase accounts instead.
  admins: [{ id: 'a1', email: 'admin@apgl.com', password: 'admin123', must_change: true, created_at: new Date().toISOString() }],
}
