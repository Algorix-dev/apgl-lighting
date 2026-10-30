// DEMO DATA — only used when no Supabase keys are set. Prices/specs are placeholders.
const d = (n) => `/demo/p${n}.jpg`
const cat = (id, name, img, sort) => ({ id, name, image_url: d(img), sort })
const P = (id, name, category_id, price, old_price, img, extra = {}) => ({
  id, name, category_id, price, old_price: old_price || null, images: [d(img)],
  stock_status: 'in_stock', featured: false, is_new: false, visible: true,
  description: `${name} — a quality piece for homes, offices, hotels and shops. Message us on WhatsApp to confirm availability, colour options and bulk pricing.`,
  specs: { 'Light source': 'LED', Warranty: 'Ask us on WhatsApp' },
  created_at: new Date(Date.now() - Number(id.slice(1)) * 864e5).toISOString(), ...extra,
})

export const seed = {
  settings: {
    whatsapp: '2348000000000', phone: '+234 800 000 0000', email: 'info@apgl.com.ng',
    address: 'Your shop address here',
    hours: 'Mon – Sat: 8am – 6pm',
    announcement: 'Genuine lighting • Bulk & contractor prices available • Chat with us on WhatsApp',
  },
  categories: [
    cat('c1', 'Chandeliers', 93, 1), cat('c2', 'Pendant Lights', 29, 2), cat('c3', 'Linear & Dining', 55, 3),
    cat('c4', 'Wall Lights', 34, 4), cat('c5', 'Table Lamps', 82, 5), cat('c6', 'Floor Lamps', 70, 6),
    cat('c7', 'Outdoor & Street', 69, 7), cat('c8', 'Spotlights', 76, 8),
  ],
  products: [
    P('p1', 'Crystal Glass Leaf Chandelier', 'c1', 285000, 340000, 93, { featured: true, is_new: true }),
    P('p2', 'Luxury Crystal Ring Chandelier', 'c1', 420000, null, 54, { featured: true }),
    P('p3', 'Crystal Square Drop Pendant', 'c1', 95000, 110000, 12),
    P('p4', 'Black Dome Pendant Light', 'c2', 18500, null, 29, { featured: true }),
    P('p5', 'Gold-Inside Bowler Pendant', 'c2', 22000, 27000, 7, { is_new: true }),
    P('p6', 'Tapered Nordic Pendant', 'c2', 24000, null, 23),
    P('p7', 'Modern LED Ring Pendant', 'c2', 48000, 56000, 17, { featured: true }),
    P('p8', 'Zig-Zag LED Dining Light', 'c3', 62000, 75000, 55, { featured: true, is_new: true }),
    P('p9', 'Wave Linear LED Pendant', 'c3', 58000, null, 60),
    P('p10', 'Double-Bar Dining Light', 'c3', 54000, null, 58),
    P('p11', 'Slim LED Wall Bar', 'c4', 16500, null, 0, { is_new: true }),
    P('p12', 'Up & Down Wall Sconce', 'c4', 14500, 18000, 34),
    P('p13', 'Geometric Wall Light', 'c4', 17500, null, 64),
    P('p14', 'Black & Gold Fabric Table Lamp', 'c5', 28000, null, 68),
    P('p15', 'Gold Mushroom Table Lamp', 'c5', 35000, 42000, 82, { featured: true }),
    P('p16', 'Ceramic Base Table Lamp', 'c5', 39000, null, 73),
    P('p17', 'Arc Floor Lamp with Marble Base', 'c6', 65000, 80000, 70, { featured: true }),
    P('p18', 'Tripod Floor Lamp', 'c6', 45000, null, 85),
    P('p19', 'LED Street Light', 'c7', 85000, null, 69, { stock_status: 'on_request' }),
    P('p20', 'COB LED Downlight', 'c8', 4500, 5500, 76),
  ],
  reviews: [
    { id: 'r1', product_id: 'p1', name: 'Chioma A.', rating: 5, comment: 'Looks even better in my living room. Delivery was smooth.', approved: true, created_at: new Date(Date.now() - 6 * 864e5).toISOString() },
    { id: 'r2', product_id: 'p1', name: 'Mr. Bello', rating: 4, comment: 'Beautiful finish. Packaging was very secure.', approved: true, created_at: new Date(Date.now() - 12 * 864e5).toISOString() },
    { id: 'r3', product_id: 'p4', name: 'Tunde O.', rating: 5, comment: 'Used four in my restaurant. Customers keep asking about them.', approved: true, created_at: new Date(Date.now() - 3 * 864e5).toISOString() },
    { id: 'r4', product_id: 'p17', name: 'Ada N.', rating: 5, comment: 'Solid base, warm light. Perfect beside the sofa.', approved: false, created_at: new Date().toISOString() },
  ],
  orders: [
    { id: 'o1', code: 'APGL-1001', customer_name: 'Chioma A.', phone: '08012345678', items: '1x Crystal Glass Leaf Chandelier', total: 285000, status: 'Packed', note: 'Delivery to Lekki', created_at: new Date(Date.now() - 2 * 864e5).toISOString() },
  ],
  enquiries: [],
}
