import Link from 'next/link';
import { Post } from '@/lib/types';
import { extractPreview } from '@/lib/markdown';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const preview = extractPreview(post.content, 150);
  const displayTags = post.tags.slice(0, 3); // 最大3個
  const createdDate = new Date(post.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <article className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
      <Link href={`/${post.slug}`} className="block">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100 hover:text-accent dark:hover:text-accent">
          {post.title}
        </h2>
      </Link>
      <time className="text-sm text-gray-500 dark:text-gray-400 mb-3 block">
        {createdDate}
      </time>
      <Link href={`/${post.slug}`} className="block">
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
          {preview}
        </p>
      </Link>
      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayTags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

