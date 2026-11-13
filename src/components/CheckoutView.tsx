"use client";

import { PayPalOneTimePaymentButton, PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatPeso } from "@/lib/format";
import type { PaymentMethod } from "@/lib/orders";
import { useCart } from "./CartProvider";
import { Spinner } from "./FormControls";
import { Modal } from "./Modal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckoutView() {
  const { items, total, setQuantity, removeItem, clear, showToast } = useCart();
  const router = useRouter();
  const [customer, setCustomer] = useState({ name: "", address: "", email: "", phone: "" });
  const [agreedEcommerce, setAgreedEcommerce] = useState(false);
  const [agreedConsumer, setAgreedConsumer] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmCod, setConfirmCod] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("paypal");

  // PayPal callbacks can outlive a render; read the latest values through refs.
  const latest = useRef({ customer, items });
  latest.current = { customer, items };
  const reference = useRef<string | null>(null);

  const formValid = customer.name.trim() !== "" && customer.address.trim() !== "" && EMAIL_RE.test(customer.email.trim());
  // COD: the courier phones before delivery, so a mobile number is required.
  const phoneOk = method !== "cod" || customer.phone.replace(/\D/g, "").length >= 7;
  const canPay = items.length > 0 && formValid && phoneOk && agreedEcommerce && agreedConsumer && !processing;

  const update = (field: keyof typeof customer) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCustomer((c) => ({ ...c, [field]: e.target.value }));

  async function createOrder() {
    const { customer, items } = latest.current;
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        paymentMethod: "paypal",
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

  async function placeCodOrder() {
    if (!canPay) return;
    setConfirmCod(false);
    setProcessing(true);
    try {
      const { customer, items } = latest.current;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          paymentMethod: "cod",
          items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error ?? "Could not place your order.");
        return;
      }
      clear();
      router.push(`/order/${data.reference}`);
    } finally {
      setProcessing(false);
    }
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
          <p>Pay securely with PayPal, or pay in cash when your order arrives. Card details never touch our servers.</p>
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
            <label htmlFor="phone">Mobile Number{method === "cod" ? " (required for Cash on Delivery)" : " (optional)"}</label>
            <input id="phone" type="tel" placeholder="09XX XXX XXXX" autoComplete="tel" value={customer.phone} onChange={update("phone")} />
          </div>

          <fieldset className="payment-methods">
            <legend>Payment Method</legend>
            <label className={`payment-option${method === "paypal" ? " selected" : ""}`}>
              <input type="radio" name="payment-method" checked={method === "paypal"} onChange={() => setMethod("paypal")} />
              <span>PayPal<small>Pay now with PayPal or a card.</small></span>
            </label>
            <label className={`payment-option${method === "cod" ? " selected" : ""}`}>
              <input type="radio" name="payment-method" checked={method === "cod"} onChange={() => setMethod("cod")} />
              <span>Cash on Delivery<small>Pay the courier in cash when your order arrives.</small></span>
            </label>
          </fieldset>

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
            {processing && (
              <p className="paypal-hint paypal-hint-busy" role="status">
                <Spinner /> {method === "cod" ? "Placing your order…" : "Confirming payment…"}
              </p>
            )}
            {!canPay && !processing && items.length > 0 && (
              <p className="paypal-hint">
                {method === "cod"
                  ? "Fill in your name, email, address and mobile number and accept both agreements to place your order."
                  : "Fill in your name, email and address and accept both agreements to pay."}
              </p>
            )}
            {method === "cod" ? (
              <button type="button" className="btn checkout-btn cod-btn" style={{ marginTop: 0 }} disabled={!canPay} onClick={() => setConfirmCod(true)}>
                {processing ? (
                  <>
                    <Spinner /> Placing order…
                  </>
                ) : (
                  <>Place Order · Pay {formatPeso(total)} on Delivery</>
                )}
              </button>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      <Modal open={confirmCod} title="Place your order?" onClose={() => setConfirmCod(false)}>
        <p>You will pay {formatPeso(total)} in cash when your order arrives at {customer.address || "your address"}. We will reserve your items right away.</p>
        <div className="confirm-actions">
          <button type="button" className="btn" onClick={() => setConfirmCod(false)}>Review Order</button>
          <button type="button" className="btn btn-solid" onClick={placeCodOrder}>Place Order</button>
        </div>
      </Modal>

      {processing && (
        <div className="processing-overlay" role="alert" aria-live="assertive">
          <Spinner />
          <p>{method === "cod" ? "Placing your order…" : "Confirming your payment…"}</p>
          <span>Please don&apos;t close this page.</span>
        </div>
      )}
    </section>
  );
}
