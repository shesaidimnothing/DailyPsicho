import { getTopicByDate } from '@/lib/supabase';
import TopicContent from '@/components/TopicContent';
import Navigation from '@/components/Navigation';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Revalidate every hour

interface TopicPageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { date } = await params;
  const topic = await getTopicByDate(date);

  if (!topic) {
    return {
      title: 'Topic Not Found - Daily Psicho',
    };
  }

  return {
    title: `${topic.title} - Daily Psicho`,
    description: topic.content.substring(0, 160),
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { date } = await params;
  const topic = await getTopicByDate(date);

  if (!topic) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <TopicContent topic={topic} />
      </main>
    </div>
  );
}

