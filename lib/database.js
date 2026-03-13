import sqlite3 from 'sqlite3';

// Database connection
let db = null;

export async function getDb() {
  if (!db) {
    db = new sqlite3.Database('./data/posts.db');

    // Create posts table if it doesn't exist
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          address TEXT,
          image TEXT,
          likes INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  return db;
}

// Post operations
export async function getAllPosts() {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM posts ORDER BY likes DESC, created_at DESC', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export async function createPost(post) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO posts (title, description, address, image) VALUES (?, ?, ?, ?)',
      [post.title, post.description, post.address, post.image],
      function(err) {
        if (err) reject(err);
        else resolve({ ...post, id: this.lastID });
      }
    );
  });
}

export async function likePost(id) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id], (err) => {
      if (err) reject(err);
      else {
        db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }
    });
  });
}

export async function deletePost(id) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}