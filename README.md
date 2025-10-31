# blog-masa86

masa86.comの雑記ブログ - Next.js 14.2 + Cloudflare D1

## 概要

このプロジェクトは、長期運用（30年目標）を見据えた堅牢で高速なブログシステムです。
Cloudflare D1データベースとEdge Runtimeを使用し、グローバルに高速なパフォーマンスを実現します。

## 技術スタック

- **フレームワーク**: Next.js 14.2 (App Router) + Edge Runtime
- **ランタイム**: React 18.3
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 3.4 + Custom CSS
- **データベース**: Cloudflare D1 (SQLite)
- **Markdown**: marked + gray-matter
- **デプロイ**: Cloudflare Pages

## Cloudflare D1 セットアップ

### 1. Wranglerのインストールとログイン

```bash
npm install -g wrangler
wrangler login
```

### 2. D1データベースの作成

```bash
wrangler d1 create blog-masa86-db
```

出力されたdatabase_idをコピーして、`wrangler.toml`ファイルを更新：

```toml
[[d1_databases]]
binding = "DB"
database_name = "blog-masa86-db"
database_id = "your-database-id-here"  # ここに実際のIDを貼り付け
```

### 3. スキーマの適用

```bash
wrangler d1 execute blog-masa86-db --file=schema.sql
```

### 4. データのインポート

既存のHugo記事データをエクスポート：

```bash
npm run export-data
```

D1にデータをインポート：

```bash
wrangler d1 execute blog-masa86-db --file=exported-data.sql
```

### 5. Cloudflare Pagesにデプロイ

GitHubリポジトリと連携してデプロイ：

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)にアクセス
2. Pages → Create a project
3. GitHubリポジトリを選択: `blog-masa86`
4. ビルド設定:
   - Build command: `npx @cloudflare/next-on-pages`
   - Build output directory: `.vercel/output/static`
5. 環境変数（必要な場合）を設定
6. D1バインディングを設定:
   - Settings → Functions → D1 database bindings
   - 変数名: `DB`
   - D1データベース: `blog-masa86-db`
7. デプロイを実行

## プロジェクト構造

```
blog-masa86/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ（最新5件）
│   ├── [slug]/page.tsx    # 記事詳細ページ
│   ├── posts/page.tsx     # 記事一覧ページ
│   ├── tags/[tag]/page.tsx # タグ別ページ
│   ├── admin/             # 管理画面
│   ├── api/posts/         # API Routes
│   └── sitemap.xml/route.ts
├── components/            # Reactコンポーネント
│   ├── PostCard.tsx
│   ├── Sidebar.tsx
│   └── MarkdownRenderer.tsx
├── lib/                   # ユーティリティ
│   ├── db.ts              # D1データベース操作
│   ├── markdown.ts
│   ├── auth.ts
│   └── types.ts
├── scripts/
│   └── export-data.ts     # データエクスポートツール
├── wrangler.toml          # Cloudflare設定
└── schema.sql             # D1スキーマ
```

## 主な機能

### 公開機能
- **トップページ**: 最新5件の記事をカード表示
- **記事詳細**: Markdownレンダリング、YouTube埋め込み対応
- **記事一覧**: 全記事表示、タグ絞り込み、キーワード検索、ページネーション
- **タグページ**: タグ別記事一覧
- **サイドバー**: アーカイブ（年月階層）、タグ一覧
- **レスポンシブ**: デスクトップ2カラム、モバイルハンバーガーメニュー
- **ダークモード**: システム設定に自動対応

### 管理機能（/admin）
- **認証**: Basic認証（ID: mn, PW: 39）
- **記事一覧**: 全記事の管理
- **新規作成**: Markdownエディタ
- **編集**: 既存記事の編集
- **削除**: 記事の物理削除

### SEO
- `/sitemap.xml`: 全記事・タグページの動的サイトマップ
- `/robots.txt`: クローラー制御
- メタタグ: 各ページで適切に設定

## ローカル開発

**注意**: このプロジェクトはCloudflare D1専用です。ローカル開発にはWranglerが必要です。

### 開発サーバーの起動

```bash
# 依存関係のインストール
npm install

# Wrangler devモードで起動
wrangler pages dev npm run dev
```

または、Cloudflare D1のローカルバインディングを使用：

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

Cloudflare Pages用のビルド：

```bash
npm run pages:build
```

## データベース

### postsテーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER | 主キー |
| slug | TEXT | URL用スラッグ（0001, 0002...） |
| title | TEXT | タイトル |
| content | TEXT | 本文（Markdown） |
| tags | TEXT | タグ（JSON配列） |
| created_at | TEXT | 作成日時（ISO 8601） |
| updated_at | TEXT | 更新日時（ISO 8601） |

### API

- `GET /api/posts` - 記事一覧取得（limit, tag, search対応）
- `GET /api/posts/[id]` - 記事詳細取得
- `POST /api/posts` - 新規作成（Basic認証）
- `PUT /api/posts/[id]` - 更新（Basic認証）
- `DELETE /api/posts/[id]` - 削除（Basic認証）

## 設計思想

### Edge-First Architecture
- **Cloudflare D1**: グローバルに分散されたSQLiteデータベース
- **Edge Runtime**: 世界中のエッジロケーションで実行
- **高速レスポンス**: ユーザーに最も近いロケーションから配信

### 長期運用のための原則
- **シンプルな実装**: 複雑性を避け、保守性を優先
- **クリーンなコード**: 環境分岐なし、D1専用の明快な実装
- **堅牢性**: Edge Runtimeでの安定動作を保証

## デプロイ

### 自動デプロイ

GitHubにpushすると、Cloudflare Pagesが自動的にビルド・デプロイします。

### 手動デプロイ

```bash
npm run pages:deploy
```

## トラブルシューティング

### D1接続エラー

`getRequestContext()`エラーが出る場合は、Edge Runtime設定を確認：
- すべての動的ルートで `export const runtime = 'edge';` が設定されているか確認

### ビルドエラー

```bash
# キャッシュをクリア
rm -rf .next .vercel/output
npm run build
```

## ライセンス

Private

## 作成者

masa86 / unbelong

---

## 補足: データ移行について

既存のbetter-sqlite3データベースからD1への移行は以下の手順で行います：

1. `npm run export-data` - SQLiteデータをSQLファイルにエクスポート
2. `wrangler d1 execute blog-masa86-db --file=exported-data.sql` - D1にインポート

49記事が正常に移行されます。
