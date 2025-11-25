// API route to generate and store daily topics from ScienceDaily
// This can be called by a cron job or scheduled function
// Example: Call this endpoint daily to generate new content

import { NextResponse } from 'next/server';
import { getTodaysScienceDailyTopic } from '@/lib/sciencedaily';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if topic already exists for today
    if (supabase) {
      const { data: existing } = await supabase
        .from('daily_topics')
        .select('id')
        .eq('date', today)
        .single();

      if (existing) {
        return NextResponse.json({
          message: 'Topic already exists for today',
          date: today,
        });
      }
    }

    // Generate new topic from ScienceDaily
    const topic = await getTodaysScienceDailyTopic(today);

    if (!topic) {
      return NextResponse.json(
        { error: 'Failed to fetch topic from ScienceDaily' },
        { status: 500 }
      );
    }

    // Store in database if Supabase is configured
    if (supabase) {
      const { error } = await supabase.from('daily_topics').insert({
        title: topic.title,
        content: topic.content,
        date: today,
        category: topic.category,
        videos: topic.videos || null,
        links: topic.links || null,
        reading_time: topic.readingTime,
      });

      if (error) {
        console.error('Error storing topic:', error);
        return NextResponse.json(
          { error: 'Failed to store topic', topic },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: 'Daily topic generated from ScienceDaily',
      topic,
      date: today,
    });
  } catch (error) {
    console.error('Error generating daily topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow POST as well for webhook calls
export const POST = GET;
