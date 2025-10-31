# Cloudflare Pages デプロイガイド

## 概要

このプロジェクトは完全にCloudflare D1とEdge Runtime用に最適化されています。
シンプルでクリーンなコードで、高速なグローバル配信を実現します。

## セットアップ手順

### ステップ1: D1データベースの作成

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

### ステップ2: wrangler.tomlの更新

`wrangler.toml`ファイルのdatabase_idを更新：

```toml
name = "blog-masa86"
compatibility_date = "2025-10-31"

[[d1_databases]]
binding = "DB"
database_name = "blog-masa86-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 実際のIDに置き換える
```

### ステップ3: D1テーブルの初期化

```bash
# schema.sqlファイルは既に用意されています
# D1にスキーマを適用
wrangler d1 execute blog-masa86-db --file=schema.sql
```

### ステップ4: データの移行

既存のHugoブログデータをエクスポート：

```bash
# Node.jsスクリプトでデータをエクスポート
npm run export-data
```

D1にデータをインポート：

```bash
wrangler d1 execute blog-masa86-db --file=exported-data.sql
```

### ステップ5: Cloudflare Pagesにデプロイ

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)にアクセス
2. Pages → Create a project
3. GitHubリポジトリを選択
4. ビルド設定:
   - **Framework preset**: Next.js
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
5. D1バインディングを設定:
   - Settings → Functions → D1 database bindings
   - 変数名: `DB`
   - D1データベース: `blog-masa86-db`
6. Deploy

## アーキテクチャ

### Edge-First Design

このプロジェクトは完全にEdge Runtime用に設計されています：

- **lib/db.ts**: `getRequestContext()`を使用してD1にアクセス
- **すべてのルート**: `export const runtime = 'edge'`を設定
- **async/await**: すべてのデータベース操作は非同期

### コードのシンプルさ

環境分岐なし、D1専用の実装により：
- ✅ コードが読みやすい
- ✅ メンテナンスが容易
- ✅ バグが少ない
- ✅ パフォーマンスが最適化

## トラブルシューティング

### getRequestContext() エラー

Edge Runtime環境外でコードを実行するとエラーになります。すべてのページで `export const runtime = 'edge';` が設定されているか確認してください。

### D1バインディングが見つからない

Cloudflare Pagesの設定でD1バインディングが正しく設定されているか確認してください。

## 利点

### パフォーマンス
- **グローバル配信**: 世界中のエッジロケーションから高速配信
- **低レイテンシ**: ユーザーに最も近いロケーションで実行
- **スケーラブル**: 自動スケーリング

### コスト
- **無料枠が大きい**: Cloudflare Pagesの無料プランで十分
- **従量課金**: 使った分だけ支払い

### 開発体験
- **シンプルなコード**: 環境分岐なし
- **型安全**: TypeScript完全対応
- **デプロイが簡単**: GitHubにpushするだけ

