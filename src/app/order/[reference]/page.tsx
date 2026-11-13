import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPeso } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";
import { formatOrderNumber, PAYMENT_TEXT, statusText } from "@/lib/orders";
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
    .select("order_number, customer_name, email, phone, shipping_address, total, status, payment_method, paid_at, created_at, order_items(product_name, size, quantity, unit_price)")
    .eq("id", reference)
    .single();

  if (!order) notFound();

  return (
    <section className="checkout-section">
      <div className="checkout-container">
        <div className="checkout-header">
          <p className="print-only">KALLOS GORGON · Official Receipt</p>
          <h2>{order.status === "paid" || order.payment_method === "cod" ? "Thank You" : "Order Status"}</h2>
          <p>Order No. {formatOrderNumber(order.order_number)}</p>
          <span className={`order-status${order.status === "paid" || order.status === "delivered" ? " paid" : ""}`}>
            {statusText(order.status, order.payment_method)}
          </span>
        </div>

        <div className="order-meta">
          <p>{order.customer_name}</p>
          <p>{order.email}{order.phone ? ` · ${order.phone}` : ""}</p>
          <p>{order.shipping_address}</p>
          <p>Placed {new Date(order.created_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</p>
          <p>
            Payment: {PAYMENT_TEXT[order.payment_method] ?? order.payment_method}
            {order.payment_method === "cod" && order.status !== "delivered" && order.status !== "cancelled"
              ? ` — please prepare ${formatPeso(Number(order.total))} in cash`
              : ""}
          </p>
          {order.paid_at && (
            <p>Paid {new Date(order.paid_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</p>
          )}
          <div className="receipt-actions">
            <PrintButton />
            <Link href="/#shop" className="btn no-print">
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {order.order_items.map((item, i) => (
            <div className="summary-item" key={i}>
              <span>
                {item.product_name} ({item.size}) × {item.quantity}
                <span className="unit-price">{formatPeso(Number(item.unit_price))} each</span>
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
