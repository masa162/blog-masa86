import fs from 'fs';
import Database from 'better-sqlite3';
import path from 'path';

// データベースパス
const dbPath = path.join(process.cwd(), 'blog.db');

// エクスポート先
const outputPath = path.join(process.cwd(), 'exported-data.sql');

function exportData() {
  console.log('Starting data export...\n');
  
  // データベースに接続
  const db = new Database(dbPath, { readonly: true });
  
  // すべての記事を取得
  const posts = db.prepare('SELECT * FROM posts ORDER BY id').all();
  
  console.log(`Found ${posts.length} posts to export\n`);
  
  // SQLインサート文を生成
  const sqlStatements: string[] = [];
  
  posts.forEach((post: any) => {
    const sql = `INSERT INTO posts (id, slug, title, content, tags, created_at, updated_at) VALUES (
  ${post.id},
  ${escapeString(post.slug)},
  ${escapeString(post.title)},
  ${escapeString(post.content)},
  ${escapeString(post.tags)},
  ${escapeString(post.created_at)},
  ${escapeString(post.updated_at)}
);`;
    
    sqlStatements.push(sql);
    console.log(`Exported: [${post.slug}] ${post.title}`);
  });
  
  // ファイルに書き込み
  const output = `-- Exported data from blog-masa86
-- Date: ${new Date().toISOString()}
-- Total posts: ${posts.length}

${sqlStatements.join('\n\n')}
`;
  
  fs.writeFileSync(outputPath, output, 'utf-8');
  
  console.log(`\n✓ Data exported to: ${outputPath}`);
  console.log(`✓ Total posts exported: ${posts.length}`);
  console.log('\nNext steps:');
  console.log('1. Create D1 database: wrangler d1 create blog-masa86-db');
  console.log('2. Update wrangler.toml with the database_id');
  console.log('3. Apply schema: wrangler d1 execute blog-masa86-db --file=schema.sql');
  console.log('4. Import data: wrangler d1 execute blog-masa86-db --file=exported-data.sql');
  
  db.close();
}

// SQL文字列のエスケープ
function escapeString(str: string): string {
  if (str === null || str === undefined) {
    return 'NULL';
  }
  // シングルクォートをエスケープ
  const escaped = str.replace(/'/g, "''");
  return `'${escaped}'`;
}

// 実行
try {
  exportData();
} catch (error) {
  console.error('Error exporting data:', error);
  process.exit(1);
}

