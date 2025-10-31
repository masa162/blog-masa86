# blog-masa86

masa86.comの雑記ブログ - Next.js 14.2 + TypeScript + Tailwind CSS

## 概要

このプロジェクトは、長期運用（30年目標）を見据えた堅牢で高速なブログシステムです。
Hugoから移行し、Next.js App Routerで再構築されています。

## 技術スタック

- **フレームワーク**: Next.js 14.2 (App Router)
- **ランタイム**: React 18.3
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 3.4
- **データベース**: SQLite (better-sqlite3) / Cloudflare D1対応準備済み
- **Markdown**: marked + gray-matter

## 開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. データベースの初期化とHugo記事の移行

```bash
npm run migrate
```

このコマンドは、D:\github\masa86\content\postsから既存のHugo記事を読み込み、
データベースに移行します（約50記事）。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## ビルド

```bash
npm run build
npm run start
```

## プロジェクト構造

```
blog-masa86/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ（最新5件）
│   ├── [slug]/            # 記事詳細ページ
│   ├── posts/             # 記事一覧ページ
│   ├── tags/[tag]/        # タグ別ページ
│   ├── admin/             # 管理画面
│   ├── api/posts/         # API Routes
│   └── sitemap.xml/       # 動的サイトマップ
├── components/            # Reactコンポーネント
│   ├── PostCard.tsx       # 記事カード
│   ├── Sidebar.tsx        # サイドバー（アーカイブ、タグ）
│   └── MarkdownRenderer.tsx
├── lib/                   # ユーティリティ
│   ├── db.ts              # データベース操作
│   ├── markdown.ts        # Markdown処理
│   ├── auth.ts            # Basic認証
│   └── types.ts           # TypeScript型定義
├── scripts/
│   └── migrate-hugo.ts    # Hugo記事移行スクリプト
└── public/
    └── robots.txt
```

## 主な機能

### 公開機能
- **トップページ**: 最新5件の記事をカード表示
- **記事詳細**: Markdownレンダリング、YouTube埋め込み対応
- **記事一覧**: 全記事表示、タグ絞り込み、キーワード検索
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

### CRUD API

- `GET /api/posts` - 記事一覧取得（limit, tag, search対応）
- `GET /api/posts/[id]` - 記事詳細取得
- `POST /api/posts` - 新規作成（Basic認証）
- `PUT /api/posts/[id]` - 更新（Basic認証）
- `DELETE /api/posts/[id]` - 削除（Basic認証）

## 設計思想

### 長期運用のための原則
- **枯れた技術**: 安定版の採用（Next.js 14.2, React 18.3）
- **シンプルな実装**: 複雑性を避け、保守性を優先
- **段階的な実装**: 各フェーズでビルド確認
- **依存関係の最小化**: 必要最小限のライブラリ

### post-masa86からの教訓
- ✅ Node.js runtime使用（Cloudflare Pagesでのリンク安定性）
- ✅ サーバーコンポーネント優先（SEO最適化）
- ✅ Link内のネストを回避
- ✅ プレーンテキストプレビュー（HTMLレンダリング最小限）
- ❌ dangerouslySetInnerHTMLの多用を回避
- ❌ 全ページへのedge runtime適用を回避

## Cloudflare Pages デプロイ準備

このプロジェクトは、Cloudflare Pagesでのデプロイに対応しています。
ローカル開発ではbetter-sqlite3を使用し、本番環境ではCloudflare D1への移行が可能です。

### 今後の対応
- wrangler.toml設定
- D1データベース作成と接続
- @cloudflare/next-on-pages統合

## ライセンス

Private

## 作成者

masa86 / unbelong

