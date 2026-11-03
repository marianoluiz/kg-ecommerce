// Minimal PayPal Orders v2 client. Server-only.
const API_BASE = process.env.PAYPAL_API_BASE ?? "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

async function paypalRequest(path: string, body?: unknown) {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function createPayPalOrder(reference: string, total: number) {
  const { ok, data } = await paypalRequest("/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: reference,
        custom_id: reference,
        description: "KALLOS GORGON order",
        amount: { currency_code: "PHP", value: total.toFixed(2) },
      },
    ],
  });

  if (!ok) throw new Error(`PayPal create order failed: ${JSON.stringify(data)}`);
  return data.id as string;
}

export async function capturePayPalOrder(paypalOrderId: string) {
  return paypalRequest(`/v2/checkout/orders/${paypalOrderId}/capture`, {});
}
