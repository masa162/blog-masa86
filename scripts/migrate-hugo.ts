import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import db from '../lib/db';

// Hugoブログのパス
const HUGO_CONTENT_PATH = 'D:\\github\\masa86\\content\\posts';

interface HugoPost {
  title: string;
  date: string;
  slug?: string;
  tags?: string[];
  content: string;
  filePath: string;
}

// Hugoの記事を読み込む
function loadHugoPosts(): HugoPost[] {
  const posts: HugoPost[] = [];
  
  // 2023と2025のディレクトリを読む
  const years = ['2023', '2025'];
  
  years.forEach(year => {
    const yearPath = path.join(HUGO_CONTENT_PATH, year);
    if (!fs.existsSync(yearPath)) {
      console.log(`Skipping ${year} - directory not found`);
      return;
    }
    
    const files = fs.readdirSync(yearPath);
    
    files.forEach(file => {
      // .mdファイルのみ処理（.iniなどは除外）
      if (!file.endsWith('.md') || file.includes('.ini')) {
        return;
      }
      
      const filePath = path.join(yearPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      try {
        const { data, content } = matter(fileContent);
        
        // 必須項目があるかチェック
        if (!data.title || !data.date) {
          console.log(`Skipping ${file} - missing title or date`);
          return;
        }
        
        posts.push({
          title: data.title,
          date: data.date,
          slug: data.slug,
          tags: data.tags || [],
          content: content.trim(),
          filePath,
        });
      } catch (error) {
        console.error(`Error parsing ${file}:`, error);
      }
    });
  });
  
  return posts;
}

// 日付でソート（古い順）
function sortPostsByDate(posts: HugoPost[]): HugoPost[] {
  return posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });
}

// データベースにインポート
function importToDatabase(posts: HugoPost[]) {
  // 既存のpostsを削除（クリーンインポート）
  db.prepare('DELETE FROM posts').run();
  console.log('Cleared existing posts');
  
  const insertStmt = db.prepare(`
    INSERT INTO posts (slug, title, content, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  posts.forEach((post, index) => {
    // 連番slugを生成（0001, 0002, ...）
    const slug = String(index + 1).padStart(4, '0');
    
    // 日付をISO形式に変換
    const createdAt = new Date(post.date).toISOString();
    const updatedAt = createdAt;
    
    // タグをJSON文字列に変換
    const tags = JSON.stringify(post.tags);
    
    insertStmt.run(slug, post.title, post.content, tags, createdAt, updatedAt);
    
    console.log(`Imported [${slug}] ${post.title}`);
  });
  
  console.log(`\nTotal imported: ${posts.length} posts`);
}

// メイン実行
function main() {
  console.log('Starting Hugo posts migration...\n');
  
  // Hugoの記事を読み込む
  const posts = loadHugoPosts();
  console.log(`Found ${posts.length} posts\n`);
  
  if (posts.length === 0) {
    console.log('No posts found to migrate');
    return;
  }
  
  // 日付でソート
  const sortedPosts = sortPostsByDate(posts);
  
  // データベースにインポート
  importToDatabase(sortedPosts);
  
  console.log('\nMigration completed!');
}

// 実行
main();

