import { getAllTopics } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import ArchiveItem from '@/components/ArchiveItem';
import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour for archive

export const metadata: Metadata = {
  title: 'Archive - Daily Psicho',
  description: 'Browse past psychology and philosophy topics',
};

export default async function Archive() {
  const topics = await getAllTopics();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <h1 className="font-title text-4xl md:text-5xl font-bold mb-12" data-translate>
          Archive
        </h1>

        {topics.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-foreground/70">No topics found in archive.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {topics.map((topic, index) => (
              <ArchiveItem key={topic.id} topic={topic} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

