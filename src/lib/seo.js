import { useEffect } from 'react'

// TIP: set VITE_SITE_URL=https://yourdomain.com in Cloudflare so canonical links and sitemap use the real domain.
export const siteUrl = () => (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '') || location.origin

function meta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!value) { el?.remove(); return }
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', value)
}

// Call once per page. Sets title, description, canonical, social-share tags, robots and structured data (JSON-LD).
export function useSeo({ title, description, image, path, type = 'website', jsonLd, noindex = false }) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    const base = siteUrl()
    const url = base + (path ?? location.pathname)
    const img = image && !image.startsWith('data:') ? (image.startsWith('http') ? image : base + image) : base + '/logo.jpg'
    if (title) document.title = title
    meta('name', 'description', description)
    meta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    meta('property', 'og:title', title); meta('property', 'og:description', description)
    meta('property', 'og:type', type); meta('property', 'og:url', url); meta('property', 'og:image', img)
    meta('name', 'twitter:card', 'summary_large_image')
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = url
    let script = document.getElementById('ld-json')
    if (ld) {
      if (!script) { script = document.createElement('script'); script.id = 'ld-json'; script.type = 'application/ld+json'; document.head.appendChild(script) }
      script.textContent = ld
    } else script?.remove()
    return () => { document.getElementById('ld-json')?.remove() }
  }, [title, description, image, path, type, noindex, ld])
}
