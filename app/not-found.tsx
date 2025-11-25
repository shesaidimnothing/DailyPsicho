import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="font-title text-5xl font-bold mb-6">404</h1>
        <p className="text-xl text-foreground/70 mb-8">
          The topic you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block border border-foreground/20 px-6 py-3 hover:bg-foreground/5 transition-colors"
        >
          Return Home
        </Link>
      </main>
    </div>
  );
}

