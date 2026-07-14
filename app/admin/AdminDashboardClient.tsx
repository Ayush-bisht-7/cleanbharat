"use client";

import { useState } from "react";
import { formatTimestamp } from "@/components/PostCard";

type AdminStats = {
  posts: number;
  users: number;
  likes: number;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

type Post = {
  id: number;
  title: string;
  description: string;
  address: string;
  image: string | null;
  likes: number;
  user_name: string | null;
  created_at: string;
};

type Props = {
  initialStats: AdminStats;
  initialPosts: Post[];
  initialUsers: AdminUser[];
  currentUserId: string;
};

export default function AdminDashboardClient({ initialStats, initialPosts, initialUsers, currentUserId }: Props) {
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [postSearch, setPostSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleDeletePost = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this issue?")) return;
    
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete post.");
      }

      // Update state
      const updatedPosts = posts.filter((p) => p.id !== id);
      setPosts(updatedPosts);

      // Recalculate stats
      const totalLikes = updatedPosts.reduce((sum, p) => sum + p.likes, 0);
      setStats((prev) => ({
        ...prev,
        posts: updatedPosts.length,
        likes: totalLikes,
      }));

      setActionSuccess("Issue deleted successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete post.");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this user? This will dissociate their issues and delete their supports.")) return;

    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user.");
      }

      // Update state
      const updatedUsers = users.filter((u) => u.id !== id);
      setUsers(updatedUsers);
      setStats((prev) => ({
        ...prev,
        users: updatedUsers.length,
      }));

      setActionSuccess("User account deleted successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete user.");
    }
  };

  // Filtered lists
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.address?.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.user_name?.toLowerCase().includes(postSearch.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div>
      {/* Notifications */}
      {actionError && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>✕ {actionError}</span>
          <button style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "inherit" }} onClick={() => setActionError(null)}>✕</button>
        </div>
      )}
      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: 24 }}>
          <span>✓ {actionSuccess}</span>
          <button style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "inherit" }} onClick={() => setActionSuccess(null)}>✕</button>
        </div>
      )}

      {/* Stats Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--color-border)", marginBottom: 48 }}>
        <div style={{ background: "var(--color-bg)", padding: "24px 32px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Issues</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 700, marginTop: 8, color: "var(--color-ink)" }}>{stats.posts}</div>
        </div>
        <div style={{ background: "var(--color-bg)", padding: "24px 32px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>User Accounts</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 700, marginTop: 8, color: "var(--color-ink)" }}>{stats.users}</div>
        </div>
        <div style={{ background: "var(--color-bg)", padding: "24px 32px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Supports</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 700, marginTop: 8, color: "var(--color-ink)" }}>{stats.likes}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: 32 }}>
        <button
          onClick={() => setActiveTab("posts")}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "16px 32px",
            border: "1px solid " + (activeTab === "posts" ? "var(--color-border)" : "transparent"),
            borderBottom: activeTab === "posts" ? "1px solid var(--color-bg)" : "none",
            marginBottom: -1,
            background: activeTab === "posts" ? "var(--color-bg)" : "transparent",
            color: activeTab === "posts" ? "var(--color-ink)" : "var(--color-muted)",
            cursor: "pointer",
            fontWeight: activeTab === "posts" ? 600 : 400
          }}
        >
          Issues Catalog ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "16px 32px",
            border: "1px solid " + (activeTab === "users" ? "var(--color-border)" : "transparent"),
            borderBottom: activeTab === "users" ? "1px solid var(--color-bg)" : "none",
            marginBottom: -1,
            background: activeTab === "users" ? "var(--color-bg)" : "transparent",
            color: activeTab === "users" ? "var(--color-ink)" : "var(--color-muted)",
            cursor: "pointer",
            fontWeight: activeTab === "users" ? 600 : 400
          }}
        >
          User Directory ({users.length})
        </button>
      </div>

      {/* Catalog Table View */}
      {activeTab === "posts" ? (
        <div>
          {/* Search bar */}
          <div style={{ marginBottom: 24, maxWidth: 480 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Filter catalog by keyword or reporter…"
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              style={{ fontFamily: "var(--font-body)", fontSize: 13, padding: "10px 16px" }}
            />
          </div>

          <div style={{ overflowX: "auto", border: "1px solid var(--color-border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>ID</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>Issue Title</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>Location</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>Reporter</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>Supports</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>Date</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} style={{ borderBottom: "1px solid var(--color-border-muted)" }} className="animate-fade-in">
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-subtle)" }}>
                      CB-{String(post.id).padStart(4, "0")}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 600, fontSize: 13 }}>
                      {post.title}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-muted)" }}>
                      {post.address || "—"}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-ink)" }}>
                      {post.user_name || "Anonymous"}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>
                      ▲ {post.likes}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-subtle)" }}>
                      {formatTimestamp(post.created_at)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          textTransform: "uppercase",
                          color: "var(--color-danger)",
                          cursor: "pointer",
                          fontWeight: 600
                        }}
                      >
                        [Delete]
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 48, textAlign: "center", color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      NO MATCHING RECORDS FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {/* Search bar */}
          <div style={{ marginBottom: 24, maxWidth: 480 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Filter user accounts by name or email…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{ fontFamily: "var(--font-body)", fontSize: 13, padding: "10px 16px" }}
            />
          </div>

          <div style={{ overflowX: "auto", border: "1px solid var(--color-border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>User ID</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>Full Name</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>Email Address</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>System Role</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)" }}>Registered Date</th>
                  <th style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--color-muted)", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isSelf = String(user.id) === String(currentUserId);
                  return (
                    <tr key={user.id} style={{ borderBottom: "1px solid var(--color-border-muted)" }} className="animate-fade-in">
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-subtle)" }}>
                        USR-{String(user.id).padStart(4, "0")}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 600, fontSize: 13 }}>
                        {user.name} {isSelf && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-success)", verticalAlign: "middle", marginLeft: 4 }}>[YOU]</span>}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-muted)" }}>
                        {user.email}
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase" }}>
                        <span style={{ color: user.role === "admin" ? "var(--color-warning)" : "var(--color-muted)", fontWeight: user.role === "admin" ? 700 : 400 }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-subtle)" }}>
                        {formatTimestamp(user.created_at)}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isSelf || user.role === "admin"}
                          style={{
                            background: "transparent",
                            border: "none",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            textTransform: "uppercase",
                            color: isSelf || user.role === "admin" ? "var(--color-subtle)" : "var(--color-danger)",
                            cursor: isSelf || user.role === "admin" ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            opacity: isSelf || user.role === "admin" ? 0.35 : 1
                          }}
                          title={isSelf ? "Cannot delete yourself" : user.role === "admin" ? "Cannot delete other administrators" : "Delete user account"}
                        >
                          [Delete]
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      NO MATCHING RECORDS FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
