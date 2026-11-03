import type { Metadata } from "next";
import Link from "next/link";
import { SIZES } from "@/data/products";
import { requireAdmin } from "@/lib/auth";
import { formatPeso } from "@/lib/format";
import { formatOrderNumber, ORDER_STATUSES, STATUS_TEXT } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { createProduct, updateOrderStatus, updateProduct } from "./actions";

export const metadata: Metadata = { title: "Admin | KALLOS GORGON" };

type Tab = "orders" | "products";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; message?: string; show?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const tab: Tab = params.tab === "products" ? "products" : "orders";

  return (
    <section className="checkout-section">
      <div className="admin-container">
        <div className="checkout-header">
          <h2>Admin</h2>
          <nav className="admin-tabs">
            <Link href="/admin?tab=orders" className={tab === "orders" ? "active" : ""}>Orders</Link>
            <Link href="/admin?tab=products" className={tab === "products" ? "active" : ""}>Products</Link>
          </nav>
        </div>

        {params.message && <p className="admin-message" role="status">{params.message}</p>}

        {tab === "orders" ? <OrdersTab showAll={params.show === "all"} /> : <ProductsTab />}
      </div>
    </section>
  );
}

async function OrdersTab({ showAll }: { showAll: boolean }) {
  let query = createAdminClient()
    .from("orders")
    .select("id, order_number, status, total, customer_name, email, phone, shipping_address, paypal_capture_id, created_at, order_items(product_name, size, quantity, unit_price)")
    .order("created_at", { ascending: false })
    .limit(200);

  // Unpaid checkouts are noise; hide them unless asked.
  if (!showAll) query = query.not("status", "in", "(pending,failed)");

  const { data: orders, error } = await query;
  if (error) return <p className="admin-message">Could not load orders: {error.message}</p>;

  const revenue = (orders ?? [])
    .filter((o) => o.status !== "pending" && o.status !== "failed" && o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <>
      <div className="admin-toolbar">
        <span>{orders?.length ?? 0} orders{showAll ? "" : ` · ${formatPeso(revenue)} revenue`}</span>
        <Link href={showAll ? "/admin?tab=orders" : "/admin?tab=orders&show=all"}>
          {showAll ? "Hide unpaid checkouts" : "Show unpaid checkouts"}
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <p className="empty-cart">No orders yet.</p>
      ) : (
        <div className="admin-orders">
          {orders.map((order) => (
            <article className="admin-card" key={order.id}>
              <header>
                <strong>{formatOrderNumber(order.order_number)}</strong>
                <span>{new Date(order.created_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</span>
                <span className="admin-total">{formatPeso(Number(order.total))}</span>
              </header>

              <div className="admin-card-body">
                <div>
                  <p>{order.customer_name}</p>
                  <p>{order.email}{order.phone ? ` · ${order.phone}` : ""}</p>
                  <p>{order.shipping_address}</p>
                  {order.paypal_capture_id && <p className="admin-muted">PayPal: {order.paypal_capture_id}</p>}
                </div>
                <ul>
                  {order.order_items.map((item, i) => (
                    <li key={i}>
                      {item.product_name} ({item.size}) × {item.quantity} — {formatPeso(Number(item.unit_price) * item.quantity)}
                    </li>
                  ))}
                </ul>
              </div>

              <form action={updateOrderStatus} className="admin-inline-form">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} aria-label="Order status">
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_TEXT[s]}</option>
                  ))}
                </select>
                <button type="submit" className="btn">Update</button>
              </form>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function SizeStockInputs({ values = {} }: { values?: Partial<Record<string, number>> }) {
  return (
    <fieldset className="admin-sizes">
      <legend>Stock per size</legend>
      {SIZES.map((size) => (
        <label key={size}>
          {size}
          <input name={`stock_${size}`} type="number" min="0" step="1" defaultValue={values[size] ?? 0} required />
        </label>
      ))}
    </fieldset>
  );
}

async function ProductsTab() {
  const { data: products, error } = await createAdminClient()
    .from("products")
    .select("id, name, price, stock, image_url, is_active, product_variants(size, stock)")
    .order("is_active", { ascending: false })
    .order("id");

  if (error) return <p className="admin-message">Could not load products: {error.message}</p>;

  return (
    <>
      <form action={createProduct} className="admin-card admin-new-product">
        <h3>Add New Product</h3>
        <div className="admin-grid">
          <label>Name<input name="name" required maxLength={120} /></label>
          <label>Price (₱)<input name="price" type="number" min="1" step="0.01" required /></label>
          <label className="admin-span-2">Image<input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/avif" required /></label>
          <SizeStockInputs />
          <label className="admin-wide">Description (optional)<textarea name="description" rows={2} maxLength={1000} /></label>
        </div>
        <button type="submit" className="btn">Add Product</button>
      </form>

      <div className="admin-products">
        {products?.map((product) => (
          <form action={updateProduct} className="admin-card admin-product-row" key={product.id}>
            <input type="hidden" name="id" value={product.id} />
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt="" className="admin-thumb" />
            ) : (
              <div className="admin-thumb" />
            )}
            <div className="admin-product-name">
              <strong>{product.name}</strong>
              <span className="admin-muted">
                {product.is_active ? "Listed" : "Archived"} · {product.stock} total
              </span>
            </div>
            <label>Price<input name="price" type="number" min="1" step="0.01" defaultValue={Number(product.price)} required /></label>
            <SizeStockInputs
              values={Object.fromEntries(product.product_variants.map((v) => [v.size, v.stock]))}
            />
            <label className="admin-check">
              <input name="is_active" type="checkbox" defaultChecked={product.is_active} /> Listed in shop
            </label>
            <label>New image<input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/avif" /></label>
            <button type="submit" className="btn">Save</button>
          </form>
        ))}
      </div>
    </>
  );
}
