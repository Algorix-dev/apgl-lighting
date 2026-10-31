export const naira = (n) => '₦' + Number(n || 0).toLocaleString('en-NG')
export const discountPct = (price, old) => (old && old > price ? Math.round((1 - price / old) * 100) : 0)

// WhatsApp wants the number in international format without "+" (e.g. 2348012345678).
export const waNumber = (raw) => {
  let d = String(raw || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = '234' + d.slice(1)
  return d
}
export const waLink = (raw, text) => `https://wa.me/${waNumber(raw)}?text=${encodeURIComponent(text)}`

export const STOCK = {
  in_stock: { label: 'In stock', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500', text: 'text-green-700' },
  on_request: { label: 'On request', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', text: 'text-amber-700' },
  out_of_stock: { label: 'Out of stock', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500', text: 'text-red-700' },
}
export const ORDER_STEPS = ['Pending', 'Confirmed', 'Packed', 'Out for delivery', 'Delivered']
export const ORDER_STATUSES = [...ORDER_STEPS, 'Cancelled']

// Shrinks photos in the browser before upload so the site stays fast
// (a 4MB phone photo becomes ~150KB). TIP: change `max` for bigger/smaller images.
export async function compressImage(file, max = 1200) {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * scale)
  c.height = Math.round(bmp.height * scale)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.82))
}
export const blobToDataUrl = (blob) =>
  new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob) })
