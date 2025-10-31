import Database from 'better-sqlite3';
import { Post, DbPost } from './types';
import path from 'path';

const dbPath = path.join(process.cwd(), 'blog.db');
const db = new Database(dbPath);

// データベース初期化
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
  `);
}

// DB形式からPost形式に変換
function dbPostToPost(dbPost: DbPost): Post {
  return {
    ...dbPost,
    tags: JSON.parse(dbPost.tags),
  };
}

// Post形式からDB形式に変換
function postToDbPost(post: Omit<Post, 'id'> & { id?: number }): Omit<DbPost, 'id'> & { id?: number } {
  return {
    ...post,
    tags: JSON.stringify(post.tags),
  };
}

// 記事一覧取得
export interface GetPostsOptions {
  limit?: number;
  offset?: number;
  tag?: string;
  search?: string;
}

export function getPosts(options: GetPostsOptions = {}): Post[] {
  const { limit = 20, offset = 0, tag, search } = options;
  
  let query = 'SELECT * FROM posts WHERE 1=1';
  const params: any[] = [];

  if (tag) {
    query += ` AND tags LIKE ?`;
    params.push(`%"${tag}"%`);
  }

  if (search) {
    query += ` AND (title LIKE ? OR content LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as DbPost[];
  
  return rows.map(dbPostToPost);
}

// 記事総数取得
export function getPostsCount(options: { tag?: string; search?: string } = {}): number {
  const { tag, search } = options;
  
  let query = 'SELECT COUNT(*) as count FROM posts WHERE 1=1';
  const params: any[] = [];

  if (tag) {
    query += ` AND tags LIKE ?`;
    params.push(`%"${tag}"%`);
  }

  if (search) {
    query += ` AND (title LIKE ? OR content LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  const stmt = db.prepare(query);
  const result = stmt.get(...params) as { count: number };
  
  return result.count;
}

// slugで記事取得
export function getPostBySlug(slug: string): Post | null {
  const stmt = db.prepare('SELECT * FROM posts WHERE slug = ?');
  const row = stmt.get(slug) as DbPost | undefined;
  
  return row ? dbPostToPost(row) : null;
}

// IDで記事取得
export function getPostById(id: number): Post | null {
  const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
  const row = stmt.get(id) as DbPost | undefined;
  
  return row ? dbPostToPost(row) : null;
}

// 記事作成
export function createPost(data: { title: string; content: string; tags: string[] }): Post {
  // 次のslugを生成
  const lastPost = db.prepare('SELECT slug FROM posts ORDER BY slug DESC LIMIT 1').get() as { slug: string } | undefined;
  const nextSlugNumber = lastPost ? parseInt(lastPost.slug) + 1 : 1;
  const slug = String(nextSlugNumber).padStart(4, '0');
  
  const now = new Date().toISOString();
  const dbPost = postToDbPost({
    slug,
    title: data.title,
    content: data.content,
    tags: data.tags,
    created_at: now,
    updated_at: now,
  });
  
  const stmt = db.prepare(`
    INSERT INTO posts (slug, title, content, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    dbPost.slug,
    dbPost.title,
    dbPost.content,
    dbPost.tags,
    dbPost.created_at,
    dbPost.updated_at
  );
  
  return getPostById(Number(result.lastInsertRowid))!;
}

// 記事更新
export function updatePost(id: number, data: { title: string; content: string; tags: string[] }): Post | null {
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE posts
    SET title = ?, content = ?, tags = ?, updated_at = ?
    WHERE id = ?
  `);
  
  stmt.run(data.title, data.content, JSON.stringify(data.tags), now, id);
  
  return getPostById(id);
}

// 記事削除
export function deletePost(id: number): boolean {
  const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
  const result = stmt.run(id);
  
  return result.changes > 0;
}

// 全タグ取得
export function getAllTags(): string[] {
  const stmt = db.prepare('SELECT tags FROM posts');
  const rows = stmt.all() as { tags: string }[];
  
  const tagsSet = new Set<string>();
  rows.forEach(row => {
    const tags = JSON.parse(row.tags) as string[];
    tags.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet).sort();
}

// 年月別アーカイブ取得
export interface ArchiveMonth {
  year: number;
  month: number;
  posts: { id: number; slug: string; title: string }[];
}

export function getArchive(): { [year: number]: ArchiveMonth[] } {
  const stmt = db.prepare('SELECT id, slug, title, created_at FROM posts ORDER BY created_at DESC');
  const rows = stmt.all() as { id: number; slug: string; title: string; created_at: string }[];
  
  const archive: { [year: number]: { [month: number]: ArchiveMonth } } = {};
  
  rows.forEach(row => {
    const date = new Date(row.created_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    if (!archive[year]) {
      archive[year] = {};
    }
    
    if (!archive[year][month]) {
      archive[year][month] = { year, month, posts: [] };
    }
    
    archive[year][month].posts.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
    });
  });
  
  // 年ごとに月のリストに変換
  const result: { [year: number]: ArchiveMonth[] } = {};
  Object.keys(archive).forEach(yearStr => {
    const year = parseInt(yearStr);
    result[year] = Object.values(archive[year]).sort((a, b) => b.month - a.month);
  });
  
  return result;
}

// データベース初期化を実行
initDatabase();

export default db;

