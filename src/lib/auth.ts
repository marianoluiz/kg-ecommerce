import { redirect } from "next/navigation";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
};

// cache(): the root layout and the page both ask for the user; hit Supabase once per request.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select("full_name, role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: String(claims.email ?? ""),
    fullName: profile?.full_name ?? (claims.user_metadata?.full_name as string | undefined) ?? null,
    isAdmin: profile?.role === "admin",
  };
});

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/account");
  return user;
}
