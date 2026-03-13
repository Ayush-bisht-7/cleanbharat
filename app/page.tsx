"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch posts on component mount
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
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const title = e.target.title.value.trim();
    const desc = e.target.description.value.trim();
    const address = e.target.address.value.trim();
    const imageFile = e.target.image.files[0];

    let imageData = null;
    if (imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      await new Promise((resolve) => {
        reader.onload = () => {
          imageData = reader.result;
          resolve();
        };
      });
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: desc,
          address,
          image: imageData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();
      setPosts(prev => [newPost, ...prev].sort((a, b) => b.likes - a.likes));

      // Reset form
      e.target.reset();
    } catch (err) {
      setError(err.message);
      console.error('Error creating post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const likePost = async (id) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like post');

      const updatedPost = await response.json();
      setPosts(prev =>
        prev.map(post =>
          post.id === id ? updatedPost : post
        ).sort((a, b) => b.likes - a.likes)
      );
    } catch (err) {
      setError('Failed to like post');
      console.error('Error liking post:', err);
    }
  };

  const deletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      setError('Failed to delete post');
      console.error('Error deleting post:', err);
    }
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header>
        <h1>🏙️ City Issue Reporter</h1>
        <p>Report problems in your city and help make it better</p>
      </header>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h2>📝 Report a Problem</h2>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <label htmlFor="title">Problem Title *</label>
          <input type="text" id="title" name="title" placeholder="e.g., Broken street light" required />

          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" placeholder="Describe the problem in detail..."></textarea>

          <label htmlFor="address">Location / Address</label>
          <input type="text" id="address" name="address" placeholder="e.g., Main Street, near park" />

          <label htmlFor="image">Upload Image (optional)</label>
          <input type="file" id="image" name="image" accept="image/*" />

          <button type="submit" disabled={submitting}>
            {submitting ? '🚀 Posting...' : '🚀 Post Problem'}
          </button>
        </form>

        <h2>🌟 Community Reported Issues</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search posts by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading posts...</div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((p) => (
              <div key={p.id} className="post">
                <h3>{p.title}</h3>
                {p.image && <img src={p.image} alt="Problem image" />}
                <p className="description">{p.description}</p>
                <p className="address"><strong>📍 Location:</strong> {p.address}</p>
                <p className="timestamp">🕒 {formatTimestamp(p.created_at)}</p>
                <div className="post-footer">
                  <p className="support-count">👍 {p.likes} supports</p>
                  <div className="post-actions">
                    <button onClick={() => likePost(p.id)} className="like">Support</button>
                    <button onClick={() => deletePost(p.id)} className="delete">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredPosts.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                {searchTerm ? `No posts found matching "${searchTerm}"` : 'No posts yet. Be the first to report an issue! 📝'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
