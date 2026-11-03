import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/auth";
import { formatPeso } from "@/lib/format";
import { formatOrderNumber, STATUS_TEXT } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "My Account | KALLOS GORGON" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Abandoned checkouts (pending/failed) are hidden from the customer.
  const { data: orders } = await createAdminClient()
    .from("orders")
    .select("id, order_number, status, total, created_at, order_items(product_name, size, quantity)")
    .eq("user_id", user.id)
    .not("status", "in", "(pending,failed)")
    .order("created_at", { ascending: false });

  return (
    <section className="checkout-section">
      <div className="account-container">
        <div className="checkout-header account-header">
          <div>
            <h2>My Account</h2>
            <p>Welcome, {user.fullName || "Customer"} · {user.email}</p>
          </div>
          <div className="account-actions">
            {user.isAdmin && (
              <Link href="/admin" className="btn">
                Admin Panel
              </Link>
            )}
            <form action={logout}>
              <button type="submit" className="btn">
                Log Out
              </button>
            </form>
          </div>
        </div>

        <h3 className="account-section-title">Order History</h3>

        {!orders || orders.length === 0 ? (
          <div className="account-empty">
            <p>You have no orders yet.</p>
            <Link href="/#shop" className="btn">
              Shop the Collection
            </Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <Link href={`/order/${order.id}`} className="order-row" key={order.id}>
                <div>
                  <span className="order-row-number">{formatOrderNumber(order.order_number)}</span>
                  <span className="order-row-date">
                    {new Date(order.created_at).toLocaleDateString("en-PH", { dateStyle: "medium" })}
                  </span>
                </div>
                <div className="order-row-items">
                  {order.order_items.map((item, i) => (
                    <span key={i}>
                      {item.product_name} ({item.size}) × {item.quantity}
                    </span>
                  ))}
                </div>
                <span className={`order-status${order.status === "paid" || order.status === "delivered" ? " paid" : ""}`}>
                  {STATUS_TEXT[order.status] ?? order.status}
                </span>
                <span className="order-row-total">{formatPeso(Number(order.total))}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
