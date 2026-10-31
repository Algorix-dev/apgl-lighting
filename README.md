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
8. Delete the demo products/categories and add the real ones.

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
