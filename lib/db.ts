import { Post, DbPost } from './types';

// Cloudflare環境変数の型定義
type Env = {
  DB: D1Database;
};

// Cloudflare D1 Database取得
function getDb(): D1Database {
  // @ts-ignore - getRequestContextはCloudflare Pages環境で利用可能
  const context = getRequestContext();
  return (context.env as Env).DB;
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

// 記事一覧取得オプション
export interface GetPostsOptions {
  limit?: number;
  offset?: number;
  tag?: string;
  search?: string;
}

// 記事一覧取得
export async function getPosts(options: GetPostsOptions = {}): Promise<Post[]> {
  const { limit = 20, offset = 0, tag, search } = options;
  const db = getDb();
  
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

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map((row: any) => dbPostToPost(row as DbPost));
}

// 記事総数取得
export async function getPostsCount(options: { tag?: string; search?: string } = {}): Promise<number> {
  const { tag, search } = options;
  const db = getDb();
  
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

  const result = await db.prepare(query).bind(...params).first() as { count: number } | null;
  return result ? result.count : 0;
}

// slugで記事取得
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = getDb();
  const result = await db.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first();
  
  return result ? dbPostToPost(result as unknown as DbPost) : null;
}

// IDで記事取得
export async function getPostById(id: number): Promise<Post | null> {
  const db = getDb();
  const result = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
  
  return result ? dbPostToPost(result as unknown as DbPost) : null;
}

// 記事作成
export async function createPost(data: { title: string; content: string; tags: string[] }): Promise<Post> {
  const db = getDb();
  
  // 次のslugを生成
  const lastPost = await db.prepare('SELECT slug FROM posts ORDER BY slug DESC LIMIT 1').first() as { slug: string } | null;
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
  
  const result = await db.prepare(`
    INSERT INTO posts (slug, title, content, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    dbPost.slug,
    dbPost.title,
    dbPost.content,
    dbPost.tags,
    dbPost.created_at,
    dbPost.updated_at
  ).run();
  
  return (await getPostById(result.meta.last_row_id as number))!;
}

// 記事更新
export async function updatePost(id: number, data: { title: string; content: string; tags: string[] }): Promise<Post | null> {
  const db = getDb();
  const now = new Date().toISOString();
  
  await db.prepare(`
    UPDATE posts
    SET title = ?, content = ?, tags = ?, updated_at = ?
    WHERE id = ?
  `).bind(data.title, data.content, JSON.stringify(data.tags), now, id).run();
  
  return getPostById(id);
}

// 記事削除
export async function deletePost(id: number): Promise<boolean> {
  const db = getDb();
  const result = await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  
  return result.meta.changes > 0;
}

// 全タグ取得
export async function getAllTags(): Promise<string[]> {
  const db = getDb();
  const { results } = await db.prepare('SELECT tags FROM posts').all();
  
  const tagsSet = new Set<string>();
  (results as unknown[]).forEach((row) => {
    const tags = JSON.parse((row as { tags: string }).tags) as string[];
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

export async function getArchive(): Promise<{ [year: number]: ArchiveMonth[] }> {
  const db = getDb();
  const { results } = await db.prepare('SELECT id, slug, title, created_at FROM posts ORDER BY created_at DESC').all();
  
  const archive: { [year: number]: { [month: number]: ArchiveMonth } } = {};
  
  (results as unknown[]).forEach((rawRow) => {
    const row = rawRow as { id: number; slug: string; title: string; created_at: string };
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
