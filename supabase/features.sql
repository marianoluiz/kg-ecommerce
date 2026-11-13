-- Product details, sale prices, and Cash on Delivery.
-- Safe to re-run. Run in Supabase Dashboard → SQL Editor (after orders.sql and variants.sql).

-- ---------------------------------------------------------------
-- products: details text + optional sale price
-- sale_price NULL = not on sale. When set it must be below the regular price.
-- ---------------------------------------------------------------
alter table public.products
  add column if not exists description text,
  add column if not exists sale_price numeric(10, 2);

alter table public.products drop constraint if exists products_sale_price_check;
alter table public.products
  add constraint products_sale_price_check
  check (sale_price is null or (sale_price > 0 and sale_price < price));

-- ---------------------------------------------------------------
-- orders: payment method + whether stock was already taken.
-- PayPal orders take stock when paid (mark_order_paid).
-- COD orders take stock the moment they are placed (place_cod_order).
-- ---------------------------------------------------------------
alter table public.orders
  add column if not exists payment_method text not null default 'paypal',
  add column if not exists stock_reserved boolean not null default false;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check check (payment_method in ('paypal', 'cod'));

-- ---------------------------------------------------------------
-- place_cod_order: atomically takes stock for a COD order.
-- Raises 'out_of_stock' (and rolls everything back) if any size is short,
-- so two buyers can never both get the last unit. Server-only (service_role).
-- ---------------------------------------------------------------
create or replace function public.place_cod_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  line record;
begin
  update orders
     set stock_reserved = true
   where id = p_order_id
     and payment_method = 'cod'
     and status = 'pending'
     and stock_reserved = false;

  if not found then
    raise exception 'order_not_reservable';
  end if;

  for line in
    select product_id, size, sum(quantity)::int as qty
      from order_items
     where order_id = p_order_id
     group by product_id, size
  loop
    update product_variants
       set stock = stock - line.qty
     where product_id = line.product_id
       and size = line.size
       and stock >= line.qty;

    if not found then
      raise exception 'out_of_stock';
    end if;
  end loop;
end;
$$;

revoke execute on function public.place_cod_order(uuid) from public, anon, authenticated;
grant execute on function public.place_cod_order(uuid) to service_role;

-- ---------------------------------------------------------------
-- cancel_cod_order: admin cancels a COD order → give the stock back (once).
-- ---------------------------------------------------------------
create or replace function public.cancel_cod_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
     set status = 'cancelled', stock_reserved = false
   where id = p_order_id
     and payment_method = 'cod'
     and stock_reserved = true;

  if not found then
    return; -- nothing reserved (already cancelled / not COD)
  end if;

  update product_variants v
     set stock = v.stock + oi.qty
    from (
      select product_id, size, sum(quantity)::int as qty
        from order_items
       where order_id = p_order_id
       group by product_id, size
    ) oi
   where v.product_id = oi.product_id and v.size = oi.size;
end;
$$;

revoke execute on function public.cancel_cod_order(uuid) from public, anon, authenticated;
grant execute on function public.cancel_cod_order(uuid) to service_role;
