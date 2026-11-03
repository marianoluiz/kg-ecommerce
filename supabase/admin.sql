-- Profiles on signup, admin role, product image bucket, product read policy.
-- Safe to re-run. Run in Supabase Dashboard → SQL Editor.

-- ---------------------------------------------------------------
-- Create a profile row for every new user (name from signup form).
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users who signed up before this trigger existed.
insert into public.profiles (id, full_name)
select id, raw_user_meta_data ->> 'full_name' from auth.users
on conflict (id) do nothing;

-- Users can read their own profile. Role changes happen only here / in the dashboard.
alter table public.profiles enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- ---------------------------------------------------------------
-- Make the store owner an admin. Change the email for other admins.
-- ---------------------------------------------------------------
update public.profiles set role = 'admin'
 where id = (select id from auth.users where email = 'marianoluiz.king@gmail.com');

-- ---------------------------------------------------------------
-- Products: public can read; only the server (secret key) writes.
-- ---------------------------------------------------------------
alter table public.products enable row level security;
drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products
  for select to anon, authenticated
  using (true);

-- ---------------------------------------------------------------
-- Public bucket for product images (uploads go through the server).
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- ---------------------------------------------------------------
-- Review: every policy on products. Only "Public read products" (SELECT)
-- should remain. Any INSERT/UPDATE/DELETE/ALL policy for anon/public lets
-- anyone edit products — drop it with:
--   drop policy "<policyname>" on public.products;
-- ---------------------------------------------------------------
select policyname, cmd, roles from pg_policies
 where schemaname = 'public' and tablename = 'products';
