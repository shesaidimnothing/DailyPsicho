import { getLatestTopic } from '@/lib/supabase';
import TopicContent from '@/components/TopicContent';
import Navigation from '@/components/Navigation';
import GreekOrnament from '@/components/GreekOrnament';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

// Disable caching - always fetch fresh content
// This ensures the article updates at 6 PM
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Daily Psicho - Today\'s Topic',
  description: 'Daily insights into psychology and philosophy',
};

export default async function Home() {
  const topic = await getLatestTopic();

  // If no topic and Groq is unavailable, redirect to wait page
  if (!topic) {
    redirect('/wait');
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <GreekOrnament type="header" />
        <TopicContent topic={topic} showCountdown />
        <GreekOrnament type="footer" />
      </main>
    </div>
  );
}
