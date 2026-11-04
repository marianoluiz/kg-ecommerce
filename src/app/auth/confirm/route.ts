import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/site-url";

// Handles the link in Supabase auth emails and signs the user in.
// Supports both link styles:
//   ?token_hash=...&type=email  (works even if opened in another browser)
//   ?code=...                   (default {{ .ConfirmationURL }} PKCE flow)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = await getOrigin();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
    console.error("verifyOtp failed:", error.message);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
    console.error("exchangeCodeForSession failed:", error.message);
  }

  // Email is usually confirmed already even if auto sign-in failed
  // (e.g. link opened in a different browser), so ask them to sign in.
  return NextResponse.redirect(`${origin}/login?message=confirmed`);
}
