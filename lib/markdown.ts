// シンプルなMarkdown to HTML変換（Edge Runtime対応）

// YouTube shortcode を iframe HTMLに変換
function processYouTubeShortcodes(content: string): string {
  return content.replace(
    /\{\{<\s*youtube\s+([a-zA-Z0-9_-]+)\s*>\}\}/g,
    '<div class="youtube-embed my-6"><iframe width="560" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full aspect-video rounded-lg"></iframe></div>'
  );
}

// HTMLエスケープ
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Markdown を HTML に変換（シンプル実装）
export function markdownToHtml(markdown: string): string {
  let html = markdown;
  
  // YouTube shortcode を処理
  html = processYouTubeShortcodes(html);
  
  // 行ごとに処理
  const lines = html.split('\n');
  const output: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let inBlockquote = false;
  let blockquoteContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // コードブロック
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // コードブロック終了
        output.push('<pre><code>' + escapeHtml(codeBlockContent.join('\n')) + '</code></pre>');
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // コードブロック開始
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // ブロック引用
    if (line.trim().startsWith('>')) {
      if (!inBlockquote) {
        inBlockquote = true;
      }
      blockquoteContent.push(line.replace(/^>\s?/, ''));
      continue;
    } else if (inBlockquote) {
      output.push('<blockquote>' + processInline(blockquoteContent.join('\n')) + '</blockquote>');
      blockquoteContent = [];
      inBlockquote = false;
    }
    
    // 空行
    if (line.trim() === '') {
      output.push('<br>');
      continue;
    }
    
    // 見出し
    if (line.startsWith('# ')) {
      output.push('<h1>' + escapeHtml(line.substring(2)) + '</h1>');
    } else if (line.startsWith('## ')) {
      output.push('<h2>' + escapeHtml(line.substring(3)) + '</h2>');
    } else if (line.startsWith('### ')) {
      output.push('<h3>' + escapeHtml(line.substring(4)) + '</h3>');
    } else if (line.startsWith('#### ')) {
      output.push('<h4>' + escapeHtml(line.substring(5)) + '</h4>');
    } else if (line.startsWith('##### ')) {
      output.push('<h5>' + escapeHtml(line.substring(6)) + '</h5>');
    } else if (line.startsWith('###### ')) {
      output.push('<h6>' + escapeHtml(line.substring(7)) + '</h6>');
    }
    // リスト
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      output.push('<li>' + processInline(line.trim().substring(2)) + '</li>');
    }
    // 画像・リンクを含む通常の段落
    else {
      output.push('<p>' + processInline(line) + '</p>');
    }
  }
  
  // 未閉じのブロック引用を処理
  if (inBlockquote && blockquoteContent.length > 0) {
    output.push('<blockquote>' + processInline(blockquoteContent.join('\n')) + '</blockquote>');
  }
  
  return output.join('\n');
}

// インライン要素の処理
function processInline(text: string): string {
  let result = text;
  
  // 画像 ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4">');
  
  // リンク [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // 太字 **text**
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // イタリック *text*
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // インラインコード `code`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  return result;
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
