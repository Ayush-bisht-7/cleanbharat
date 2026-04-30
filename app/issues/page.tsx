"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PostCard, { Post } from "@/components/PostCard";
import Link from "next/link";

export default function IssuesPage() {
  const { data: session, status } = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Set of post IDs the current user has liked (persisted from server)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch which posts the user has already liked (once session is known)
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/posts/liked")
        .then((r) => r.json())
        .then((ids: number[]) => setLikedPosts(new Set(ids)))
        .catch(() => {});
    } else if (status === "unauthenticated") {
      setLikedPosts(new Set());
    }
  }, [status]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch {
      setError("Failed to load issues. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    if (status !== "authenticated") {
      setAuthPrompt(true);
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "POST" });
      if (res.status === 401) { setAuthPrompt(true); return; }
      if (!res.ok) throw new Error("Failed to toggle support");

      const data = await res.json(); // { ...post, userLiked: boolean }

      // Update liked set based on server response
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (data.userLiked) next.add(id);
        else next.delete(id);
        return next;
      });

      // Update post in list
      setPosts((prev) =>
        prev
          .map((p) => (p.id === id ? { ...p, likes: data.likes } : p))
          .sort((a, b) => b.likes - a.likes)
      );
    } catch {
      setError("Failed to update support.");
    }
  };

  const handleDelete = async (id: number) => {
    if (status !== "authenticated") { setAuthPrompt(true); return; }
    if (!confirm("Delete this issue?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.status === 401) { setAuthPrompt(true); return; }
      if (!res.ok) throw new Error("Failed to delete");
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setLikedPosts((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } catch {
      setError("Failed to delete issue.");
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="issues-header">
        <div className="container issues-header-inner">
          <h1>Community Issues</h1>
          <p>Browse civic issues reported by your neighbours. Sign in to support or report new ones.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

        {/* Auth prompt banner */}
        {authPrompt && (
          <div style={{
            background: "#fff",
            border: "1.5px solid var(--color-amber)",
            borderRadius: "var(--radius-md)",
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            boxShadow: "0 4px 16px rgba(251,176,59,0.12)",
          }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: 600, color: "var(--color-ink)", fontSize: 14 }}>Sign in required</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-muted)" }}>You need to be signed in to support or report issues.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/login?callbackUrl=/issues" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>Sign In</Link>
              <Link href="/register" className="btn btn-outline" style={{ padding: "7px 16px", fontSize: 13 }}>Register</Link>
              <button onClick={() => setAuthPrompt(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-subtle)", padding: "4px 6px", borderRadius: 6 }} aria-label="Dismiss">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* General error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "inherit" }} onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="issues-toolbar">
          <div className="search-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search by title, description or location…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {!loading && (
              <span className="issues-count-badge">
                {filtered.length} {filtered.length === 1 ? "issue" : "issues"}
              </span>
            )}
            {status === "authenticated" ? (
              <Link href="/report" className="btn btn-primary" style={{ padding: "9px 18px", fontSize: 13, gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Report Issue
              </Link>
            ) : (
              <button className="btn btn-primary" style={{ padding: "9px 18px", fontSize: 13, gap: 6 }} onClick={() => setAuthPrompt(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Report Issue
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="posts-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton skeleton-line medium" />
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-line long" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="posts-grid">
            {filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDelete={handleDelete}
                isLiked={likedPosts.has(post.id)}
                isAuthenticated={status === "authenticated"}
              />
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3>{searchTerm ? `No results for "${searchTerm}"` : "No issues reported yet"}</h3>
                <p>{searchTerm ? "Try a different search term." : "Be the first to report a problem in your city."}</p>
                {status === "authenticated" && !searchTerm && (
                  <Link href="/report" className="btn btn-primary" style={{ marginTop: 16 }}>Report an Issue</Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
