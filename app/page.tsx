import { getPosts, getAllTags, getArchive } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: '中山雑記',
  description: '記録と感覚の交差点、unbelongの雑記ブログ。',
};

export default function HomePage() {
  // 最新5件の記事を取得
  const posts = getPosts({ limit: 5 });
  const tags = getAllTags();
  const archive = getArchive();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-content mx-auto px-6 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            中山雑記
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            記録と感覚の交差点
          </p>
        </header>
        
        <div className="flex gap-8">
          {/* メインコンテンツ */}
          <main className="flex-1 min-w-0">
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            {posts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                記事がありません
              </p>
            )}
          </main>
          
          {/* サイドバー */}
          <Sidebar archive={archive} tags={tags} />
        </div>
      </div>
    </div>
  );
}
