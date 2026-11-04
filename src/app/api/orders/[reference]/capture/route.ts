import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS_TAG } from "@/lib/products";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Captures the PayPal payment and marks the order paid only if PayPal confirms the full amount.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  if (!UUID_RE.test(reference)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, total, status, paypal_order_id")
    .eq("id", reference)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status === "paid") return NextResponse.json({ status: "paid", reference });
  if (order.status !== "pending" || !order.paypal_order_id) {
    return NextResponse.json({ error: "This order can no longer be paid." }, { status: 409 });
  }

  // Re-check stock right before taking money: someone else may have bought the
  // last unit while this buyer had the PayPal window open.
  const { data: lines, error: linesError } = await admin
    .from("order_items")
    .select("product_id, size, quantity")
    .eq("order_id", reference);
  if (linesError || !lines?.length) {
    console.error(`Order ${reference} items lookup failed:`, linesError);
    return NextResponse.json({ error: "Payment could not be completed." }, { status: 500 });
  }

  const { data: variants, error: variantsError } = await admin
    .from("product_variants")
    .select("product_id, size, stock")
    .in("product_id", [...new Set(lines.map((l) => l.product_id))]);
  if (variantsError) {
    console.error(`Order ${reference} stock lookup failed:`, variantsError);
    return NextResponse.json({ error: "Payment could not be completed." }, { status: 500 });
  }

  const needed = new Map<string, number>();
  for (const l of lines) {
    const key = `${l.product_id}|${l.size}`;
    needed.set(key, (needed.get(key) ?? 0) + l.quantity);
  }
  const soldOut = [...needed].some(([key, qty]) => {
    const v = variants?.find((v) => `${v.product_id}|${v.size}` === key);
    return (v?.stock ?? 0) < qty;
  });
  if (soldOut) {
    await admin.from("orders").update({ status: "failed" }).eq("id", reference).eq("status", "pending");
    return NextResponse.json(
      { error: "Sorry, an item in your cart just sold out. You have not been charged." },
      { status: 409 }
    );
  }

  const { ok, data } = await capturePayPalOrder(order.paypal_order_id);

  if (!ok) {
    const issue = data?.details?.[0]?.issue;
    console.error("PayPal capture failed:", JSON.stringify(data));
    // Declined funding source: buyer can pick another method and retry.
    if (issue === "INSTRUMENT_DECLINED") {
      return NextResponse.json({ error: "Payment declined.", retry: true }, { status: 402 });
    }
    return NextResponse.json({ error: "Payment could not be completed." }, { status: 502 });
  }

  const capture = data?.purchase_units?.[0]?.payments?.captures?.[0];
  const amountMatches =
    capture?.amount?.currency_code === "PHP" &&
    capture?.amount?.value === Number(order.total).toFixed(2);

  if (data.status !== "COMPLETED" || capture?.status !== "COMPLETED" || !amountMatches) {
    console.error("PayPal capture not completed or amount mismatch:", JSON.stringify(data));
    return NextResponse.json({ error: "Payment is not complete." }, { status: 402 });
  }

  const { error } = await admin.rpc("mark_order_paid", {
    p_order_id: reference,
    p_capture_id: capture.id,
  });

  if (error) {
    // Money was captured; log loudly so it can be fixed by hand.
    console.error(`Order ${reference} captured (${capture.id}) but not marked paid:`, error);
  } else {
    // Paying reduces stock, so refresh the cached catalog.
    revalidateTag(PRODUCTS_TAG, { expire: 0 });
  }

  return NextResponse.json({ status: "paid", reference });
}
