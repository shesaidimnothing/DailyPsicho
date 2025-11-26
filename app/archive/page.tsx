import { getAllTopics } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import ArchiveItem from '@/components/ArchiveItem';
import GreekOrnament from '@/components/GreekOrnament';
import { Metadata } from 'next';

// Disable caching for archive too
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Archive - Daily Psicho',
  description: 'Browse past psychology and philosophy topics',
};

export default async function Archive() {
  const topics = await getAllTopics();

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <GreekOrnament type="header" />
        
        <h1 className="font-title text-4xl md:text-5xl font-bold mb-4 text-center" data-translate>
          Archive
        </h1>
        <p className="text-center text-[var(--text-muted)] mb-12 font-heading text-sm tracking-widest uppercase">
          Scrolls of Wisdom Past
        </p>

        {topics.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--text-muted)]">No topics found in archive.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {topics.map((topic, index) => (
              <ArchiveItem key={topic.id} topic={topic} index={index} />
            ))}
          </div>
        )}
        
        <GreekOrnament type="footer" />
      </main>
    </div>
  );
}
