-- NSP2P Database Schema
-- Run this in your Supabase SQL editor

-- Users table (synced from NS Auth)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  ns_sub text unique not null,              -- NS Auth subject (UUID)
  discord_username text not null,
  discord_id text,                          -- parsed from avatar URL
  display_name text not null,
  avatar_url text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Offers table
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null check (type in ('buy', 'sell')),
  premium_discount numeric(5,2) not null,   -- e.g. +2.0 or -1.0
  min_zec numeric(10,2),                    -- optional min
  max_zec numeric(10,2),                    -- optional max
  payment_methods text[] not null,          -- e.g. {'Venmo', 'Revolut', 'USD', 'USDC'}
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint valid_range check (
    min_zec is null or max_zec is null or min_zec <= max_zec
  )
);

-- Indexes
create index idx_offers_active on public.offers(is_active) where is_active = true;
create index idx_offers_user on public.offers(user_id);
create index idx_offers_type on public.offers(type);

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

create trigger offers_updated_at
  before update on public.offers
  for each row execute function public.update_updated_at();

-- Row Level Security
alter table public.users enable row level security;
alter table public.offers enable row level security;

-- Anyone can read active offers
create policy "Anyone can view active offers"
  on public.offers for select
  using (is_active = true);

-- Users can manage their own offers
create policy "Users can insert own offers"
  on public.offers for insert
  with check (auth.uid()::text = user_id::text);

create policy "Users can update own offers"
  on public.offers for update
  using (auth.uid()::text = user_id::text);

create policy "Users can delete own offers"
  on public.offers for delete
  using (auth.uid()::text = user_id::text);

-- Users can read all users (for offer display)
create policy "Anyone can view users"
  on public.users for select
  using (true);
