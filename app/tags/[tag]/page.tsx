import Link from 'next/link';
import { getPosts, getAllTags, getArchive } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';

export const runtime = 'edge';

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map(tag => ({
    tag: tag,
  }));
}

export async function generateMetadata({ params }: { params: { tag: string } }) {
  return {
    title: `${params.tag} | 中山雑記`,
    description: `タグ「${params.tag}」の記事一覧`,
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const allPosts = await getPosts({ limit: 1000, tag });
  const allTags = await getAllTags();
  const archive = await getArchive();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-content mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            タグ: {tag}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {allPosts.length}件の記事
          </p>
        </header>
        
        <div className="flex gap-8">
          {/* メインコンテンツ */}
          <main className="flex-1 min-w-0">
            <div className="space-y-6 mb-8">
              {allPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            {allPosts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                このタグの記事はありません
              </p>
            )}
            
            {/* ホームに戻る */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/"
                className="text-accent dark:text-accent hover:underline"
              >
                ← ホームに戻る
              </Link>
            </div>
          </main>
          
          {/* サイドバー */}
          <Sidebar archive={archive} tags={allTags} />
        </div>
      </div>
    </div>
  );
}

