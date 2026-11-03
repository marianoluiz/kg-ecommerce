import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPeso } from "@/lib/format";
import { formatOrderNumber, STATUS_TEXT } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Order Confirmation | KALLOS GORGON" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


// The URL holds the order's random UUID, so knowing it is enough to view the order.
export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!UUID_RE.test(reference)) notFound();

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("order_number, customer_name, email, shipping_address, total, status, created_at, order_items(product_name, size, quantity, unit_price)")
    .eq("id", reference)
    .single();

  if (!order) notFound();

  return (
    <section className="checkout-section">
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>{order.status === "paid" ? "Thank You" : "Order Status"}</h2>
          <p>Order No. {formatOrderNumber(order.order_number)}</p>
          <span className={`order-status${order.status === "paid" ? " paid" : ""}`}>
            {STATUS_TEXT[order.status] ?? order.status}
          </span>
        </div>

        <div className="order-meta">
          <p>{order.customer_name}</p>
          <p>{order.email}</p>
          <p>{order.shipping_address}</p>
          <p>Placed {new Date(order.created_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</p>
          <Link href="/#shop" className="btn" style={{ marginTop: "2rem" }}>
            Continue Shopping
          </Link>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {order.order_items.map((item, i) => (
            <div className="summary-item" key={i}>
              <span>
                {item.product_name} ({item.size}) × {item.quantity}
              </span>
              <span>{formatPeso(Number(item.unit_price) * item.quantity)}</span>
            </div>
          ))}
          <div className="total-line">
            <span>Total</span>
            <span>{formatPeso(Number(order.total))}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
