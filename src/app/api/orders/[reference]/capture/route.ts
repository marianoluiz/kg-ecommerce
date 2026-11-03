import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";

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
  }

  return NextResponse.json({ status: "paid", reference });
}
