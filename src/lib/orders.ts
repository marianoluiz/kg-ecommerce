export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled", "failed"] as const;

export const STATUS_TEXT: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment failed",
};

export const formatOrderNumber = (n: number) => `KG-${String(n).padStart(6, "0")}`;
