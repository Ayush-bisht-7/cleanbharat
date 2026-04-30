import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Clean Bharat",
  description:
    "Learn about CleanBharat — our mission, values, and how we're empowering citizens to report and resolve civic issues across India.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-inner">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(251,176,59,0.12)", border: "1px solid rgba(251,176,59,0.25)", color: "#fbb03b", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 9999, marginBottom: 24 }}>
              About Us
            </div>
            <h1>Building a Cleaner India, Together</h1>
            <p>
              CleanBharat is a community-driven platform that empowers every citizen to report, track,
              and prioritise civic issues in their city — from broken roads to overflowing garbage.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="about-mission-grid">
            <div>
              <span className="section-kicker">Our Mission</span>
              <h2 style={{ marginBottom: 16 }}>Every voice matters in shaping our cities</h2>
              <p style={{ fontSize: 16, marginBottom: 20 }}>
                India&apos;s cities are home to hundreds of millions of people. Every day, citizens
                encounter civic problems — potholes, broken lights, sanitation failures — that go
                unreported and unfixed.
              </p>
              <p style={{ fontSize: 16, marginBottom: 28 }}>
                CleanBharat bridges the gap between citizens and civic action. By making reporting
                fast, simple, and community-powered, we help the most pressing issues rise to the top
                so they get resolved first.
              </p>
              <Link href="/report" className="btn btn-primary">
                Start Reporting
              </Link>
            </div>
            <div className="values-grid" style={{ marginTop: 0 }}>
              {[
                { icon: "🌍", title: "Community First", desc: "Every feature is built for the citizen reporter, not bureaucracies." },
                { icon: "🔍", title: "Transparency", desc: "All reports are public. Anyone can see, support, and track issues." },
                { icon: "⚡", title: "Speed", desc: "Report in under 60 seconds. No sign-up. No bureaucracy." },
                { icon: "📊", title: "Data-Driven", desc: "Community votes surface the most urgent problems automatically." },
              ].map((v) => (
                <div className="value-card" key={v.title}>
                  <div className="value-icon" style={{ fontSize: 20 }}>{v.icon}</div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">FAQ</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-list" style={{ maxWidth: 720, margin: "0 auto" }}>
            {[
              {
                q: "Do I need to create an account to report an issue?",
                a: "No. CleanBharat is completely open — anyone can report an issue or support existing ones without signing up.",
              },
              {
                q: "Who resolves the issues reported here?",
                a: "Issues become visible to local volunteers, RWAs, and civic authorities. High-priority issues (those with many community supports) are most likely to get official attention.",
              },
              {
                q: "Can I attach a photo to my report?",
                a: "Yes! Photos are optional but strongly encouraged. A clear image makes your report far more credible and easier to act on.",
              },
              {
                q: "How does the priority system work?",
                a: "Issues with 10+ supports are marked High Priority, 5+ supports as Medium Priority, and new reports are marked as Reported. Posts are sorted by supports so the most urgent appear first.",
              },
              {
                q: "Can I delete a report I submitted?",
                a: "Yes. Every report has a delete button. Since there are no accounts, anyone can delete any report — so please use it responsibly.",
              },
            ].map((faq) => (
              <div className="faq-item" key={faq.q}>
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Join the movement</h2>
          <p>Thousands of citizens are already making a difference. Your report could be the one that gets something fixed.</p>
          <div className="cta-actions">
            <Link href="/report" className="btn btn-primary-amber">Report an Issue</Link>
            <Link href="/issues" className="btn btn-outline" style={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)" }}>
              Browse Issues
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
