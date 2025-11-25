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

    const { date } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    const success = await markArticleAsRead(user.id, date);

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

