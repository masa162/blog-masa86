import { marked } from 'marked';

// YouTube shortcode を iframe に変換
function processYouTubeShortcodes(content: string): string {
  return content.replace(
    /\{\{<\s*youtube\s+([a-zA-Z0-9_-]+)\s*>\}\}/g,
    '<div class="youtube-embed"><iframe width="560" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
  );
}

// Markdown を HTML に変換
export async function markdownToHtml(markdown: string): Promise<string> {
  // YouTube shortcode を処理
  const processed = processYouTubeShortcodes(markdown);
  
  // Markdown を HTML に変換
  const html = await marked(processed);
  
  return html;
}

// プレビュー用テキスト抽出（150文字）
export function extractPreview(markdown: string, length: number = 150): string {
  // Markdown記法を削除
  let text = markdown
    .replace(/^#{1,6}\s+/gm, '') // 見出し
    .replace(/\*\*(.+?)\*\*/g, '$1') // 太字
    .replace(/\*(.+?)\*/g, '$1') // イタリック
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // リンク
    .replace(/`(.+?)`/g, '$1') // コード
    .replace(/\{\{<\s*youtube\s+.+?\s*>\}\}/g, '[YouTube]') // YouTube
    .replace(/!\[.*?\]\(.+?\)/g, '[画像]') // 画像
    .replace(/\n+/g, ' ') // 改行
    .trim();
  
  // 指定文字数で切り詰め
  if (text.length > length) {
    text = text.substring(0, length) + '...';
  }
  
  return text;
}

