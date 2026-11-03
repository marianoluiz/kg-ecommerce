"use client";

import { PayPalOneTimePaymentButton, PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatPeso } from "@/lib/format";
import { useCart } from "./CartProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckoutView() {
  const { items, total, setQuantity, removeItem, clear, showToast } = useCart();
  const router = useRouter();
  const [customer, setCustomer] = useState({ name: "", address: "", email: "", phone: "" });
  const [agreedEcommerce, setAgreedEcommerce] = useState(false);
  const [agreedConsumer, setAgreedConsumer] = useState(false);
  const [processing, setProcessing] = useState(false);

  // PayPal callbacks can outlive a render; read the latest values through refs.
  const latest = useRef({ customer, items });
  latest.current = { customer, items };
  const reference = useRef<string | null>(null);

  const formValid = customer.name.trim() !== "" && customer.address.trim() !== "" && EMAIL_RE.test(customer.email.trim());
  const canPay = items.length > 0 && formValid && agreedEcommerce && agreedConsumer && !processing;

  const update = (field: keyof typeof customer) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCustomer((c) => ({ ...c, [field]: e.target.value }));

  async function createOrder() {
    const { customer, items } = latest.current;
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(data.error ?? "Could not start checkout.");
      throw new Error(data.error ?? `Checkout failed (${res.status})`);
    }
    reference.current = data.reference;
    return { orderId: data.paypalOrderId as string };
  }

  async function onApprove() {
    setProcessing(true);
    try {
      const res = await fetch(`/api/orders/${reference.current}/capture`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.retry ? "Payment declined. Try another payment method." : data.error ?? "Payment failed.");
        return;
      }
      clear();
      router.push(`/order/${data.reference}`);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="checkout-section">
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>Secure Checkout</h2>
          <p>Payments processed securely by PayPal. Card details never touch our servers.</p>
        </div>

        <div className="checkout-form">
          <div className="form-group">
            <label htmlFor="full-name">Full Name</label>
            <input id="full-name" type="text" placeholder="JUAN DELA CRUZ" autoComplete="name" value={customer.name} onChange={update("name")} />
          </div>
          <div className="form-group">
            <label htmlFor="shipping-address">Shipping Address</label>
            <input id="shipping-address" type="text" placeholder="UNIT / STREET / CITY / METRO MANILA" autoComplete="street-address" value={customer.address} onChange={update("address")} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" placeholder="CLIENT@DOMAIN.COM" autoComplete="email" value={customer.email} onChange={update("email")} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Mobile Number (optional)</label>
            <input id="phone" type="tel" placeholder="09XX XXX XXXX" autoComplete="tel" value={customer.phone} onChange={update("phone")} />
          </div>

          <div className="legal-checkbox">
            <input type="checkbox" id="ra8792" checked={agreedEcommerce} onChange={(e) => setAgreedEcommerce(e.target.checked)} />
            <label htmlFor="ra8792">I acknowledge that this transaction forms a legally binding Electronic Data Message under R.A. 8792 (E-Commerce Act).</label>
          </div>
          <div className="legal-checkbox">
            <input type="checkbox" id="ra7394" checked={agreedConsumer} onChange={(e) => setAgreedConsumer(e.target.checked)} />
            <label htmlFor="ra7394">I agree to the buyer protections and data processing standards set forth by R.A. 7394 (Consumer Act of the Philippines).</label>
          </div>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {items.length === 0 ? (
            <div className="empty-cart">Your cart is currently empty.</div>
          ) : (
            items.map((item) => (
              <div className="summary-item" key={`${item.productId}-${item.size}`}>
                <div>
                  <span>{item.name} ({item.size})</span>
                  <div className="qty-controls">
                    <button type="button" aria-label={`Decrease ${item.name}`} onClick={() => setQuantity(item.productId, item.size, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={`Increase ${item.name}`} onClick={() => setQuantity(item.productId, item.size, item.quantity + 1)}>+</button>
                    <button type="button" className="qty-remove" onClick={() => removeItem(item.productId, item.size)}>Remove</button>
                  </div>
                </div>
                <span>{formatPeso(item.price * item.quantity)}</span>
              </div>
            ))
          )}
          <div className="total-line">
            <span>Total</span>
            <span>{formatPeso(total)}</span>
          </div>

          <div className="paypal-area">
            {processing && <p className="paypal-hint">Confirming payment…</p>}
            {!canPay && !processing && items.length > 0 && (
              <p className="paypal-hint">Fill in your name, email and address and accept both agreements to pay.</p>
            )}
            <PayPalProvider
              clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!}
              environment={process.env.NEXT_PUBLIC_PAYPAL_ENV === "production" ? "production" : "sandbox"}
              components={["paypal-payments"]}
              pageType="checkout"
            >
              <PayPalOneTimePaymentButton
                type="pay"
                disabled={!canPay}
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={() => showToast("Payment cancelled.")}
                onError={(error) => {
                  console.error("PayPal error:", error);
                  showToast("PayPal error. Please try again.");
                }}
              />
            </PayPalProvider>
          </div>
        </div>
      </div>
    </section>
  );
}
