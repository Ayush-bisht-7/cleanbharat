"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/issues", label: "Issues" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link href="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            <div className="navbar-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f1923" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="navbar-logo-text">Clean<em>Bharat</em></span>
          </Link>

          {/* Desktop Links */}
          <ul className="navbar-links">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`navbar-link ${pathname === l.href ? "active" : ""}`}>
                  {l.label}
                </Link>
              </li>
            ))}

            {session ? (
              <>
                <li>
                  <Link href="/report" className={`navbar-link ${pathname === "/report" ? "active" : ""}`}>
                    Report Issue
                  </Link>
                </li>
                {/* User menu */}
                <li style={{ position: "relative" }}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "transparent",
                      border: "1px solid var(--color-ink)",
                      borderRadius: 0,
                      padding: "6px 12px",
                      cursor: "pointer",
                      color: "var(--color-ink)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      textTransform: "uppercase"
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      background: "var(--color-ink)",
                      borderRadius: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 10,
                      color: "var(--color-bg)",
                      flexShrink: 0
                    }}>
                      {session.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.user?.name}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.7 }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setUserMenuOpen(false)} />
                      <div style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 4px)",
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 0,
                        padding: 6,
                        minWidth: 180,
                        zIndex: 99
                      }}>
                        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-muted)", marginBottom: 4 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{session.user?.name}</div>
                          <div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{session.user?.email}</div>
                        </div>
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 0,
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            textTransform: "uppercase",
                            color: "var(--color-ink)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "background 0.1s"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-alt)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="navbar-link">Sign In</Link>
                </li>
                <li>
                  <Link href="/register" className="navbar-link navbar-cta">Get Started</Link>
                </li>
              </>
            )}
          </ul>

          {/* Mobile Toggle */}
          <button className="navbar-mobile-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} className={`navbar-link ${pathname === l.href ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
        {session ? (
          <>
            <Link href="/report" className="navbar-link" onClick={() => setMenuOpen(false)}>Report Issue</Link>
            <button
              onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
              className="navbar-link"
              style={{ textAlign: "left", color: "rgba(255,100,100,0.8)", marginTop: 4, background: "transparent", border: "none", cursor: "pointer", width: "100%", justifyContent: "flex-start" }}
            >
              Sign Out ({session.user?.name})
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="navbar-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link href="/register" className="navbar-link navbar-cta" style={{ marginTop: 8 }} onClick={() => setMenuOpen(false)}>Get Started</Link>
          </>
        )}
      </div>
    </>
  );
}
