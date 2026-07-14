"use client";

import { useState } from "react";

export type Post = {
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
  post: Post;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  isLiked: boolean;
  isAuthenticated: boolean;
};

export function formatTimestamp(timestamp: string | number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`;
  } else if (diffDays < 7) {
    return `${Math.floor(diffDays)}d ago`;
  } else {
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

function getPriority(likes: number) {
  if (likes >= 10) return { label: "High Priority", cls: "badge-danger" };
  if (likes >= 5)  return { label: "Medium Priority", cls: "badge-warning" };
  return { label: "Reported", cls: "badge-neutral" };
}

export default function PostCard({ post, onLike, onDelete, isLiked, isAuthenticated }: Props) {
  const priority = getPriority(post.likes);
  const [imgError, setImgError] = useState(false);

  return (
    <article className="card card-hover post-card animate-fade-in">
      {post.image && !imgError && (
        <div className="post-card-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt="Issue photo"
            className="post-card-img"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className="post-card-body">
        {/* Title row */}
        <div className="post-card-title-row">
          <h3 className="post-card-title">{post.title}</h3>
          <span className={`badge ${priority.cls}`}>{priority.label}</span>
        </div>

        {/* Description */}
        {post.description && (
          <p className="post-card-desc">{post.description}</p>
        )}

        {/* Meta */}
        <div className="post-card-meta">
          {post.address && (
            <span className="meta-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {post.address}
            </span>
          )}
          {post.user_name && (
            <span className="meta-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              {post.user_name}
            </span>
          )}
          <span className="meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatTimestamp(post.created_at)}
          </span>
        </div>

        {/* Footer actions */}
        <div className="post-card-footer">
          <button
            className={`post-like-btn ${isLiked ? "liked" : ""} ${!isAuthenticated ? "post-like-btn-locked" : ""}`}
            onClick={() => onLike(post.id)}
            title={
              !isAuthenticated
                ? "Sign in to support this issue"
                : isLiked
                ? "Click to remove your support"
                : "Support this issue"
            }
            aria-label={isLiked ? "Remove support" : "Support this issue"}
          >
            {!isAuthenticated ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="0" ry="0" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            )}
            {post.likes} {post.likes === 1 ? "support" : "supports"}
          </button>

          {isAuthenticated && (
            <button
              className="btn btn-ghost post-delete-btn"
              onClick={() => onDelete(post.id)}
              title="Delete this post"
              aria-label="Delete post"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
