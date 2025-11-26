'use client';

import VideoEmbed from './VideoEmbed';
import ExternalLink from './ExternalLink';
import CountdownTimer from './CountdownTimer';
import ArticleActions from './ArticleActions';
import ArticleBadges from './ArticleBadges';
import type { DailyTopic } from '@/types/topic';

interface TopicContentProps {
  topic: DailyTopic;
  showCountdown?: boolean;
}

/**
 * Render a paragraph with basic markdown-style formatting
 * Supports: **bold**, *italic*, ---
 */
function renderParagraph(text: string): React.ReactNode {
  // Check if this is a horizontal rule
  if (text.trim() === '---') {
    return <hr className="my-8 border-[var(--border-color)]" />;
  }

  // Check if this is a section header (starts with **)
  const headerMatch = text.match(/^\*\*(.+?)\*\*$/);
  if (headerMatch) {
    return (
      <h2 className="font-title text-xl md:text-2xl font-semibold mt-8 md:mt-10 mb-4">
        {headerMatch[1]}
      </h2>
    );
  }

  // Process inline formatting
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Look for **bold** or *italic*
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);

    let firstMatch: { index: number; length: number; content: string; type: 'bold' | 'italic' } | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatch = {
        index: boldMatch.index,
        length: boldMatch[0].length,
        content: boldMatch[1],
        type: 'bold',
      };
    }

    if (italicMatch && italicMatch.index !== undefined) {
      if (!firstMatch || italicMatch.index < firstMatch.index) {
        firstMatch = {
          index: italicMatch.index,
          length: italicMatch[0].length,
          content: italicMatch[1],
          type: 'italic',
        };
      }
    }

    if (firstMatch) {
      // Add text before the match
      if (firstMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, firstMatch.index)}</span>);
      }

      // Add the formatted text
      if (firstMatch.type === 'bold') {
        parts.push(<strong key={key++} className="font-semibold">{firstMatch.content}</strong>);
      } else {
        parts.push(<em key={key++} className="italic">{firstMatch.content}</em>);
      }

      remaining = remaining.slice(firstMatch.index + firstMatch.length);
    } else {
      // No more matches, add remaining text
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return <>{parts}</>;
}

export default function TopicContent({ topic, showCountdown = false }: TopicContentProps) {
  // Split content into paragraphs for animation
  const paragraphs = topic.content.split('\n\n').filter(p => p.trim());

  return (
    <article className="max-w-3xl mx-auto">
      {/* Countdown Timer - only show on today's article */}
      {showCountdown && <CountdownTimer />}

      {/* Warning banner for fallback content */}
      {topic.isFallbackContent && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                Using Fallback Content
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                {topic.generationError || 'AI generation is temporarily unavailable.'}
              </p>
              {topic.generationError?.includes('Rate limit') && (
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  The Groq API daily token limit has been reached. The limit resets in about 8 minutes, or you can upgrade your Groq tier at{' '}
                  <a 
                    href="https://console.groq.com/settings/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-900 dark:hover:text-yellow-200"
                  >
                    console.groq.com
                  </a>
                  . This article uses simplified fallback content instead of AI-generated content.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Title with badges */}
      <div className="flex flex-wrap items-start gap-3 md:gap-4 mb-4 md:mb-6">
        <h1
          className="font-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight flex-1"
          data-translate
        >
          {topic.title}
        </h1>
        <ArticleBadges articleId={topic.id} showLabels />
      </div>

      {/* Meta information */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-6 md:mb-8 text-xs md:text-sm text-[var(--text-muted)] uppercase tracking-wider">
        <span>{new Date(topic.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
        <span className="text-[var(--gold-accent)]">•</span>
        <span>{topic.readingTime} min read</span>
        <span className="text-[var(--gold-accent)]">•</span>
        <span className="capitalize">{topic.category}</span>
      </div>

      {/* Key Insights */}
      {topic.keyInsights && topic.keyInsights.length > 0 && (
        <section className="mb-8 md:mb-10 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 md:p-6">
          <h2 className="font-title text-lg md:text-2xl font-semibold mb-3 md:mb-4">Today&apos;s Takeaways</h2>
          <ul className="space-y-2 md:space-y-3 list-disc pl-4 md:pl-5">
            {topic.keyInsights.map((insight, index) => (
              <li key={index} className="text-base md:text-lg leading-relaxed">
                {insight}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Key Concepts */}
      {topic.keyConcepts && topic.keyConcepts.length > 0 && (
        <section className="mb-8 md:mb-10">
          <h2 className="font-title text-lg md:text-2xl font-semibold mb-3 md:mb-4">Key Concepts</h2>
          <div className="grid gap-3 md:gap-4">
            {topic.keyConcepts.map((concept, index) => (
              <div
                key={index}
                className="border border-[var(--border-color)] p-3 md:p-4 bg-[var(--bg-secondary)]"
              >
                <p className="font-semibold uppercase tracking-wide text-xs md:text-sm text-[var(--text-muted)] mb-1">
                  {concept.term}
                </p>
                <p className="text-base md:text-lg leading-relaxed">{concept.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content paragraphs */}
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, index) => {
          const isHr = paragraph.trim() === '---';
          const isHeader = /^\*\*.+\*\*$/.test(paragraph.trim());

          if (isHr) {
            return <hr key={index} className="my-6 md:my-8 border-[var(--border-color)]" />;
          }

          if (isHeader) {
            return <div key={index}>{renderParagraph(paragraph)}</div>;
          }

          return (
            <p
              key={index}
              className="mb-4 md:mb-6 text-base md:text-lg leading-relaxed"
              data-translate
            >
              {renderParagraph(paragraph)}
            </p>
          );
        })}
      </div>

      {/* Daily Practice */}
      {topic.dailyPractice && topic.dailyPractice.length > 0 && (
        <section className="mt-10 md:mt-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 md:p-6">
          <h2 className="font-title text-lg md:text-2xl font-semibold mb-3 md:mb-4">Try This Today</h2>
          <ul className="list-disc pl-4 md:pl-5 space-y-2 md:space-y-3">
            {topic.dailyPractice.map((item, index) => (
              <li key={index} className="text-base md:text-lg leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Videos */}
      {topic.videos && topic.videos.length > 0 && (
        <section className="mt-10 md:mt-12">
          <h2 className="font-title text-lg md:text-2xl font-semibold mb-4 md:mb-6" data-translate>Related Videos</h2>
          {topic.videos.map((video, index) => (
            <VideoEmbed key={index} video={video} index={index} />
          ))}
        </section>
      )}

      {/* External Links */}
      {topic.links && topic.links.length > 0 && (
        <section className="mt-10 md:mt-12">
          <h2 className="font-title text-lg md:text-2xl font-semibold mb-4 md:mb-6" data-translate>Further Reading</h2>
          {topic.links.map((link, index) => (
            <ExternalLink key={index} link={link} index={index} />
          ))}
        </section>
      )}

      {/* Article Actions (Mark as Read, Rewrite) */}
      <ArticleActions articleId={topic.id} date={topic.date} />
    </article>
  );
}
