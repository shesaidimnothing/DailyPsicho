import { NextResponse } from 'next/server';
import { getArticleDate } from '@/lib/date-utils';
import { getTodaysScienceDailyTopic } from '@/lib/sciencedaily';
import { getArticleByDate, saveArticle } from '@/lib/database';

/**
 * Test endpoint to generate a new article for today's date
 * This will generate even if an article already exists (for testing)
 * The new article will be saved with a test suffix
 */
export async function POST(request: Request) {
  try {
    const date = getArticleDate();
    console.log(`[TEST GENERATE] Generating test article for date: ${date}`);
    
    // Check if article exists
    const existing = await getArticleByDate(date);
    if (existing) {
      console.log(`[TEST GENERATE] Article exists, but generating new one for testing...`);
    }
    
    // Generate new article (force generation even if one exists)
    // This will generate but NOT save (to avoid replacing existing article)
    const newArticle = await getTodaysScienceDailyTopic(date, true);
    
    if (!newArticle) {
      return NextResponse.json(
        { error: 'Failed to generate article' },
        { status: 500 }
      );
    }
    
    // Don't save - just return the generated article for testing
    // The existing article in the database remains untouched
    
    return NextResponse.json({
      success: true,
      message: 'Test article generated successfully (not saved to preserve existing article)',
      generatedArticle: {
        date: newArticle.date,
        title: newArticle.title,
        contentLength: newArticle.content.length,
        readingTime: newArticle.readingTime,
        isFallbackContent: newArticle.isFallbackContent,
        generationError: newArticle.generationError,
        keyInsights: newArticle.keyInsights?.length || 0,
        keyConcepts: newArticle.keyConcepts?.length || 0,
        dailyPractice: newArticle.dailyPractice?.length || 0,
      },
      existingArticle: existing ? {
        date: existing.date,
        title: existing.title,
        preserved: true,
      } : null,
    });
  } catch (error: any) {
    console.error('[TEST GENERATE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate test article' },
      { status: 500 }
    );
  }
}

