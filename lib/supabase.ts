// Supabase client configuration
// To use this, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file

import { createClient } from '@supabase/supabase-js';
import type { DailyTopic } from '@/types/topic';
import { getTodaysScienceDailyTopic, getScienceDailyArchive } from './sciencedaily';
import { getArticleDate } from './date-utils';
import { getAllArticles, getLatestArticle, getArticleByDate } from './database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using ScienceDaily content.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch content from ScienceDaily for a given date.
 * This is the primary content source now (no Wikipedia).
 */
async function getContentForDate(date: string): Promise<DailyTopic | null> {
  try {
    // Get content directly from ScienceDaily
    const topic = await getTodaysScienceDailyTopic(date);
    
    if (topic) {
      return topic;
    }
    
    // Fallback to mock data if ScienceDaily fails
    console.warn('ScienceDaily unavailable, using fallback content');
    return getFallbackTopic(date);
  } catch (error) {
    console.error('Error fetching content:', error);
    return getFallbackTopic(date);
  }
}

// Fetch the latest daily topic (based on 6 PM reset time)
// This returns the most recently created article
export async function getLatestTopic(): Promise<DailyTopic | null> {
  const articleDate = getArticleDate();
  console.log(`[getLatestTopic] Current article date: ${articleDate}`);
  
  // Use getTodaysScienceDailyTopic which handles:
  // 1. Checking if a new article should be generated (after reset time)
  // 2. Returning existing article if no new one needed
  // 3. Generating new article with Groq if needed
  console.log('[getLatestTopic] Checking for article...');
  const topic = await getTodaysScienceDailyTopic(articleDate);
  
  if (topic) {
    console.log(`[getLatestTopic] Returning article: "${topic.title}"`);
    return topic;
  }
  
  // Fallback to latest from database
  const latestFromDb = await getLatestArticle();
  if (latestFromDb) {
    console.log(`[getLatestTopic] Using latest from DB: "${latestFromDb.title}"`);
    return latestFromDb;
  }
  
  // Final fallback
  console.log('[getLatestTopic] No article found, returning fallback');
  return getFallbackTopic(articleDate);
}

// Fetch topic by date (returns the most recent article for that date)
export async function getTopicByDate(date: string): Promise<DailyTopic | null> {
  try {
    // Try PostgreSQL database first
    const dbArticle = await getArticleByDate(date);
    if (dbArticle) {
      console.log(`[getTopicByDate] Found article in DB for ${date}: "${dbArticle.title}"`);
      return dbArticle;
    }

    // Fallback to generating from ScienceDaily
    return await getContentForDate(date);
  } catch (error) {
    console.error('Error fetching topic by date:', error);
    return await getContentForDate(date);
  }
}

// Fetch all topics for archive
export async function getAllTopics(): Promise<DailyTopic[]> {
  try {
    // First try to get from PostgreSQL database
    const dbArticles = await getAllArticles(30);
    if (dbArticles.length > 0) {
      console.log(`[getAllTopics] Returning ${dbArticles.length} articles from database`);
      return dbArticles;
    }

    // Fallback: use ScienceDaily archive
    console.log('[getAllTopics] No database articles found, using ScienceDaily archive...');
    return await getScienceDailyArchive(7);
  } catch (error) {
    console.error('[getAllTopics] Error fetching topics:', error);
    // Final fallback: use ScienceDaily archive
    return await getScienceDailyArchive(7);
  }
}

// Transform Supabase data to our DailyTopic format
function transformSupabaseData(data: any): DailyTopic {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    date: data.date,
    category: data.category || 'psychology',
    videos: data.videos || [],
    links: data.links || [],
    readingTime: data.reading_time || data.readingTime || 2,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Fallback topic when ScienceDaily is unavailable
function getFallbackTopic(date: string): DailyTopic {
  return {
    id: `fallback-${date}`,
    title: 'Understanding the Psychology of Daily Habits',
    date: date,
    category: 'psychology',
    readingTime: 2,
    content: `Our daily habits shape who we are more than we often realize. Research in behavioral psychology shows that approximately 40% of our daily actions are habitual rather than conscious decisions.

Understanding how habits form and how they can be changed is crucial for personal development. The habit loop—cue, routine, reward—provides a framework for both building new habits and breaking old ones.

---

Content temporarily unavailable from ScienceDaily. Please check back later for the latest psychology research news.`,
    links: [
      {
        title: 'ScienceDaily Psychology News',
        url: 'https://www.sciencedaily.com/news/mind_brain/psychology/',
        description: 'Browse the latest psychology research news',
      },
    ],
  };
}
