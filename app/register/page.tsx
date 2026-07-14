"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const name     = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email    = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm  = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Auto-login after registration
      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - var(--nav-height))", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: "var(--color-ink)", borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, marginBottom: 6, fontFamily: "var(--font-display)" }}>CREATE YOUR ACCOUNT</h1>
          <p style={{ fontSize: 14, margin: 0, color: "var(--color-muted)" }}>Join CleanBharat and start reporting issues</p>
        </div>

        <div className="form-card">
          <div className="form-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input className="input-field" type="text" id="name" name="name" placeholder="Rahul Sharma" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input className="input-field" type="email" id="email" name="email" placeholder="you@example.com" required autoComplete="email" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input className="input-field" type="password" id="password" name="password" placeholder="Min. 6 characters" required minLength={6} autoComplete="new-password" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm">Confirm Password</label>
                <input className="input-field" type="password" id="confirm" name="confirm" placeholder="Repeat your password" required autoComplete="new-password" />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: "100%", padding: "13px 20px", marginTop: 4, fontSize: 15 }}
              >
                {loading ? <><span className="spinner" /> Creating account…</> : "Create Account"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--color-muted)" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--color-ink)", fontWeight: 600, fontFamily: "var(--font-mono)", textDecoration: "underline" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-subtle)", marginTop: 16, lineHeight: 1.5 }}>
          By creating an account, you agree to report issues responsibly and not include personal data of others.
        </p>
      </div>
    </div>
  );
}
