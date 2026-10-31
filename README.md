# APGL Lighting Store

Jumia-style lighting catalogue for Ajay Pristine Golden Links Limited. Customers browse, then enquire on WhatsApp. No checkout.
Stack: React + Vite + Tailwind v4 + Supabase (database, login, photo storage).

## 1. Try it now (demo mode, no setup)
```
npm install
npm run dev
```
Open the site. Admin is at `/admin` (demo login `admin@apgl.com` / `admin123`, which forces a password change like the real flow). Demo data lives in your browser only.
Click **Reset demo data** in the admin banner to restore it.

## 2. Go live
1. Create a free project at supabase.com.
2. SQL Editor > paste `supabase/schema.sql` > Run.
3. Authentication > Users > **Add user** (client's email + the DEFAULT password you choose, tick Auto Confirm).
   Then Authentication > Providers > Email: turn **off** "Allow new users to sign up".
4. SQL Editor > run this once to make that user the first admin (change the email):
   `insert into admins (user_id, email, must_change_password) select id, email, true from auth.users where email = 'client@example.com';`
   On first login he is forced to the Profile page to set his own password. From then on he can add more admins on the **Admins** page.
5. Deploy the admin function (needed for the Admins page): Supabase dashboard > Edge Functions > **Deploy a new function** > "Via Editor", name it exactly `admin-users`, paste `supabase/functions/admin-users/index.ts`, Deploy.
   (Or with the CLI: `supabase functions deploy admin-users`.)
6. Copy `.env.example` to `.env` and fill in Project URL + anon key (Project Settings > API).
7. Run the site, sign in at `/admin`, open **Settings**, set the real WhatsApp number (format `2348012345678`).
8. Load the starter catalogue: SQL Editor > paste `supabase/seed-products.sql` > Run. This adds 8 categories and 133 products (photos are in `public/products`, so deploy the site first). Safe to run again; anything that already exists is skipped.
9. Open **Admin > Products** and type each price into the Price column (Enter saves). Tick "Show only products without a price" to see what is left. Unpriced products show "Price on request" in the shop.

## Adding products and categories later
- **Admin > Categories**: add a category (name + photo). It appears in the shop menu once it has a product.
- **Admin > Products > Add product**: nothing is pre-selected. Category and availability must be chosen, price is optional.
- Starter list lives in `src/lib/catalog.js` (also used by demo mode). Real data lives in Supabase, so edit products in the admin, not in that file.

## 3. Deploy (Cloudflare Workers, free for commercial use)
Push to GitHub, then Cloudflare > Workers & Pages > Create > connect the repo.
Build command `npm run build`, deploy command `npx wrangler deploy`.
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as **Build variables** (they are read when the site is built).
`wrangler.jsonc` makes page refreshes work. Then Settings > Domains & Routes > Add custom domain (apex + www).

## Where to change things
| Want to change | File |
|---|---|
| Brand colours | `src/index.css` (the `@theme` block) |
| Homepage trust strip text | `src/pages/Home.jsx` (`trust` array) |
| Hero slide speed | `src/pages/Home.jsx` (`5000`) |
| WhatsApp message wording | `ProductCard.jsx`, `Product.jsx`, `EnquiryList.jsx` |
| Order steps | `src/lib/format.js` (`ORDER_STEPS`) |

## Storefront design system (redesign)
- Brand colours live in `src/index.css` (`@theme`). Navy `#09265f`, blue `#12377f`, gold `#f4a51c`, WhatsApp green `#16c968`.
- Homepage hero photos are fixed brand images in `public/brand/` (`hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg`, `project.jpg`). Replace them with your best photos. They do not come from the database, so the homepage never looks empty.
- Products, categories and ratings are loaded once (`CatalogProvider` in `src/lib/hooks.jsx`) and shared by search, home, shop and footer.
- Shared look: `.card`, `.btn-*` and `.input` in `src/index.css`. Shared pieces: `ProductCard`, `SearchBox`, `Breadcrumbs`, `EmptyState`, `Skeleton`, toasts.

## SEO and Google
- Set `VITE_SITE_URL=https://yourdomain.com` (Cloudflare Build variables + `.env`).
- Every build runs `scripts/generate-sitemap.mjs`, which writes `sitemap.xml` (all visible products) and `robots.txt`. New products appear in the sitemap after the next deploy (push to GitHub or trigger a rebuild).
- Each page sets its own title, description, canonical link, social-share tags and structured data (Organization, Product, Breadcrumb). Admin pages are marked `noindex`.
- After launch: add the site in Google Search Console and submit `https://yourdomain.com/sitemap.xml`.
