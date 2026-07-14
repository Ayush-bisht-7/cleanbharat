import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAllPosts, getAllUsers, getAdminStats } from "@/lib/database.js";
import Link from "next/link";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  title: "Admin Panel | Clean Bharat",
  description: "Administrative dashboard to moderate civic issues and manage user accounts.",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2 style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>ACCESS DENIED</h2>
        <p style={{ color: "var(--color-muted)", fontSize: 14 }}>You do not have administrative privileges to view this page.</p>
        <Link href="/" className="btn btn-outline" style={{ marginTop: 8 }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const stats = await getAdminStats();
  const posts = await getAllPosts();
  const users = await getAllUsers();

  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: 24, marginBottom: 48 }}>
        <span className="section-kicker">Administrative Dashboard</span>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>Admin Control Panel</h1>
      </div>

      <AdminDashboardClient
        initialStats={stats}
        initialPosts={posts}
        initialUsers={users}
        currentUserId={(session.user as any).id}
      />
    </div>
  );
}
