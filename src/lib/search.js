// One search used by the header suggestions AND the shop page.
// It looks in the product name, category, description and every specification value.
export function searchProducts(products, categories, q) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return products
  const catName = (id) => categories.find((c) => c.id === id)?.name || ''
  return products
    .map((p) => {
      const name = p.name.toLowerCase()
      const hay = [p.name, catName(p.category_id), p.description, ...Object.values(p.specs || {})].join(' ').toLowerCase()
      if (!words.every((w) => hay.includes(w))) return null
      // TIP: a match in the NAME counts double, so "pendant" shows pendant lights before products that merely mention it.
      return { p, score: words.reduce((n, w) => n + (name.includes(w) ? 2 : 1), 0) }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p)
}
