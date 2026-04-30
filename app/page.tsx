"use client";

import { FormEvent, useState, useEffect } from 'react';

type Post = {
  id: number;
  title: string;
  description: string;
  address: string;
  image: string | null;
  likes: number;
  created_at: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null as string | null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const desc = (form.elements.namedItem('description') as HTMLTextAreaElement).value.trim();
    const address = (form.elements.namedItem('address') as HTMLInputElement).value.trim();
    const imageFile = (form.elements.namedItem('image') as HTMLInputElement).files?.[0] || null;

    let imageData = null;
    if (imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      await new Promise<void>((resolve) => {
        reader.onload = () => { imageData = reader.result; resolve(); };
      });
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, address, image: imageData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();
      setPosts(prev => [
        { ...newPost, likes: newPost.likes ?? 0, created_at: newPost.created_at ?? new Date().toISOString() },
        ...prev,
      ].sort((a, b) => b.likes - a.likes));
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const likePost = async (id: number) => {
    try {
      const response = await fetch(`/api/posts/${id}`, { method: 'POST' });
      if (!response.ok) throw new Error(`Failed to like post (${response.status})`);
      const updatedPost = await response.json();
      setLikedPosts(prev => new Set([...prev, id]));
      setPosts(prev =>
        prev.map(post => post.id === id ? updatedPost : post).sort((a, b) => b.likes - a.likes)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete post');
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #f4f2ed;
          margin: 0;
          min-height: 100vh;
        }

        .site-header {
          background: #0f1923;
          color: white;
          padding: 0;
          position: relative;
          overflow: hidden;
        }

        .site-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.015) 0px,
            rgba(255,255,255,0.015) 1px,
            transparent 1px,
            transparent 80px
          );
          pointer-events: none;
        }

        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 32px 48px;
          position: relative;
          z-index: 1;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(251, 176, 59, 0.15);
          border: 1px solid rgba(251, 176, 59, 0.3);
          color: #fbb03b;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 20px;
        }

        .header-badge span {
          width: 6px;
          height: 6px;
          background: #fbb03b;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .header-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0 0 14px;
          color: #fff;
        }

        .header-title em {
          font-style: normal;
          color: #fbb03b;
        }

        .header-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.55);
          margin: 0;
          font-weight: 300;
          max-width: 480px;
          line-height: 1.6;
        }

        .header-stats {
          display: flex;
          gap: 40px;
          margin-top: 36px;
          padding-top: 36px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .stat-item {}
        .stat-number {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }
        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-top: 4px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .main-layout {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 32px;
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .main-layout { grid-template-columns: 1fr; padding: 24px 16px; }
        }

        /* ── FORM CARD ── */
        .form-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.07);
          overflow: hidden;
          position: sticky;
          top: 24px;
        }

        .form-card-header {
          background: #0f1923;
          padding: 24px 28px;
        }

        .form-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 4px;
        }

        .form-card-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin: 0;
        }

        .form-body {
          padding: 24px 28px;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 7px;
        }

        .form-input, .form-textarea {
          width: 100%;
          background: #f9f8f6;
          border: 1.5px solid #e5e2dc;
          border-radius: 10px;
          padding: 11px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: #fbb03b;
          background: #fffef9;
          box-shadow: 0 0 0 3px rgba(251,176,59,0.12);
        }

        .form-textarea {
          resize: vertical;
          min-height: 90px;
          line-height: 1.5;
        }

        .file-input-wrapper {
          position: relative;
        }

        .file-input-label {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f9f8f6;
          border: 1.5px dashed #d5d1c8;
          border-radius: 10px;
          padding: 13px 16px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          font-size: 13px;
          color: #9ca3af;
        }

        .file-input-label:hover {
          border-color: #fbb03b;
          background: #fffef9;
          color: #6b7280;
        }

        .file-input-label svg {
          flex-shrink: 0;
        }

        input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
        }

        .submit-btn {
          width: 100%;
          background: #0f1923;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px 20px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
          margin-top: 6px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #1e2d3d;
          transform: translateY(-1px);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .submit-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .submit-btn .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── ERROR BANNER ── */
        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #b91c1c;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── RIGHT COLUMN ── */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f1923;
          margin: 0;
        }

        .issue-count {
          background: #0f1923;
          color: #fbb03b;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 100px;
        }

        /* ── SEARCH ── */
        .search-wrapper {
          position: relative;
          margin-bottom: 24px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid #e5e2dc;
          border-radius: 12px;
          padding: 12px 16px 12px 44px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s;
        }

        .search-input:focus {
          border-color: #fbb03b;
          box-shadow: 0 0 0 3px rgba(251,176,59,0.12);
        }

        .search-input::placeholder { color: #9ca3af; }

        /* ── POSTS GRID ── */
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        /* ── POST CARD ── */
        .post-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.07);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .post-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.09);
        }

        .post-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }

        .post-body {
          padding: 20px 20px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .post-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #0f1923;
          margin: 0 0 10px;
          line-height: 1.3;
        }

        .post-description {
          font-size: 13.5px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 14px;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .post-meta-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          color: #9ca3af;
        }

        .post-meta-item svg { flex-shrink: 0; }

        .post-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #f3f2ef;
        }

        .like-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #fff;
          border: 1.5px solid #e5e2dc;
          border-radius: 100px;
          padding: 7px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s;
        }

        .like-btn:hover {
          border-color: #fbb03b;
          background: #fffef9;
          color: #d97706;
        }

        .like-btn.liked {
          border-color: #fbb03b;
          background: #fef9ec;
          color: #d97706;
        }

        .like-btn svg { transition: transform 0.15s; }
        .like-btn:hover svg { transform: scale(1.2); }

        .delete-btn {
          background: transparent;
          border: none;
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          color: #d1d5db;
          transition: color 0.15s, background 0.15s;
          display: flex;
          align-items: center;
        }

        .delete-btn:hover {
          color: #ef4444;
          background: #fef2f2;
        }

        /* ── LOADING / EMPTY ── */
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .skeleton-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.07);
          overflow: hidden;
        }

        .skeleton-img {
          height: 180px;
          background: linear-gradient(90deg, #f0ede8 25%, #e8e5df 50%, #f0ede8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-body { padding: 20px; }

        .skeleton-line {
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f0ede8 25%, #e8e5df 50%, #f0ede8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          margin-bottom: 10px;
        }

        .skeleton-line.short { width: 60%; }
        .skeleton-line.medium { width: 85%; }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 32px;
          text-align: center;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          background: #f4f2ed;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: #d1cdc6;
        }

        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #0f1923;
          margin: 0 0 8px;
        }

        .empty-subtitle {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
        }

        /* ── PRIORITY BADGE ── */
        .priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 100px;
        }

        .priority-high { background: #fef2f2; color: #b91c1c; }
        .priority-medium { background: #fffbeb; color: #b45309; }
        .priority-low { background: #f0fdf4; color: #166534; }
      `}</style>

      {/* ── HEADER ── */}
      <header className="site-header">
        <div className="header-inner">
          <div className="header-badge">
            <span></span>
            Live Reporting
          </div>
          <h1 className="header-title">
            City Issue<br /><em>Reporter</em>
          </h1>
          <p className="header-subtitle">
            Spot a problem in your city? Report it here and help your community make it right.
          </p>
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-number">{posts.length}</div>
              <div className="stat-label">Issues Reported</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{posts.reduce((sum, p) => sum + p.likes, 0)}</div>
              <div className="stat-label">Community Supports</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{new Set(posts.map(p => p.address).filter(Boolean)).size}</div>
              <div className="stat-label">Locations</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <main className="main-layout">

        {/* ── REPORT FORM ── */}
        <aside>
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Report a Problem</h2>
              <p className="form-card-subtitle">Fill in the details below to submit an issue</p>
            </div>
            <div className="form-body">
              {error && (
                <div className="error-banner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Problem Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input className="form-input" type="text" id="title" name="title" placeholder="e.g., Broken street light" required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea className="form-textarea" id="description" name="description" placeholder="Describe the problem in detail — when you noticed it, how severe it is, etc."></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">Location / Address</label>
                  <input className="form-input" type="text" id="address" name="address" placeholder="e.g., Main Street, near the park" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="image">Photo (optional)</label>
                  <div className="file-input-wrapper">
                    <label className="file-input-label" htmlFor="image">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      Click to upload an image
                    </label>
                    <input type="file" id="image" name="image" accept="image/*" />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner"></span>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* ── POSTS SECTION ── */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Community Issues</h2>
            {!loading && (
              <span className="issue-count">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'issue' : 'issues'}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="search-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search by title, description, or location…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Posts */}
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-body">
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line medium"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((p) => {
                const isLiked = likedPosts.has(p.id);
                const priority = p.likes >= 10 ? 'high' : p.likes >= 5 ? 'medium' : 'low';
                const priorityLabel = p.likes >= 10 ? 'High Priority' : p.likes >= 5 ? 'Medium Priority' : 'Reported';

                return (
                  <article key={p.id} className="post-card">
                    {p.image && (
                      <img src={p.image} alt="Issue photo" className="post-image" />
                    )}
                    <div className="post-body">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                        <h3 className="post-title" style={{ margin: 0 }}>{p.title}</h3>
                        <span className={`priority-badge priority-${priority}`} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {priorityLabel}
                        </span>
                      </div>

                      {p.description && (
                        <p className="post-description">{p.description}</p>
                      )}

                      <div className="post-meta">
                        {p.address && (
                          <div className="post-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            {p.address}
                          </div>
                        )}
                        <div className="post-meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {formatTimestamp(p.created_at)}
                        </div>
                      </div>

                      <div className="post-footer">
                        <button
                          className={`like-btn ${isLiked ? 'liked' : ''}`}
                          onClick={() => likePost(p.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? '#fbb03b' : 'none'} stroke={isLiked ? '#fbb03b' : 'currentColor'} strokeWidth="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                          </svg>
                          {p.likes} {p.likes === 1 ? 'support' : 'supports'}
                        </button>

                        <button className="delete-btn" onClick={() => deletePost(p.id)} title="Delete this post">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredPosts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </div>
                  <h3 className="empty-title">
                    {searchTerm ? `No results for "${searchTerm}"` : 'No issues reported yet'}
                  </h3>
                  <p className="empty-subtitle">
                    {searchTerm ? 'Try a different search term.' : 'Be the first to report a problem in your city.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}