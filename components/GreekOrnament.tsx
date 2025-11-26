'use client';

interface GreekOrnamentProps {
  type?: 'header' | 'divider' | 'footer';
}

export default function GreekOrnament({ type = 'divider' }: GreekOrnamentProps) {
  if (type === 'header') {
    return (
      <div className="text-center py-3 md:py-4">
        <div className="inline-flex items-center gap-2 md:gap-4 text-[var(--gold-accent)]">
          <span className="text-lg md:text-2xl hidden sm:inline">☽</span>
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-sm md:text-lg">✦</span>
            <span className="text-base md:text-xl">⚜</span>
            <span className="text-sm md:text-lg">✦</span>
          </div>
          <span className="text-lg md:text-2xl hidden sm:inline">☾</span>
        </div>
      </div>
    );
  }

  if (type === 'footer') {
    return (
      <div className="text-center py-6 md:py-8 mt-8 md:mt-12">
        <div className="inline-flex flex-col items-center gap-2 md:gap-3 text-[var(--gold-accent)]">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-xs md:text-sm">━━━</span>
            <span className="text-lg md:text-xl">⚱</span>
            <span className="text-xs md:text-sm">━━━</span>
          </div>
          <p className="text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase text-[var(--text-muted)] font-heading">
            Γνῶθι σεαυτόν
          </p>
          <p className="text-[9px] md:text-[10px] tracking-wider text-[var(--text-muted)]">
            Know Thyself
          </p>
        </div>
      </div>
    );
  }

  // Default divider
  return (
    <div className="flex items-center justify-center gap-3 md:gap-4 my-6 md:my-8 text-[var(--gold-accent)]">
      <span className="h-px w-10 md:w-16 bg-gradient-to-r from-transparent to-[var(--gold-accent)]" />
      <span className="text-base md:text-lg">❧</span>
      <span className="h-px w-10 md:w-16 bg-gradient-to-l from-transparent to-[var(--gold-accent)]" />
    </div>
  );
}
