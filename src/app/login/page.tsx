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
    <main
      style={{
        minHeight: "85vh",
        background: "#000",
        color: "#fff",
        padding: "120px 20px 70px",
      }}
    >
      <div style={{ maxWidth: 420, margin: "auto" }}>
        <p
          style={{
            textAlign: "center",
            margin: "0 0 40px",
            letterSpacing: 2,
            fontSize: 16,
          }}
        >
          CUSTOMER ACCOUNT
        </p>

        {params.message === "check-email" && (
          <p role="status">
            Registration received. Check your email
            for a confirmation link.
          </p>
        )}

        {params.error && (
          <p role="alert" style={{ color: "#ff9999" }}>
            {ERROR_MESSAGES[params.error] ??
              `Something went wrong. Please try again.${
                params.detail ? ` (${params.detail})` : ""
              }`}
          </p>
        )}

        <form action={login}>
          <h2>LOGIN</h2>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
            style={inputStyle}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            SIGN IN
          </button>
        </form>

        <hr
          style={{
            margin: "40px 0",
            borderColor: "#444",
          }}
        />

        <form action={signup}>
          <h2>CREATE AN ACCOUNT</h2>
          <input
            name="full_name"
            placeholder="Full name"
            required
            style={inputStyle}
          />
          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
            style={inputStyle}
          />
          <input
            name="password"
            type="password"
            placeholder="Password (8 characters minimum)"
            minLength={8}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            REGISTER
          </button>
        </form>
      </div>
    </main>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Invalid credentials or unconfirmed email.",
  validation: "Please fill in all fields correctly.",
  exists: "This email is already registered. Please sign in instead.",
  "rate-limit":
    "Too many sign-up attempts right now. Please wait a while and try again.",
  "weak-password": "Password is too weak. Please choose a stronger one.",
  "bad-email": "Please enter a valid email address.",
  "signup-disabled": "New registrations are currently disabled.",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 14,
  marginTop: 14,
  background: "#111",
  color: "#fff",
  border: "1px solid #555",
};

const buttonStyle = {
  width: "100%",
  marginTop: 20,
  padding: 15,
  background: "#fff",
  color: "#000",
  border: "none",
  cursor: "pointer",
  fontWeight: 700 as const,
};