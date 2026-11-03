import { NextResponse } from "next/server";
import { SIZES } from "@/data/products";
import { createPayPalOrder } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type IncomingItem = { productId: string; size: string; quantity: number };

const MAX_LINES = 30;
const MAX_QTY = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Creates a pending order (prices from the DB) and a matching PayPal order.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return bad("Invalid request.");

  const customer = {
    name: text(body.customer?.name, 120),
    email: text(body.customer?.email, 200),
    phone: text(body.customer?.phone, 40),
    address: text(body.customer?.address, 500),
  };
  if (!customer.name || !customer.address || !EMAIL_RE.test(customer.email)) {
    return bad("Please fill in your name, a valid email and your shipping address.");
  }

  const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0 || rawItems.length > MAX_LINES) return bad("Your cart is empty.");

  const items: IncomingItem[] = [];
  for (const raw of rawItems) {
    const item = raw as Partial<IncomingItem>;
    const quantity = Number(item.quantity);
    if (
      typeof item.productId !== "string" ||
      !SIZES.includes(item.size as (typeof SIZES)[number]) ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY
    ) {
      return bad("Your cart contains an invalid item.");
    }
    items.push({ productId: item.productId, size: item.size as string, quantity });
  }

  const admin = createAdminClient();
  const productIds = [...new Set(items.map((i) => i.productId))];

  const { data: products, error: productError } = await admin
    .from("products")
    .select("id, name, price, is_active, product_variants(size, stock)")
    .in("id", productIds);

  if (productError) {
    console.error("Product lookup failed:", productError);
    return bad("Could not load products.", 500);
  }

  const byId = new Map((products ?? []).map((p) => [String(p.id), p]));
  const qtyBySize = new Map<string, number>();
  for (const item of items) {
    const key = `${item.productId}|${item.size}`;
    qtyBySize.set(key, (qtyBySize.get(key) ?? 0) + item.quantity);
  }

  for (const [key, qty] of qtyBySize) {
    const [id, size] = key.split("|");
    const product = byId.get(id);
    if (!product || !product.is_active) return bad("An item in your cart is no longer available.", 409);
    const stock = product.product_variants.find((v) => v.size === size)?.stock ?? 0;
    if (stock < qty) {
      return bad(
        stock === 0
          ? `${product.name} (${size}) is out of stock.`
          : `Only ${stock} left of ${product.name} (${size}).`,
        409
      );
    }
  }

  const lines = items.map((item) => {
    const product = byId.get(item.productId)!;
    return {
      product_id: product.id,
      product_name: product.name,
      size: item.size,
      quantity: item.quantity,
      unit_price: Number(product.price),
    };
  });
  const total = lines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);

  // Link the order to the customer if they happen to be logged in.
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ?? null;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      customer_name: customer.name,
      email: customer.email,
      phone: customer.phone || null,
      shipping_address: customer.address,
      total,
      currency: "PHP",
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order insert failed:", orderError);
    return bad("Could not create your order.", 500);
  }

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));

  if (itemsError) {
    console.error("Order items insert failed:", itemsError);
    await admin.from("orders").delete().eq("id", order.id);
    return bad("Could not create your order.", 500);
  }

  try {
    const paypalOrderId = await createPayPalOrder(order.id, total);
    await admin.from("orders").update({ paypal_order_id: paypalOrderId }).eq("id", order.id);
    return NextResponse.json({ reference: order.id, paypalOrderId });
  } catch (error) {
    console.error(error);
    await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
    return bad("Could not start PayPal payment.", 502);
  }
}
