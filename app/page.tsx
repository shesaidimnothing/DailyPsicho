import { getLatestTopic } from '@/lib/supabase';
import TopicContent from '@/components/TopicContent';
import Navigation from '@/components/Navigation';
import GreekOrnament from '@/components/GreekOrnament';
import { Metadata } from 'next';

// Configure ISR (Incremental Static Regeneration) for daily updates
// This will regenerate the page at most once per day (86400 seconds)
export const revalidate = 86400; // 24 hours in seconds

export const metadata: Metadata = {
  title: 'Daily Psicho - Today\'s Topic',
  description: 'Daily insights into psychology and philosophy',
};

export default async function Home() {
  const topic = await getLatestTopic();

  if (!topic) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-4xl mx-auto px-6 py-16">
          <GreekOrnament type="header" />
          <div className="text-center">
            <h1 className="font-title text-3xl mb-4">No topic available</h1>
            <p className="text-[var(--text-muted)]">
              Please check your CMS configuration or try again later.
            </p>
          </div>
        </main>
      </div>
    );
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
