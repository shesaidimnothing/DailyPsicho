import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { markArticleAsRead } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to mark articles as read' },
        { status: 401 }
      );
    }

    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const success = await markArticleAsRead(user.id, articleId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark article as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article marked as read',
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark article as read' },
      { status: 500 }
    );
  }
}
