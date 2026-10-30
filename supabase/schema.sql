-- Run this ONCE in Supabase: SQL Editor > New query > paste > Run.

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  sort int default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references categories(id) on delete set null,
  price numeric not null default 0,
  old_price numeric,
  stock_status text not null default 'in_stock',
  description text default '',
  specs jsonb default '{}',
  images text[] default '{}',
  featured boolean default false,
  is_new boolean default false,
  visible boolean default true,
  created_at timestamptz default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  approved boolean default false,
  created_at timestamptz default now()
);

create sequence order_seq start 1001;

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default ('APGL-' || nextval('order_seq')),
  customer_name text not null,
  phone text not null,
  items text not null,
  total numeric default 0,
  status text not null default 'Pending',
  note text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now()
);

create table settings (
  id int primary key default 1,
  whatsapp text, phone text, email text, address text, hours text, announcement text
);
insert into settings (id, whatsapp, announcement) values (1, '2348000000000', 'Genuine lighting • Bulk & contractor prices • Chat with us on WhatsApp');

-- Who is an admin. Being logged in is NOT enough any more: your user id must be in this table.
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  must_change_password boolean default true,
  created_at timestamptz default now()
);
create function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;

-- Security: public can READ the shop, but only the signed-in admin can change anything.
alter table categories enable row level security;
alter table products   enable row level security;
alter table reviews    enable row level security;
alter table orders     enable row level security;
alter table enquiries  enable row level security;
alter table settings   enable row level security;
alter table admins     enable row level security;

create policy "public read categories" on categories for select using (true);
create policy "public read visible products" on products for select using (visible = true);
create policy "public read approved reviews" on reviews for select using (approved = true);
create policy "public read settings" on settings for select using (true);
-- Visitors may submit a review, but it must start unapproved:
create policy "public submit review" on reviews for insert with check (approved = false);
create policy "public log enquiry" on enquiries for insert with check (true);

create policy "admins see admins" on admins for select to authenticated using (is_admin());
create policy "admin updates own row" on admins for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "admin all categories" on categories for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all products"   on products   for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all reviews"    on reviews    for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all orders"     on orders     for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all enquiries"  on enquiries  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all settings"   on settings   for all to authenticated using (is_admin()) with check (is_admin());

-- Customers check an order with code + phone. This function returns ONLY that one order's status.
create function lookup_order(p_code text, p_phone text)
returns table (code text, status text, items text, note text, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select o.code, o.status, o.items, o.note, o.updated_at from orders o
  where lower(o.code) = lower(trim(p_code))
    and right(regexp_replace(o.phone, '\D', '', 'g'), 10) = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  limit 1;
$$;
grant execute on function lookup_order to anon, authenticated;

-- Photo storage (public bucket; only admin can upload)
insert into storage.buckets (id, name, public) values ('products', 'products', true);
create policy "public view photos" on storage.objects for select using (bucket_id = 'products');
create policy "admin upload photos" on storage.objects for insert to authenticated with check (bucket_id = 'products' and is_admin());
create policy "admin delete photos" on storage.objects for delete to authenticated using (bucket_id = 'products' and is_admin());

-- FIRST ADMIN (run after you create the user in Authentication > Users with a default password):
-- insert into admins (user_id, email, must_change_password)
-- select id, email, true from auth.users where email = 'client@example.com';
