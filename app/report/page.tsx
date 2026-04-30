"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function ReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/report");
    }
  }, [status, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const title   = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const desc    = (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim();
    const address = (form.elements.namedItem("address") as HTMLInputElement).value.trim();
    const imageFile = (form.elements.namedItem("image") as HTMLInputElement).files?.[0] || null;

    let imageData: string | null = null;
    if (imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      await new Promise<void>((resolve) => {
        reader.onload = () => { imageData = reader.result as string; resolve(); };
      });
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc, address, image: imageData }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setSuccess(true);
      form.reset();
      setFileName(null);
      setTimeout(() => router.push("/issues"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  // Not logged in — redirect happening
  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2>Login Required</h2>
        <p>You need to be signed in to report an issue.</p>
        <Link href="/login?callbackUrl=/report" className="btn btn-primary" style={{ marginTop: 8 }}>
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="container">
        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <Link href="/issues" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--color-muted)", marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Issues
          </Link>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 8 }}>Report an Issue</h1>
          <p style={{ fontSize: 15 }}>
            Reporting as <strong style={{ color: "var(--color-ink)" }}>{session.user?.name}</strong>
          </p>
        </div>

        <div className="report-grid">
          {/* Form */}
          <div className="form-card">
            <div className="form-card-header">
              <h2>Issue Details</h2>
              <p>Fields marked * are required</p>
            </div>

            <div className="form-body">
              {error && (
                <div className="alert alert-error" style={{ marginBottom: 20 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" style={{ marginBottom: 20 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Issue submitted successfully! Redirecting…
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">
                    Problem Title <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <input className="input-field" type="text" id="title" name="title" placeholder="e.g., Broken street light on MG Road" required maxLength={120} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea className="input-field" id="description" name="description" placeholder="Describe the problem — when you noticed it, severity, etc." style={{ minHeight: 110 }} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">Location / Address</label>
                  <input className="input-field" type="text" id="address" name="address" placeholder="e.g., MG Road, near Metro Station, Bengaluru" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="image">Photo (optional)</label>
                  <div className="file-input-wrapper">
                    <label className="file-input-label" htmlFor="image">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      {fileName || "Click to upload a photo"}
                    </label>
                    <input type="file" id="image" name="image" accept="image/*" onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting || success} style={{ width: "100%", padding: "14px 20px", marginTop: 8, fontSize: 15 }}>
                  {submitting ? <><span className="spinner" /> Submitting…</> : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Reporter info */}
            <div className="form-card" style={{ marginBottom: 16 }}>
              <div className="form-body" style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted)", marginBottom: 12 }}>Reporting as</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: "var(--color-amber)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-ink)", fontSize: 16, flexShrink: 0 }}>
                    {session.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-ink)" }}>{session.user?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--color-subtle)" }}>{session.user?.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="form-card" style={{ marginBottom: 16 }}>
              <div className="form-card-header" style={{ padding: "18px 24px" }}>
                <h2 style={{ fontSize: 16 }}>Tips for a Good Report</h2>
              </div>
              <div className="form-body" style={{ padding: "16px 24px" }}>
                {[
                  { icon: "📍", tip: "Be specific about the location." },
                  { icon: "📷", tip: "A clear photo makes your report more impactful." },
                  { icon: "✏️", tip: "Include when you noticed it and how severe it is." },
                  { icon: "🔁", tip: "Check existing issues to avoid duplicates." },
                ].map((t) => (
                  <div key={t.tip} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
                    <p style={{ fontSize: 13, margin: 0 }}>{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--color-amber-dim)", border: "1px solid rgba(251,176,59,0.2)", borderRadius: "var(--radius-lg)", padding: "16px 20px" }}>
              <p style={{ fontSize: 13, color: "#92620a", margin: 0, lineHeight: 1.65 }}>
                <strong style={{ color: "#7a5008" }}>Note:</strong> All submitted issues are publicly visible. Do not include personal data of others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
