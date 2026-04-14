create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  dashboard_password_hash text,
  tagline text,
  whatsapp_number text,
  phone_number text,
  promo_title text,
  promo_text text,
  hero_image_url text,
  menu_pdf_url text,
  maps_embed_url text,
  address text,
  location_hint text,
  hours_label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.restaurants
add column if not exists dashboard_password_hash text;

alter table public.restaurants
add column if not exists lead_capture_title text;

alter table public.restaurants
add column if not exists lead_capture_text text;

alter table public.restaurants
add column if not exists lead_capture_button_text text;

alter table public.restaurants
add column if not exists lead_capture_placement text default 'after_menu';

create table if not exists public.restaurant_gallery (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10, 2),
  currency text default 'RWF',
  image_url text,
  tags text[] default '{}',
  is_featured boolean not null default false,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.menu_items
add column if not exists currency text default 'RWF';

alter table public.menu_items
add column if not exists tags text[] default '{}';

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_leads (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  phone text not null,
  source text not null default 'qr_join_club',
  created_at timestamptz not null default now()
);

create table if not exists public.qr_scans (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  slug text not null,
  scanned_at timestamptz not null default now(),
  user_agent text,
  referrer text
);

create table if not exists public.promo_claims (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  promo_text_snapshot text,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_item_views (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create table if not exists public.restaurant_action_clicks (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  action_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_restaurant_notes (
  restaurant_id uuid primary key references public.restaurants(id) on delete cascade,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists idx_restaurants_slug on public.restaurants(slug);
create index if not exists idx_restaurant_gallery_restaurant_id on public.restaurant_gallery(restaurant_id, sort_order);
create index if not exists idx_menu_categories_restaurant_id on public.menu_categories(restaurant_id, sort_order);
create unique index if not exists idx_menu_categories_restaurant_id_name on public.menu_categories(restaurant_id, name);
create index if not exists idx_menu_items_restaurant_id on public.menu_items(restaurant_id, sort_order);
create unique index if not exists idx_menu_items_restaurant_id_name on public.menu_items(restaurant_id, name);
create index if not exists idx_events_restaurant_id on public.events(restaurant_id, start_at);
create index if not exists idx_customer_leads_restaurant_id on public.customer_leads(restaurant_id, created_at desc);
create index if not exists idx_qr_scans_restaurant_id on public.qr_scans(restaurant_id, scanned_at desc);
create index if not exists idx_promo_claims_restaurant_id on public.promo_claims(restaurant_id, created_at desc);
create index if not exists idx_menu_item_views_restaurant_id on public.menu_item_views(restaurant_id, viewed_at desc);
create index if not exists idx_restaurant_action_clicks_restaurant_id on public.restaurant_action_clicks(restaurant_id, action_type, created_at desc);
create index if not exists idx_admin_restaurant_notes_updated_at on public.admin_restaurant_notes(updated_at desc);

alter table public.restaurants enable row level security;
alter table public.restaurant_gallery enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.events enable row level security;
alter table public.customer_leads enable row level security;
alter table public.qr_scans enable row level security;
alter table public.promo_claims enable row level security;
alter table public.menu_item_views enable row level security;
alter table public.restaurant_action_clicks enable row level security;
alter table public.admin_restaurant_notes enable row level security;

drop policy if exists "public can read active restaurants" on public.restaurants;
create policy "public can read active restaurants"
on public.restaurants
for select
to anon
using (is_active = true);

drop policy if exists "public can read gallery" on public.restaurant_gallery;
create policy "public can read gallery"
on public.restaurant_gallery
for select
to anon
using (
  exists (
    select 1
    from public.restaurants
    where public.restaurants.id = public.restaurant_gallery.restaurant_id
      and public.restaurants.is_active = true
  )
);

drop policy if exists "public can read categories" on public.menu_categories;
create policy "public can read categories"
on public.menu_categories
for select
to anon
using (
  exists (
    select 1
    from public.restaurants
    where public.restaurants.id = public.menu_categories.restaurant_id
      and public.restaurants.is_active = true
  )
);

drop policy if exists "public can read menu items" on public.menu_items;
create policy "public can read menu items"
on public.menu_items
for select
to anon
using (
  exists (
    select 1
    from public.restaurants
    where public.restaurants.id = public.menu_items.restaurant_id
      and public.restaurants.is_active = true
  )
);

drop policy if exists "public can read events" on public.events;
create policy "public can read events"
on public.events
for select
to anon
using (
  exists (
    select 1
    from public.restaurants
    where public.restaurants.id = public.events.restaurant_id
      and public.restaurants.is_active = true
  )
);

drop policy if exists "public can insert customer leads" on public.customer_leads;
create policy "public can insert customer leads"
on public.customer_leads
for insert
to anon
with check (
  exists (
    select 1
    from public.restaurants
    where public.restaurants.id = public.customer_leads.restaurant_id
      and public.restaurants.is_active = true
  )
);

drop policy if exists "public can insert restaurant action clicks" on public.restaurant_action_clicks;
create policy "public can insert restaurant action clicks"
on public.restaurant_action_clicks
for insert
to anon
with check (
  action_type in ('whatsapp_click', 'waiter_call')
  and exists (
    select 1
    from public.restaurants
    where public.restaurants.id = public.restaurant_action_clicks.restaurant_id
      and public.restaurants.is_active = true
  )
);

create or replace view public.restaurant_owner_metrics as
select
  r.id as restaurant_id,
  r.name,
  r.slug,
  coalesce(scans.total_scans, 0) as total_qr_scans,
  coalesce(leads.total_leads, 0) as total_leads,
  coalesce(claims.total_claims, 0) as total_promo_claims
from public.restaurants r
left join (
  select restaurant_id, count(*) as total_scans
  from public.qr_scans
  group by restaurant_id
) scans on scans.restaurant_id = r.id
left join (
  select restaurant_id, count(*) as total_leads
  from public.customer_leads
  group by restaurant_id
) leads on leads.restaurant_id = r.id
left join (
  select restaurant_id, count(*) as total_claims
  from public.promo_claims
  group by restaurant_id
) claims on claims.restaurant_id = r.id;

insert into public.restaurants (
  name,
  slug,
  dashboard_password_hash,
  tagline,
  whatsapp_number,
  phone_number,
  promo_title,
  promo_text,
  hero_image_url,
  menu_pdf_url,
  maps_embed_url,
  address,
  location_hint,
  hours_label
)
values (
  'Aurum Dining',
  'aurum-dining',
  'tableflowdemoseed:27af462aea56bb022cf898f3b0ad8fc70ed87390cf150ca9ec6d6f76efae5b8f65b56b776cae195a4109b68174b9ac82d5def2b41924f46c072b518c12773871',
  'A curated culinary journey designed for the discerning palate.',
  '250787878745',
  '250787878745',
  'Buy 1 Get 1 Free Pizza',
  'Available today only for dine-in guests. Pair with our signature cocktail flight for the ultimate experience.',
  '/images/StockCake-Elegant_Dinner_Plate-1117095-medium.jpg',
  '/menu/menu.pdf',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3067.172677359789!2d30.05870547648075!3d-1.952530998422797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19d5f39a5f5f8c9d%3A0x2e59f28d22b7f1d2!2sKigali!5e0!3m2!1sen!2srw!4v1718192026759!5m2!1sen!2srw',
  'Kigali, Rwanda',
  'Find us in the heart of the city',
  'Open daily from 12:00 PM to 1:00 AM.'
)
on conflict (slug) do nothing;

update public.restaurants
set
  lead_capture_title = coalesce(lead_capture_title, 'Get updates from Aurum Dining'),
  lead_capture_text = coalesce(lead_capture_text, 'Leave your name and WhatsApp number to hear about special nights, chef events, and return offers.'),
  lead_capture_button_text = coalesce(lead_capture_button_text, 'Get Updates'),
  lead_capture_placement = coalesce(lead_capture_placement, 'after_menu')
where slug = 'aurum-dining';

update public.restaurants
set dashboard_password_hash = 'tableflowdemoseed:27af462aea56bb022cf898f3b0ad8fc70ed87390cf150ca9ec6d6f76efae5b8f65b56b776cae195a4109b68174b9ac82d5def2b41924f46c072b518c12773871'
where slug = 'aurum-dining'
  and dashboard_password_hash is null;

with restaurant_ref as (
  select id
  from public.restaurants
  where slug = 'aurum-dining'
),
category_seed as (
  select *
  from (
    values
      ('Starters', 1),
      ('Signature Plates', 2),
      ('Pizza', 3),
      ('Cocktails', 4),
      ('Desserts', 5)
  ) as categories(name, sort_order)
),
category_rows as (
  insert into public.menu_categories (restaurant_id, name, sort_order)
  select restaurant_ref.id, category_seed.name, category_seed.sort_order
  from restaurant_ref
  cross join category_seed
  on conflict (restaurant_id, name) do update
  set sort_order = excluded.sort_order
  returning id, restaurant_id
)
insert into public.menu_items (
  restaurant_id,
  category_id,
  name,
  description,
  price,
  image_url,
  is_featured,
  sort_order
)
select
  restaurant_ref.id,
  (
    select public.menu_categories.id
    from public.menu_categories
    where public.menu_categories.restaurant_id = restaurant_ref.id
      and public.menu_categories.name = category_name
    limit 1
  ),
  item_name,
  item_description,
  item_price,
  'RWF',
  item_image,
  item_tags,
  is_featured,
  is_available,
  sort_order
from restaurant_ref
cross join (
  values
    ('Starters', 'Truffle Burrata', 'Creamy burrata, black truffle, basil oil.', 18000.00, '/images/StockCake-Elegant_Dessert_Presentation-1156468-medium.jpg', array['Vegetarian', 'Popular'], true, true, 1),
    ('Signature Plates', 'Prime Ribeye', 'Dry-aged cut with rosemary jus.', 34000.00, '/images/StockCake-Elegant_Dinner_Plate-1117095-medium.jpg', array['Chef''s Pick'], true, true, 2),
    ('Signature Plates', 'Gold Burger', 'Aged cheddar, brioche, smoked aioli.', 16000.00, '/images/StockCake-Juicy_Gourmet_Burger-927567-medium.jpg', array['Popular'], true, true, 3),
    ('Pizza', 'Pepperoni Royale', 'Stone-baked pizza with house blend.', 19000.00, '/images/StockCake-Delicious_Pepperoni_Pizza-838995-medium.jpg', array['Spicy'], true, true, 4),
    ('Signature Plates', 'Crispy Heritage', 'Buttermilk chicken with honey glaze.', 22000.00, '/images/StockCake-Crispy_fried_chicken-1343081-medium.jpg', array['Signature'], true, false, 5),
    ('Cocktails', 'Sunset Elixir', 'Tropical fruits, citrus bitters, chilled finish.', 12000.00, '/images/StockCake-Tropical_Cocktail_Drink-89420-medium.jpg', array['Fresh'], false, true, 6)
) as seed(category_name, item_name, item_description, item_price, item_image, item_tags, is_featured, is_available, sort_order)
on conflict (restaurant_id, name) do update
set
  category_id = excluded.category_id,
  description = excluded.description,
  price = excluded.price,
  currency = excluded.currency,
  image_url = excluded.image_url,
  tags = excluded.tags,
  is_featured = excluded.is_featured,
  is_available = excluded.is_available,
  sort_order = excluded.sort_order;

with restaurant_ref as (
  select id
  from public.restaurants
  where slug = 'aurum-dining'
)
update public.menu_items
set
  category_id = categories.id,
  currency = coalesce(public.menu_items.currency, 'RWF'),
  price = case
    when public.menu_items.name = 'Truffle Burrata' and coalesce(public.menu_items.price, 0) < 1000 then 18000.00
    when public.menu_items.name = 'Prime Ribeye' and coalesce(public.menu_items.price, 0) < 1000 then 34000.00
    when public.menu_items.name = 'Gold Burger' and coalesce(public.menu_items.price, 0) < 1000 then 16000.00
    when public.menu_items.name = 'Pepperoni Royale' and coalesce(public.menu_items.price, 0) < 1000 then 19000.00
    when public.menu_items.name = 'Crispy Heritage' and coalesce(public.menu_items.price, 0) < 1000 then 22000.00
    else public.menu_items.price
  end,
  tags = case
    when public.menu_items.name = 'Truffle Burrata' and coalesce(array_length(public.menu_items.tags, 1), 0) = 0 then array['Vegetarian', 'Popular']
    when public.menu_items.name = 'Prime Ribeye' and coalesce(array_length(public.menu_items.tags, 1), 0) = 0 then array['Chef''s Pick']
    when public.menu_items.name = 'Gold Burger' and coalesce(array_length(public.menu_items.tags, 1), 0) = 0 then array['Popular']
    when public.menu_items.name = 'Pepperoni Royale' and coalesce(array_length(public.menu_items.tags, 1), 0) = 0 then array['Spicy']
    when public.menu_items.name = 'Crispy Heritage' and coalesce(array_length(public.menu_items.tags, 1), 0) = 0 then array['Signature']
    else public.menu_items.tags
  end
from public.menu_categories categories
where public.menu_items.restaurant_id = restaurant_ref.id
  and categories.restaurant_id = restaurant_ref.id
  and (
    (public.menu_items.name = 'Truffle Burrata' and categories.name = 'Starters')
    or (public.menu_items.name = 'Prime Ribeye' and categories.name = 'Signature Plates')
    or (public.menu_items.name = 'Gold Burger' and categories.name = 'Signature Plates')
    or (public.menu_items.name = 'Pepperoni Royale' and categories.name = 'Pizza')
    or (public.menu_items.name = 'Crispy Heritage' and categories.name = 'Signature Plates')
    or (public.menu_items.name = 'Sunset Elixir' and categories.name = 'Cocktails')
  );

with restaurant_ref as (
  select id
  from public.restaurants
  where slug = 'aurum-dining'
)
insert into public.events (
  restaurant_id,
  title,
  description,
  start_at
)
select
  restaurant_ref.id,
  title,
  description,
  start_at
from restaurant_ref
cross join (
  values
    ('Live Jazz Quartet', 'Smooth classics with a candlelit dinner setting.', now() + interval '2 day'),
    ('Rooftop DJ Set', 'Deep house sessions and crafted cocktails.', now() + interval '3 day'),
    ('Chef''s Table', 'Five-course tasting with wine pairing.', now() + interval '4 day')
) as seed(title, description, start_at)
where not exists (
  select 1
  from public.events
  where public.events.restaurant_id = restaurant_ref.id
);
