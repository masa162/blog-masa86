import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          ページが見つかりませんでした
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-80 inline-block"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}

