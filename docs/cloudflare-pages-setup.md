# Cloudflare Pages デプロイ設定

## 現在の状況

このプロジェクトは現在、ローカル開発用に`better-sqlite3`を使用していますが、Cloudflare PagesのEdge Runtimeでは動作しません。

## デプロイエラー

```
ERROR: Failed to produce a Cloudflare Pages build from the project.
The following routes were not configured to run with the Edge Runtime
```

## 解決方法

### オプション1: Cloudflare D1に移行（推奨）

Cloudflare D1データベースに切り替える必要があります。

#### 1. D1データベースの作成

```bash
# Wranglerのインストール
npm install -g wrangler

# ログイン
wrangler login

# D1データベースの作成
wrangler d1 create blog-masa86-db

# 出力例:
# database_name = "blog-masa86-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### 2. wrangler.tomlの作成

プロジェクトルートに`wrangler.toml`を作成：

```toml
name = "blog-masa86"
compatibility_date = "2025-10-31"

[[d1_databases]]
binding = "DB"
database_name = "blog-masa86-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 実際のIDに置き換える
```

#### 3. D1テーブルの初期化

```bash
# スキーマファイルの作成
cat > schema.sql << 'EOF'
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
EOF

# D1にスキーマを適用
wrangler d1 execute blog-masa86-db --file=schema.sql
```

#### 4. データベース接続の修正

`lib/db.ts`を修正してD1を使用するように変更：

```typescript
// Cloudflare D1用の実装
interface Env {
  DB: D1Database;
}

// getRequestContext()からD1を取得
export function getDb(): D1Database {
  // Cloudflare Pagesの環境でDBを取得
  const { env } = getRequestContext();
  return env.DB;
}
```

#### 5. データの移行

既存のSQLiteデータをD1に移行：

```bash
# 既存データをSQLにエクスポート
sqlite3 blog.db .dump > data.sql

# D1にインポート
wrangler d1 execute blog-masa86-db --file=data.sql
```

### オプション2: 静的サイト生成のみ使用

動的なデータベースアクセスを諦め、完全な静的サイトとして生成する方法。

#### next.config.jsの修正

```javascript
module.exports = {
  output: 'export',
  // ...
};
```

**制限事項：**
- 管理画面（/admin）が使用できない
- APIルートが使用できない
- ビルド時のデータのみ表示可能

### オプション3: Vercelなど別のプラットフォームにデプロイ

Node.js runtimeをサポートするプラットフォームを使用：

- **Vercel**: Next.jsの開発元、Node.js完全サポート
- **Netlify**: Node.js関数サポート
- **Railway**: フルNode.jsサポート

## 推奨アプローチ

長期運用を考えると、**Cloudflare D1への移行**が最適です。理由：

1. ✅ Edge Runtimeで高速
2. ✅ Cloudflare Pagesとの統合が優れている
3. ✅ スケーラビリティが高い
4. ✅ コストが低い
5. ✅ 管理画面も動作する

## 次のステップ

1. Cloudflare D1データベースを作成
2. `lib/db.ts`をD1対応に書き換え
3. `wrangler.toml`を追加
4. データを移行
5. 再デプロイ

## 開発環境の維持

ローカル開発では引き続き`better-sqlite3`を使用し、本番環境のみD1を使用する設定も可能です。

```typescript
// lib/db.ts
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // better-sqlite3を使用
} else {
  // D1を使用
}
```

