import { headers } from "next/headers";

export const SITE_URL = "https://kallosgorgon.netlify.app";

// On Netlify, request.url / Host headers carry the per-deploy permalink
// (e.g. <hash>--kallosgorgon.netlify.app). Redirecting there loses the session
// cookie (different host) and can serve a stale deploy. In production always
// use the canonical site URL; only derive it from headers in dev.
export async function getOrigin() {
  if (process.env.NODE_ENV === "production") return SITE_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : SITE_URL;
}
