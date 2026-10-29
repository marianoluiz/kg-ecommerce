import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function AccountPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.claims.sub)
    .single();

  return (
    <main style={{
      minHeight: "80vh",
      background: "#000",
      color: "#fff",
      textAlign: "center",
      padding: "90px 20px",
    }}>
      <h1 style={{
        fontFamily: "serif",
        letterSpacing: 4,
        fontSize: 32,
      }}>
        MY ACCOUNT
      </h1>

      <h2 style={{ marginTop: 35 }}>
        Welcome, {profile?.full_name || "Customer"}
      </h2>

      <p style={{ marginTop: 15 }}>
        Role: {profile?.role || "customer"}
      </p>

      <form action={logout}>
        <button type="submit" style={{
          marginTop: 35,
          padding: "15px 40px",
          background: "#fff",
          color: "#000",
          cursor: "pointer",
        }}>
          LOG OUT
        </button>
      </form>
    </main>
  );
}
