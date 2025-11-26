import Navigation from '@/components/Navigation';
import GreekOrnament from '@/components/GreekOrnament';
import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Please Wait - Daily Psicho',
  description: 'AI service is temporarily unavailable',
};

export default async function WaitPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <GreekOrnament type="header" />
        
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <span className="text-6xl mb-4 block">⏳</span>
            <h1 className="font-title text-4xl md:text-5xl font-bold mb-4">
              Please Wait
            </h1>
            <p className="text-xl text-[var(--text-muted)] mb-8">
              The AI service is temporarily unavailable
            </p>
          </div>

          <div className="bg-[var(--bg-secondary)] border-2 border-[var(--gold-accent)] p-6 md:p-8 mb-8">
            <h2 className="font-title text-2xl font-semibold mb-4">
              What&apos;s Happening?
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4 text-left">
              The Groq AI service has reached its daily token limit. This is a temporary limitation of the free tier.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4 text-left">
              <strong>The limit resets in approximately 10 minutes.</strong> Once it resets, new articles will be generated automatically.
            </p>
            <p className="text-sm text-[var(--text-muted)] text-left">
              To avoid this in the future, you can upgrade your Groq tier at{' '}
              <a 
                href="https://console.groq.com/settings/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--gold-accent)] underline hover:text-[var(--gold-dark)]"
              >
                console.groq.com
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-dark)] text-black font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Return Home
            </Link>
            <Link
              href="/archive"
              className="px-6 py-3 border-2 border-[var(--border-color)] hover:border-[var(--gold-accent)] font-semibold uppercase tracking-wider transition-colors"
            >
              Browse Archive
            </Link>
          </div>

          <p className="mt-8 text-sm text-[var(--text-muted)]">
            We&apos;re preserving your current articles and won&apos;t replace them until the AI service is available again.
          </p>
        </div>

        <GreekOrnament type="footer" />
      </main>
    </div>
  );
}

