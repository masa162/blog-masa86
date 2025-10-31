import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllTags, getArchive, getPosts } from '@/lib/db';
import { markdownToHtml } from '@/lib/markdown';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Sidebar from '@/components/Sidebar';

export async function generateStaticParams() {
  const posts = getPosts({ limit: 1000 });
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Not Found',
    };
  }
  
  return {
    title: `${post.title} | 中山雑記`,
    description: post.content.substring(0, 150),
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }
  
  const html = await markdownToHtml(post.content);
  const tags = getAllTags();
  const archive = getArchive();
  
  const createdDate = new Date(post.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-content mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* メインコンテンツ */}
          <main className="flex-1 min-w-0">
            <article>
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {post.title}
                </h1>
                <time className="text-gray-500 dark:text-gray-400">
                  {createdDate}
                </time>
              </header>
              
              <div className="mb-8">
                <MarkdownRenderer html={html} />
              </div>
              
              {/* タグ */}
              {post.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Link
                        key={tag}
                        href={`/tags/${tag}`}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors text-sm"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* ホームに戻るリンク */}
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/"
                  className="text-accent dark:text-accent hover:underline"
                >
                  ← ホームに戻る
                </Link>
              </div>
            </article>
          </main>
          
          {/* サイドバー */}
          <Sidebar archive={archive} tags={tags} currentSlug={post.slug} />
        </div>
      </div>
    </div>
  );
}

