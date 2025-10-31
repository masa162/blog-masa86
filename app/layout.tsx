import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "中山雑記",
  description: "記録と感覚の交差点、unbelongの雑記ブログ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

