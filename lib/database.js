import { createClient } from '@libsql/client';

let db = null;

// Helper to convert libSQL Row objects into POJOs (Plain Old JavaScript Objects).
// This is critical to prevent Next.js from throwing serialization errors 
// when passing database rows to Client Components or from Server Actions.
function toPlainObject(row, columns) {
  if (!row) return null;
  const obj = {};
  for (let i = 0; i < columns.length; i++) {
    obj[columns[i]] = row[i];
  }
  return obj;
}

function toPlainObjects(rows, columns) {
  return rows.map((row) => toPlainObject(row, columns));
}

export async function getDb() {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL || 'file:./data/posts.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;
    db = createClient({
      url,
      authToken,
    });

    // Posts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        address TEXT,
        image TEXT,
        likes INTEGER DEFAULT 0,
        user_id INTEGER,
        user_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Likes junction table — one row per user+post pair
    await db.execute(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      )
    `);

    // Safe migrations for existing DBs
    try {
      await db.execute(`ALTER TABLE posts ADD COLUMN user_id INTEGER`);
    } catch (e) {
      // Ignore if column already exists
    }
    try {
      await db.execute(`ALTER TABLE posts ADD COLUMN user_name TEXT`);
    } catch (e) {
      // Ignore if column already exists
    }
  }
  return db;
}

/* ── Helpers ── */
async function run(sql, params = []) {
  const result = await db.execute({ sql, args: params });
  return {
    lastID: result.lastInsertRowid ? Number(result.lastInsertRowid) : undefined,
    changes: result.rowsAffected,
  };
}

async function get(sql, params = []) {
  const result = await db.execute({ sql, args: params });
  return result.rows.length > 0 ? toPlainObject(result.rows[0], result.columns) : null;
}

async function all(sql, params = []) {
  const result = await db.execute({ sql, args: params });
  return toPlainObjects(result.rows, result.columns);
}

/* ── POST OPERATIONS ── */

export async function getAllPosts() {
  await getDb();
  return all('SELECT * FROM posts ORDER BY likes DESC, created_at DESC');
}

export async function createPost(post) {
  await getDb();
  const stmt = await run(
    'INSERT INTO posts (title, description, address, image, user_id, user_name) VALUES (?, ?, ?, ?, ?, ?)',
    [post.title, post.description, post.address, post.image, post.user_id || null, post.user_name || null]
  );
  return get('SELECT * FROM posts WHERE id = ?', [stmt.lastID]);
}

/**
 * Toggle a like for a user on a post.
 * Returns { post, liked } — liked=true means just liked, false means just unliked.
 */
export async function toggleLike(postId, userId) {
  await getDb();

  const existing = await get(
    'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
    [postId, userId]
  );

  if (existing) {
    // Already liked → unlike
    await run('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
    await run('UPDATE posts SET likes = MAX(0, likes - 1) WHERE id = ?', [postId]);
    const post = await get('SELECT * FROM posts WHERE id = ?', [postId]);
    return { post, liked: false };
  } else {
    // Not yet liked → like
    await run(
      'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
      [postId, userId]
    );
    await run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
    const post = await get('SELECT * FROM posts WHERE id = ?', [postId]);
    return { post, liked: true };
  }
}

/**
 * Returns an array of post IDs that the given user has liked.
 */
export async function getUserLikedPostIds(userId) {
  await getDb();
  const rows = await all('SELECT post_id FROM post_likes WHERE user_id = ?', [userId]);
  return rows.map((r) => r.post_id);
}

export async function deletePost(id) {
  await getDb();
  // Also remove any likes for this post
  await run('DELETE FROM post_likes WHERE post_id = ?', [id]);
  const stmt = await run('DELETE FROM posts WHERE id = ?', [id]);
  return stmt.changes > 0;
}

/* ── USER OPERATIONS ── */

export async function createUser({ name, email, passwordHash }) {
  await getDb();
  const stmt = await run(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  return { id: stmt.lastID, name, email };
}

export async function getUserByEmail(email) {
  await getDb();
  return get('SELECT * FROM users WHERE email = ?', [email]);
}