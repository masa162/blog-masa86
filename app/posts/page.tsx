import Link from 'next/link';
import { getPosts, getPostsCount, getAllTags, getArchive } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: '記事一覧 | 中山雑記',
  description: 'すべての記事一覧',
};

export default function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string; tags?: string; q?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  const searchTags = searchParams.tags?.split(',').filter(Boolean);
  const searchQuery = searchParams.q;
  
  // タグがある場合は、各タグで絞り込み（AND条件）
  let posts = getPosts({ limit, offset, search: searchQuery });
  let total = getPostsCount({ search: searchQuery });
  
  if (searchTags && searchTags.length > 0) {
    // 複数タグでのAND絞り込み
    posts = posts.filter(post =>
      searchTags.every(tag => post.tags.includes(tag))
    );
    // 総数も再計算
    const allPosts = getPosts({ limit: 10000, search: searchQuery });
    total = allPosts.filter(post =>
      searchTags.every(tag => post.tags.includes(tag))
    ).length;
  }
  
  const totalPages = Math.ceil(total / limit);
  const allTags = getAllTags();
  const archive = getArchive();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-content mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            記事一覧
          </h1>
          
          {/* 選択中のタグ表示 */}
          {searchTags && searchTags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                選択中のタグ:
              </p>
              <div className="flex flex-wrap gap-2">
                {searchTags.map(tag => (
                  <Link
                    key={tag}
                    href={`/posts?tags=${searchTags.filter(t => t !== tag).join(',')}`}
                    className="px-3 py-1 bg-accent text-white rounded-full hover:bg-opacity-80 text-sm flex items-center gap-2"
                  >
                    {tag}
                    <span>×</span>
                  </Link>
                ))}
                <Link
                  href="/posts"
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                >
                  すべてクリア
                </Link>
              </div>
            </div>
          )}
          
          {/* 検索キーワード表示 */}
          {searchQuery && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                「{searchQuery}」の検索結果: {total}件
              </p>
            </div>
          )}
        </header>
        
        <div className="flex gap-8">
          {/* メインコンテンツ */}
          <main className="flex-1 min-w-0">
            <div className="space-y-6 mb-8">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            {posts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                記事が見つかりませんでした
              </p>
            )}
            
            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={`/posts?page=${page - 1}${searchTags ? `&tags=${searchTags.join(',')}` : ''}${searchQuery ? `&q=${searchQuery}` : ''}`}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    前へ
                  </Link>
                )}
                
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {page} / {totalPages}
                </span>
                
                {page < totalPages && (
                  <Link
                    href={`/posts?page=${page + 1}${searchTags ? `&tags=${searchTags.join(',')}` : ''}${searchQuery ? `&q=${searchQuery}` : ''}`}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    次へ
                  </Link>
                )}
              </div>
            )}
          </main>
          
          {/* サイドバー */}
          <Sidebar archive={archive} tags={allTags} />
        </div>
      </div>
    </div>
  );
}

