import { NextRequest, NextResponse } from 'next/server';
import { getPosts, getPostsCount, createPost } from '@/lib/db';
import { verifyBasicAuth, unauthorizedResponse } from '@/lib/auth';

export const runtime = 'edge';

// GET /api/posts - 記事一覧取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const tag = searchParams.get('tag') || undefined;
  const search = searchParams.get('search') || undefined;
  
  try {
    const posts = await getPosts({ limit, offset, tag, search });
    const total = await getPostsCount({ tag, search });
    
    return NextResponse.json({
      posts,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - 記事新規作成（Basic認証必須）
export async function POST(request: NextRequest) {
  // Basic認証チェック
  const authHeader = request.headers.get('authorization');
  if (!verifyBasicAuth(authHeader)) {
    return unauthorizedResponse();
  }
  
  try {
    const body = await request.json();
    const { title, content, tags } = body;
    
    // バリデーション
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    const post = await createPost({
      title,
      content,
      tags: tags || [],
    });
    
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

