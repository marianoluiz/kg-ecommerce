"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPeso } from "@/lib/format";
import { useCart } from "./CartProvider";

export function CheckoutView() {
  const { items, total, clear, showToast } = useCart();
  const router = useRouter();
  const [agreedEcommerce, setAgreedEcommerce] = useState(false);
  const [agreedConsumer, setAgreedConsumer] = useState(false);
  const [processing, setProcessing] = useState(false);

  const processOrder = () => {
    if (items.length === 0) return showToast("Cart is empty.");
    if (!agreedEcommerce || !agreedConsumer) return showToast("Acknowledge legal agreements to proceed.");

    setProcessing(true);
    setTimeout(() => {
      clear();
      setProcessing(false);
      router.push("/");
      showToast("Contract Formed: Order processed.");
    }, 2500);
  };

  return (
    <section className="checkout-section">
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>Secure Checkout</h2>
          <p>Encrypted Electronic Data Interchange (EDI) compliant.</p>
        </div>

        <div className="checkout-form">
          <div className="form-group">
            <label htmlFor="full-name">Full Name</label>
            <input id="full-name" type="text" placeholder="JUAN DELA CRUZ" />
          </div>
          <div className="form-group">
            <label htmlFor="shipping-address">Shipping Address</label>
            <input id="shipping-address" type="text" placeholder="UNIT / STREET / CITY / METRO MANILA" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" placeholder="CLIENT@DOMAIN.COM" />
          </div>
          <div className="form-group form-group-spaced">
            <label htmlFor="card-details">Card Details</label>
            <input id="card-details" type="text" placeholder="XXXX XXXX XXXX XXXX" />
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
            items.map((item, i) => (
              <div className="summary-item" key={`${item.id}-${i}`}>
                <span>{item.name}</span>
                <span>{formatPeso(item.price)}</span>
              </div>
            ))
          )}
          <div className="total-line">
            <span>Total</span>
            <span>{formatPeso(total)}</span>
          </div>
          <button type="button" className="btn checkout-btn" onClick={processOrder} disabled={processing}>
            {processing ? "PROCESSING EDI INTERCHANGE..." : "COMPLETE PURCHASE"}
          </button>
        </div>
      </div>
    </section>
  );
}
