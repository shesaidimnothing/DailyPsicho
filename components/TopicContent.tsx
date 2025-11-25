'use client';

import { motion } from 'framer-motion';
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
    return <hr className="my-8 border-foreground/20" />;
  }

  // Check if this is a section header (starts with **)
  const headerMatch = text.match(/^\*\*(.+?)\*\*$/);
  if (headerMatch) {
    return (
      <h2 className="font-title text-2xl font-semibold mt-10 mb-4">
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

      {/* Title with badges */}
      <div className="flex flex-wrap items-start gap-4 mb-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-title text-4xl md:text-5xl font-bold leading-tight flex-1"
          data-translate
        >
          {topic.title}
        </motion.h1>
        <ArticleBadges date={topic.date} showLabels />
      </div>

      {/* Meta information */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap items-center gap-4 mb-8 text-sm text-foreground/60 uppercase tracking-wider"
      >
        <span>{new Date(topic.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
        <span className="greek-border w-12 h-0"></span>
        <span>{topic.readingTime} min read</span>
        <span className="greek-border w-12 h-0"></span>
        <span className="capitalize">{topic.category}</span>
      </motion.div>

      {/* Key Insights */}
      {topic.keyInsights && topic.keyInsights.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-10 bg-foreground/5 border border-foreground/10 p-6"
        >
          <h2 className="font-title text-2xl font-semibold mb-4">Today&apos;s Takeaways</h2>
          <ul className="space-y-3 list-disc pl-5">
            {topic.keyInsights.map((insight, index) => (
              <li key={index} className="text-lg leading-relaxed">
                {insight}
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* Key Concepts */}
      {topic.keyConcepts && topic.keyConcepts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="font-title text-2xl font-semibold mb-4">Key Concepts</h2>
          <div className="grid gap-4">
            {topic.keyConcepts.map((concept, index) => (
              <div
                key={index}
                className="border border-foreground/10 p-4 bg-background/80 shadow-sm"
              >
                <p className="font-semibold uppercase tracking-wide text-sm text-foreground/70 mb-1">
                  {concept.term}
                </p>
                <p className="text-lg leading-relaxed">{concept.detail}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Content paragraphs with fade-in animation */}
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, index) => {
          const isHr = paragraph.trim() === '---';
          const isHeader = /^\*\*.+\*\*$/.test(paragraph.trim());

          if (isHr) {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              >
                <hr className="my-8 border-foreground/20" />
              </motion.div>
            );
          }

          if (isHeader) {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
              >
                {renderParagraph(paragraph)}
              </motion.div>
            );
          }

          return (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
              className="mb-6 text-lg leading-relaxed"
              data-translate
            >
              {renderParagraph(paragraph)}
            </motion.p>
          );
        })}
      </div>

      {/* Daily Practice */}
      {topic.dailyPractice && topic.dailyPractice.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-foreground/5 border border-foreground/10 p-6"
        >
          <h2 className="font-title text-2xl font-semibold mb-4">Try This Today</h2>
          <ul className="list-disc pl-5 space-y-3">
            {topic.dailyPractice.map((item, index) => (
              <li key={index} className="text-lg leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* Videos */}
      {topic.videos && topic.videos.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="font-title text-2xl font-semibold mb-6" data-translate>Related Videos</h2>
          {topic.videos.map((video, index) => (
            <VideoEmbed key={index} video={video} index={index} />
          ))}
        </motion.section>
      )}

      {/* External Links */}
      {topic.links && topic.links.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <h2 className="font-title text-2xl font-semibold mb-6" data-translate>Further Reading</h2>
          {topic.links.map((link, index) => (
            <ExternalLink key={index} link={link} index={index} />
          ))}
        </motion.section>
      )}

      {/* Article Actions (Mark as Read, Rewrite) */}
      <ArticleActions date={topic.date} />
    </article>
  );
}
