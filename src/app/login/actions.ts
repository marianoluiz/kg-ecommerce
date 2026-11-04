"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || !email || password.length < 8) {
    redirect("/login?error=validation");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    console.error("Signup failed:", error.code, error.message);
    const known: Record<string, string> = {
      user_already_exists: "exists",
      email_exists: "exists",
      over_email_send_rate_limit: "rate-limit",
      over_request_rate_limit: "rate-limit",
      weak_password: "weak-password",
      email_address_invalid: "bad-email",
      signup_disabled: "signup-disabled",
    };
    const code = (error.code && known[error.code]) || "signup";
    const detail = code === "signup" ? `&detail=${encodeURIComponent(error.message)}` : "";
    redirect(`/login?error=${code}${detail}`);
  }

  // With email confirmation on, Supabase returns a fake user with no
  // identities instead of an error when the email is already registered.
  if (data.user && data.user.identities?.length === 0) {
    redirect("/login?error=exists");
  }

  redirect("/login?message=check-email");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid");
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
