import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-name">
              Clean<em>Bharat</em>
            </div>
            <p className="footer-brand-desc">
              A community-powered platform to report and resolve civic issues across India.
              Together, we build a cleaner, better nation.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/issues">Browse Issues</Link></li>
              <li><Link href="/report">Report an Issue</Link></li>
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <div className="footer-col-title">Categories</div>
            <ul className="footer-links">
              <li><Link href="/issues">Roads &amp; Infrastructure</Link></li>
              <li><Link href="/issues">Sanitation</Link></li>
              <li><Link href="/issues">Street Lighting</Link></li>
              <li><Link href="/issues">Water Supply</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="footer-col-title">Support</div>
            <ul className="footer-links">
              <li><Link href="/about">How It Works</Link></li>
              <li><Link href="/about">FAQ</Link></li>
              <li><Link href="/about">Privacy Policy</Link></li>
              <li><Link href="/about">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-bottom-text">
            © {year} CleanBharat. Made with ❤️ for a better India.
          </p>
          <span className="footer-bottom-badge">
            <span style={{
              width: 6,
              height: 6,
              background: "#fbb03b",
              borderRadius: "50%",
              animation: "pulse-dot 2s ease-in-out infinite",
              display: "inline-block",
            }} />
            Community Driven
          </span>
        </div>
      </div>
    </footer>
  );
}
