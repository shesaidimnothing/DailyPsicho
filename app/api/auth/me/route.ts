import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserReadArticles, getAllRewrittenIds } from '@/lib/database';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Get user's read article IDs and all rewritten article IDs
    const readArticles = await getUserReadArticles(user.id);
    const rewrittenIds = await getAllRewrittenIds();

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      readArticles,      // Array of article IDs the user has read
      rewrittenIds,      // Array of article IDs that have been rewritten
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ user: null });
  }
}
