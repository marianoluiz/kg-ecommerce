-- Per-size stock: one product_variants row per product + size.
-- products.stock is kept as the automatic total of all sizes.
-- Safe to re-run (seeding only fills products that have no variants yet).
-- Run in Supabase Dashboard → SQL Editor.

create table if not exists public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  size text not null check (size in ('XS', 'S', 'M', 'L', 'XL')),
  stock integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);

alter table public.product_variants enable row level security;
drop policy if exists "Public read variants" on public.product_variants;
create policy "Public read variants" on public.product_variants
  for select to anon, authenticated
  using (true);

-- ---------------------------------------------------------------
-- Seed: split each existing product's stock evenly over the 5 sizes.
-- Remainder goes to M, L, S, XL, XS in that order.
-- ---------------------------------------------------------------
insert into public.product_variants (product_id, size, stock)
select p.id, s.size, (p.stock / 5) + case when s.rank <= p.stock % 5 then 1 else 0 end
  from public.products p
 cross join (values ('M', 1), ('L', 2), ('S', 3), ('XL', 4), ('XS', 5)) as s(size, rank)
 where not exists (select 1 from public.product_variants v where v.product_id = p.id);

-- ---------------------------------------------------------------
-- Keep products.stock = sum of its sizes.
-- ---------------------------------------------------------------
create or replace function public.sync_product_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id bigint := coalesce(new.product_id, old.product_id);
begin
  update products
     set stock = (select coalesce(sum(stock), 0) from product_variants where product_id = v_product_id)
   where id = v_product_id;
  return null;
end;
$$;

drop trigger if exists product_variants_sync_stock on public.product_variants;
create trigger product_variants_sync_stock
  after insert or update or delete on public.product_variants
  for each row execute function public.sync_product_stock();

-- ---------------------------------------------------------------
-- mark_order_paid now reduces stock for the exact size bought.
-- ---------------------------------------------------------------
create or replace function public.mark_order_paid(p_order_id uuid, p_capture_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
     set status = 'paid', paypal_capture_id = p_capture_id, paid_at = now()
   where id = p_order_id and status = 'pending';

  if not found then
    return false; -- already paid or not found
  end if;

  update product_variants v
     set stock = greatest(v.stock - oi.qty, 0)
    from (
      select product_id, size, sum(quantity) as qty
        from order_items
       where order_id = p_order_id
       group by product_id, size
    ) oi
   where v.product_id = oi.product_id and v.size = oi.size;

  return true;
end;
$$;

revoke execute on function public.mark_order_paid(uuid, text) from public, anon, authenticated;
grant execute on function public.mark_order_paid(uuid, text) to service_role;

-- Check: per-size stock for every product.
select p.id, p.name, p.stock as total,
       string_agg(v.size || '=' || v.stock, '  ' order by array_position(array['XS','S','M','L','XL'], v.size)) as sizes
  from public.products p
  left join public.product_variants v on v.product_id = p.id
 group by p.id
 order by p.id;
