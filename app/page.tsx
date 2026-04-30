import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Clean Bharat",
  description:
    "CleanBharat — Community-powered civic issue reporting. Report problems in your city and help your community make it right.",
};

async function getStats() {
  try {
    const { getAllPosts } = await import("@/lib/database.js");
    const posts = await getAllPosts();
    const totalLikes = posts.reduce((sum: number, p: { likes: number }) => sum + p.likes, 0);
    const locations = new Set(posts.map((p: { address: string }) => p.address).filter(Boolean)).size;
    return { count: posts.length, likes: totalLikes, locations };
  } catch {
    return { count: 0, likes: 0, locations: 0 };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            {/* Left */}
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Live Community Platform
              </div>
              <h1>
                Report City Issues,<br />
                <em>Make India Better</em>
              </h1>
              <p className="hero-subtitle">
                Spot a pothole, broken light, or sanitation issue? Report it instantly
                and let your community vote to prioritise what matters most.
              </p>
              <div className="hero-actions">
                <Link href="/report" className="btn btn-primary-amber">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Report an Issue
                </Link>
                <Link href="/issues" className="btn btn-outline" style={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)" }}>
                  Browse Issues
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>

              <div className="hero-stats">
                {[
                  { num: stats.count, label: "Issues Reported" },
                  { num: stats.likes, label: "Community Supports" },
                  { num: stats.locations, label: "Locations Covered" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="hero-stat-number">{s.num}</div>
                    <div className="hero-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – decorative cards */}
            <div className="hero-visual">
              {[
                { icon: "🚧", label: "Road Damage", sub: "Main Street · 12 supports" },
                { icon: "💡", label: "Street Light Out", sub: "Park Avenue · 8 supports" },
                { icon: "🗑️", label: "Garbage Overflow", sub: "Sector 7 · 5 supports" },
              ].map((c) => (
                <div className="hero-card-preview" key={c.label}>
                  <div className="hero-card-icon" style={{ fontSize: 20 }}>{c.icon}</div>
                  <div>
                    <div className="hero-card-label">{c.label}</div>
                    <div className="hero-card-sub">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">How It Works</span>
            <h2>Three simple steps to make a difference</h2>
            <p>Anyone can report an issue. Your community decides what gets fixed first.</p>
          </div>

          <div className="how-grid">
            {[
              {
                step: "01",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ),
                title: "Spot & Report",
                desc: "See a civic problem? Submit a report with title, description, location, and an optional photo in under a minute.",
              },
              {
                step: "02",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                ),
                title: "Community Votes",
                desc: "Neighbours support issues they care about. The more supports an issue gets, the higher it rises in priority.",
              },
              {
                step: "03",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ),
                title: "Issues Get Fixed",
                desc: "High-priority issues are visible to everyone. Authorities and volunteers can act on the most pressing problems first.",
              },
            ].map((item) => (
              <div className="how-card" key={item.step}>
                <div className="how-step-num">{item.step}</div>
                <div className="how-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to make your city better?</h2>
          <p>Join thousands of citizens who are already reporting and resolving issues across India.</p>
          <div className="cta-actions">
            <Link href="/report" className="btn btn-primary-amber">
              Report an Issue
            </Link>
            <Link href="/issues" className="btn btn-outline" style={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)" }}>
              View All Issues
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}