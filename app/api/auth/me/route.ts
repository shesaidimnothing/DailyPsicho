import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserReadArticles, getAllRewrittenDates } from '@/lib/database';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Get user's read articles and all rewritten dates
    const readArticles = await getUserReadArticles(user.id);
    const rewrittenDates = await getAllRewrittenDates();

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      readArticles,
      rewrittenDates,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ user: null });
  }
}

