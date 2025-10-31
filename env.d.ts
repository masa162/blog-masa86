/// <reference types="@cloudflare/workers-types" />

// Cloudflare環境変数の型拡張
declare module '@cloudflare/next-on-pages' {
  export interface CloudflareEnv {
    DB: D1Database;
  }
}

