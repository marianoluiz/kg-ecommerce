import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    message?: string;
    detail?: string;
  }>;
}) {
  const params = await searchParams;
  if (await getCurrentUser()) redirect("/account");

  return (
    <section className="login-page">
      <div className="login-box">
        <p className="login-eyebrow">CUSTOMER ACCOUNT</p>

        {params.message === "check-email" && (
          <div className="login-notice" role="status">
            <strong>Almost there</strong>
            We sent a confirmation link to your email. Open it to activate your account, then sign in below.
          </div>
        )}

        {params.message === "confirmed" && (
          <div className="login-notice" role="status">
            <strong>Email confirmed</strong>
            Your account is active. Please sign in below.
          </div>
        )}

        {params.error && (
          <div className="login-notice error" role="alert">
            {ERROR_MESSAGES[params.error] ??
              `Something went wrong. Please try again.${params.detail ? ` (${params.detail})` : ""}`}
          </div>
        )}

        <form action={login}>
          <h2>LOGIN</h2>
          <input name="email" type="email" placeholder="Email address" autoComplete="email" required />
          <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
          <button type="submit">SIGN IN</button>
        </form>

        <hr />

        <form action={signup}>
          <h2>CREATE AN ACCOUNT</h2>
          <input name="full_name" placeholder="Full name" autoComplete="name" required />
          <input name="email" type="email" placeholder="Email address" autoComplete="email" required />
          <input
            name="password"
            type="password"
            placeholder="Password (8 characters minimum)"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <button type="submit">REGISTER</button>
        </form>
      </div>
    </section>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Invalid credentials or unconfirmed email.",
  validation: "Please fill in all fields correctly.",
  exists: "This email is already registered. Please sign in instead.",
  "rate-limit": "Too many sign-up attempts right now. Please wait a while and try again.",
  "weak-password": "Password is too weak. Please choose a stronger one.",
  "bad-email": "Please enter a valid email address.",
  "signup-disabled": "New registrations are currently disabled.",
};
