export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled", "failed"] as const;

export const STATUS_TEXT: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment failed",
};

export const PAYMENT_METHODS = ["paypal", "cod"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_TEXT: Record<string, string> = { paypal: "PayPal", cod: "Cash on Delivery" };

// A COD order stays "pending" until delivery, which reads as "Awaiting payment" for PayPal but not for COD.
export const statusText = (status: string, method?: string | null) =>
  status === "pending" && method === "cod" ? "Pay on delivery" : STATUS_TEXT[status] ?? status;

export const formatOrderNumber = (n: number) => `KG-${String(n).padStart(6, "0")}`;
