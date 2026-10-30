# APGL Lighting Store

Jumia-style lighting catalogue for Ajay Pristine Golden Links Limited. Customers browse, then enquire on WhatsApp. No checkout.
Stack: React + Vite + Tailwind v4 + Supabase (database, login, photo storage).

## 1. Try it now (demo mode, no setup)
```
npm install
npm run dev
```
Open the site. Admin is at `/admin` (any email, password `admin123`). Demo data lives in your browser only.
Click **Reset demo data** in the admin banner to restore it.

## 2. Go live
1. Create a free project at supabase.com.
2. SQL Editor > paste `supabase/schema.sql` > Run.
3. Authentication > Users > **Add user** (the client's email + a strong password). That is the only admin login.
   Then Authentication > Providers > Email: turn **off** "Allow new users to sign up".
4. Copy `.env.example` to `.env` and fill in Project URL + anon key (Project Settings > API).
5. Run the site, sign in at `/admin`, open **Settings**, set the real WhatsApp number (format `2348012345678`).
6. Delete the demo products/categories and add the real ones.

## 3. Deploy (Cloudflare Pages, free for commercial use)
Build command `npm run build`, output folder `dist`, add the two `VITE_` variables. `public/_redirects` handles page refreshes.

## Where to change things
| Want to change | File |
|---|---|
| Brand colours | `src/index.css` (the `@theme` block) |
| Homepage trust strip text | `src/pages/Home.jsx` (`trust` array) |
| Hero slide speed | `src/pages/Home.jsx` (`5000`) |
| WhatsApp message wording | `ProductCard.jsx`, `Product.jsx`, `EnquiryList.jsx` |
| Order steps | `src/lib/format.js` (`ORDER_STEPS`) |
