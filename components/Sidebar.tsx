'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArchiveMonth } from '@/lib/db';

interface SidebarProps {
  archive: { [year: number]: ArchiveMonth[] };
  tags: string[];
  currentSlug?: string;
}

export default function Sidebar({ archive, tags, currentSlug }: SidebarProps) {
  const [openYears, setOpenYears] = useState<{ [year: number]: boolean }>({});
  const [openMonths, setOpenMonths] = useState<{ [key: string]: boolean }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleYear = (year: number) => {
    setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
  };
  
  const toggleMonth = (year: number, month: number) => {
    const key = `${year}-${month}`;
    setOpenMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const isMonthOpen = (year: number, month: number) => {
    return openMonths[`${year}-${month}`] || false;
  };
  
  const sidebarContent = (
    <>
      {/* About */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">About</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          記録と感覚の交差点、unbelongの雑記ブログ。
        </p>
      </section>
      
      {/* 記事一覧リンク */}
      <section className="mb-8">
        <Link href="/posts" className="text-accent dark:text-accent hover:underline">
          すべての記事を見る →
        </Link>
      </section>
      
      {/* アーカイブ */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Archive</h3>
        <div className="text-sm">
          {Object.keys(archive)
            .map(Number)
            .sort((a, b) => b - a)
            .map(year => (
              <div key={year} className="mb-2">
                <button
                  onClick={() => toggleYear(year)}
                  className="flex items-center gap-2 hover:text-accent dark:hover:text-accent w-full text-left"
                >
                  <span>{openYears[year] ? '▼' : '▶'}</span>
                  <span className="font-medium">{year}年</span>
                </button>
                
                {openYears[year] && (
                  <div className="ml-4 mt-1">
                    {archive[year].map(monthData => (
                      <div key={monthData.month} className="mb-2">
                        <button
                          onClick={() => toggleMonth(year, monthData.month)}
                          className="flex items-center gap-2 hover:text-accent dark:hover:text-accent w-full text-left"
                        >
                          <span>{isMonthOpen(year, monthData.month) ? '▼' : '▶'}</span>
                          <span>{monthData.month}月</span>
                        </button>
                        
                        {isMonthOpen(year, monthData.month) && (
                          <div className="ml-6 mt-1 space-y-1">
                            {monthData.posts.map(post => (
                              <Link
                                key={post.slug}
                                href={`/${post.slug}`}
                                className="block hover:text-accent dark:hover:text-accent truncate"
                              >
                                {currentSlug === post.slug ? '◉ ' : ''}
                                {post.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </section>
      
      {/* Tags */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Tags</h3>
        <div className="flex flex-wrap gap-2 text-sm">
          {tags.map(tag => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
  
  return (
    <>
      {/* モバイルハンバーガーメニュー */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          aria-label="Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
      
      {/* モバイルメニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
      
      {/* デスクトップサイドバー */}
      <aside className="hidden md:block w-56 flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}

