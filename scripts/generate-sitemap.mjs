// Runs automatically before every build (see "prebuild" in package.json).
// Writes public/sitemap.xml (home, shop, every visible product) and public/robots.txt for Google.
// Needs VITE_SITE_URL (your real domain) and the two Supabase variables. Without them it skips safely.
import { writeFileSync, mkdirSync } from 'node:fs'

try { process.loadEnvFile?.('.env') } catch { /* no .env file: fine on Cloudflare, variables come from the dashboard */ }
const site = (process.env.VITE_SITE_URL || '').replace(/\/$/, '')
const url = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const key = process.env.VITE_SUPABASE_ANON_KEY || ''
mkdirSync('public', { recursive: true })

if (!/^https?:\/\//.test(site)) {
  console.log('[sitemap] VITE_SITE_URL not set, skipping sitemap.xml (set it to your domain before going live)')
  writeFileSync('public/robots.txt', 'User-agent: *\nDisallow: /admin\n')
  process.exit(0)
}

let products = []
if (url && key) {
  try {
    const r = await fetch(`${url}/rest/v1/products?select=id,created_at&visible=eq.true`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    if (r.ok) products = await r.json()
    else console.log('[sitemap] could not read products:', r.status)
  } catch (e) { console.log('[sitemap] products fetch failed:', e.message) }
}

const entry = (loc, lastmod) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`
const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  entry(`${site}/`), entry(`${site}/shop`), entry(`${site}/order-status`),
  ...products.map((p) => entry(`${site}/product/${p.id}`, p.created_at)), '</urlset>'].join('\n')
writeFileSync('public/sitemap.xml', xml)
// robots.txt is NOT security. It only asks search engines to skip /admin. The real protection is login + database rules.
writeFileSync('public/robots.txt', `User-agent: *\nDisallow: /admin\n\nSitemap: ${site}/sitemap.xml\n`)
console.log(`[sitemap] wrote ${products.length + 3} URLs for ${site}`)
