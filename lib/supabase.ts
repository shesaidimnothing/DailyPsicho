// Supabase client configuration
// To use this, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file
// 
// Example Supabase setup:
// 1. Create a project at https://supabase.com
// 2. Create a table called 'daily_topics' with columns:
//    - id (uuid, primary key)
//    - title (text)
//    - content (text)
//    - date (date, unique)
//    - category (text)
//    - videos (jsonb, nullable)
//    - links (jsonb, nullable)
//    - reading_time (integer)
//    - created_at (timestamp)
//    - updated_at (timestamp)
// 3. Add your API keys to .env.local

import { createClient } from '@supabase/supabase-js';
import type { DailyTopic } from '@/types/topic';
import { getTodaysScienceDailyTopic, getScienceDailyArchive } from './sciencedaily';

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

// Fetch the latest daily topic
export async function getLatestTopic(): Promise<DailyTopic | null> {
  const today = new Date().toISOString().split('T')[0];
  
  if (!supabase) {
    // If Supabase is not configured, fetch from ScienceDaily
    console.log('Fetching content from ScienceDaily...');
    return await getContentForDate(today);
  }

  try {
    // First, check if we have a topic for today in the database
    const { data: todayData, error: todayError } = await supabase
      .from('daily_topics')
      .select('*')
      .eq('date', today)
      .single();

    if (!todayError && todayData) {
      return transformSupabaseData(todayData);
    }

    // If no topic for today, get the latest available
    const { data, error } = await supabase
      .from('daily_topics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // No topics in database, fetch from ScienceDaily
      console.log('No topics in database. Fetching from ScienceDaily...');
      return await getContentForDate(today);
    }

    return transformSupabaseData(data);
  } catch (error) {
    console.error('Error fetching latest topic:', error);
    return await getContentForDate(today);
  }
}

// Fetch topic by date
export async function getTopicByDate(date: string): Promise<DailyTopic | null> {
  if (!supabase) {
    return await getContentForDate(date);
  }

  try {
    const { data, error } = await supabase
      .from('daily_topics')
      .select('*')
      .eq('date', date)
      .single();

    if (error || !data) {
      return await getContentForDate(date);
    }

    return transformSupabaseData(data);
  } catch (error) {
    console.error('Error fetching topic by date:', error);
    return await getContentForDate(date);
  }
}

// Fetch all topics for archive
export async function getAllTopics(): Promise<DailyTopic[]> {
  if (!supabase) {
    // Get last 7 days from ScienceDaily
    console.log('Fetching archive from ScienceDaily...');
    return await getScienceDailyArchive(7);
  }

  try {
    const { data, error } = await supabase
      .from('daily_topics')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data || data.length === 0) {
      console.error('Error fetching from database, using ScienceDaily:', error);
      return await getScienceDailyArchive(7);
    }

    return data.map(transformSupabaseData);
  } catch (error) {
    console.error('Error fetching all topics:', error);
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
