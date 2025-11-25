// ScienceDaily integration for psychology news
// Source: Psychology news section on ScienceDaily
// https://www.sciencedaily.com/news/mind_brain/psychology/
//
// Fetches RSS headlines, then uses Groq AI (free) to generate
// unique educational articles every day.

import type { DailyTopic, ExternalLink, KeyConcept } from '@/types/topic';
import { generatePsychologyArticle } from './groq';

export interface ScienceDailyArticle {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
}

const PSYCHOLOGY_RSS_URL =
  process.env.SCIENCEDAILY_PSYCHOLOGY_RSS ||
  'https://www.sciencedaily.com/rss/mind_brain/psychology.xml';

/**
 * Fetch and parse the ScienceDaily psychology RSS feed.
 */
export async function fetchPsychologyArticles(): Promise<ScienceDailyArticle[]> {
  try {
    const res = await fetch(PSYCHOLOGY_RSS_URL, {
      headers: {
        'User-Agent': 'DailyPsicho/1.0 (psychology/philosophy daily site)',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error('Failed to fetch ScienceDaily RSS:', res.status);
      return [];
    }

    const xml = await res.text();
    const items: ScienceDailyArticle[] = [];

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];

      const getTag = (tag: string): string => {
        const tagRegex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const m = tagRegex.exec(itemXml);
        if (!m) return '';
        const raw = m[1].trim();
        return raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
      };

      const title = getTag('title');
      const link = getTag('link');
      const description = getTag('description');
      const pubDate = getTag('pubDate');

      if (!title || !link) continue;

      items.push({
        title,
        link,
        description: description || '',
        pubDate,
      });
    }

    return items;
  } catch (error) {
    console.error('Error fetching ScienceDaily RSS:', error);
    return [];
  }
}

/**
 * Pick a deterministic article for a given seed (date-based).
 */
export async function pickScienceDailyArticleBySeed(
  seed: number
): Promise<ScienceDailyArticle | null> {
  const articles = await fetchPsychologyArticles();
  if (!articles.length) return null;
  const index = Math.abs(seed) % articles.length;
  return articles[index];
}

function formatPubDate(pubDate?: string): string {
  if (!pubDate) return '';
  try {
    const date = new Date(pubDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return pubDate;
  }
}

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.max(2, Math.ceil(wordCount / wordsPerMinute));
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

// ============================================================================
// FALLBACK CONTENT (used when Groq API is not configured)
// ============================================================================

function generateFallbackContent(
  title: string,
  description: string,
  pubDate?: string
): {
  content: string;
  keyInsights: string[];
  keyConcepts: KeyConcept[];
  dailyPractice: string[];
} {
  const formattedDate = formatPubDate(pubDate);

  const content = `**Recent Research Highlight**

${description}

${formattedDate ? `*Published: ${formattedDate}*` : ''}

**Understanding the Context**

The human mind remains one of the most fascinating frontiers of scientific exploration. Every day, researchers around the world are uncovering new insights into how our brains work, how our thoughts and emotions are formed, and how we can better understand and support mental health.

This particular research adds another piece to the vast puzzle of psychological science. While each individual study may seem small, together they build a comprehensive picture of human cognition, behavior, and well-being.

**Why This Matters**

Research like this has implications that extend far beyond the laboratory. Understanding the mechanisms of the mind helps us develop better treatments for mental health conditions, design more effective educational approaches, and create environments that support human flourishing.

For individuals, staying informed about psychological research can provide valuable insights for personal growth and well-being. Science-based knowledge empowers us to make better decisions about our mental health and to understand ourselves and others more deeply.

**Practical Implications**

While we wait for research findings to translate into clinical applications, there are always steps we can take to support our psychological well-being:

- Stay curious about how your mind works
- Practice evidence-based strategies for mental health (like regular exercise, adequate sleep, and social connection)
- Be open to updating your understanding as new research emerges
- Seek professional help when needed—it's a sign of strength, not weakness

**Looking Forward**

Psychology and neuroscience are rapidly evolving fields. What we understand today may be refined or expanded by tomorrow's discoveries. This is the nature of science—a continuous journey toward better understanding.

We encourage you to explore the original research linked below for the complete findings, methodology, and expert commentary.

---

*This summary is based on research reported on ScienceDaily. For complete details and sources, see the original article linked below.*`;

  const keyInsights = [
    description.split('.')[0] + '.',
    'Understanding brain and behavior research helps us make informed decisions about mental health.',
    'For complete research details and methodology, see the original source.',
  ];

  const keyConcepts: KeyConcept[] = [
    {
      term: 'Psychological Research',
      detail: 'Scientific studies that investigate mental processes, behavior, and their underlying mechanisms',
    },
    {
      term: 'Evidence-Based Practice',
      detail: 'Approaches and interventions that are supported by scientific research and data',
    },
  ];

  const dailyPractice = [
    'Take a few minutes to reflect on how today\'s topic relates to your own experiences.',
    'Consider one thing you learned that you could share with someone else.',
    'Think about whether this knowledge might change any of your daily habits or perspectives.',
  ];

  return { content, keyInsights, keyConcepts, dailyPractice };
}

// ============================================================================
// MAIN TOPIC CREATION
// ============================================================================

/**
 * Create a DailyTopic from a ScienceDaily article.
 * Uses Groq AI to generate unique educational content if API key is available,
 * otherwise falls back to template-based content.
 */
export async function createTopicFromScienceDaily(
  article: ScienceDailyArticle,
  date: string
): Promise<DailyTopic> {
  const cleanDescription = cleanHtml(article.description);
  const hasGroqKey = !!process.env.GROQ_API_KEY;

  let content: string;
  let keyInsights: string[];
  let keyConcepts: KeyConcept[];
  let dailyPractice: string[];

  if (hasGroqKey) {
    // Use Groq AI to generate unique article
    console.log('Generating article with Groq AI for:', article.title);
    
    const generated = await generatePsychologyArticle(
      article.title,
      cleanDescription,
      article.link
    );

    if (generated) {
      content = generated.content;
      keyInsights = generated.keyInsights;
      keyConcepts = generated.keyConcepts;
      dailyPractice = generated.dailyPractice;
    } else {
      // Groq failed, use fallback
      console.warn('Groq generation failed, using fallback content');
      const fallback = generateFallbackContent(article.title, cleanDescription, article.pubDate);
      content = fallback.content;
      keyInsights = fallback.keyInsights;
      keyConcepts = fallback.keyConcepts;
      dailyPractice = fallback.dailyPractice;
    }
  } else {
    // No API key, use fallback
    console.log('No GROQ_API_KEY found, using fallback content');
    const fallback = generateFallbackContent(article.title, cleanDescription, article.pubDate);
    content = fallback.content;
    keyInsights = fallback.keyInsights;
    keyConcepts = fallback.keyConcepts;
    dailyPractice = fallback.dailyPractice;
  }

  const links: ExternalLink[] = [
    {
      title: 'Read Original Research on ScienceDaily',
      url: article.link,
      description: 'Full article with complete research details and sources',
    },
    {
      title: 'ScienceDaily Psychology News',
      url: 'https://www.sciencedaily.com/news/mind_brain/psychology/',
      description: 'Browse more psychology research news',
    },
  ];

  return {
    id: `sd-${date}-${article.title.slice(0, 20).replace(/\W/g, '')}`,
    title: article.title,
    content,
    date,
    category: 'psychology',
    links,
    keyInsights,
    keyConcepts,
    dailyPractice,
    readingTime: estimateReadingTime(content),
  };
}

/**
 * Get today's psychology topic.
 * Selects an article based on the date (deterministic) and generates content.
 */
export async function getTodaysScienceDailyTopic(date: string): Promise<DailyTopic | null> {
  try {
    const articles = await fetchPsychologyArticles();

    if (!articles.length) {
      console.error('No articles found in ScienceDaily RSS');
      return null;
    }

    // Use date-based seed for deterministic selection
    // This ensures the same article is selected for the same date
    const dateSeed = new Date(date).getTime();
    const seed = Math.floor(dateSeed / (1000 * 60 * 60 * 24));
    const index = Math.abs(seed) % articles.length;

    const article = articles[index];
    return await createTopicFromScienceDaily(article, date);
  } catch (error) {
    console.error('Error getting ScienceDaily topic:', error);
    return null;
  }
}

/**
 * Get archive of topics for the last N days.
 */
export async function getScienceDailyArchive(days: number = 7): Promise<DailyTopic[]> {
  try {
    const articles = await fetchPsychologyArticles();

    if (!articles.length) {
      return [];
    }

    const topics: DailyTopic[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dateSeed = date.getTime();
      const seed = Math.floor(dateSeed / (1000 * 60 * 60 * 24));
      const index = Math.abs(seed) % articles.length;

      const article = articles[index];
      
      // For archive, we use fallback to avoid many API calls
      // Only today's article gets AI-generated content
      const fallback = generateFallbackContent(
        article.title,
        cleanHtml(article.description),
        article.pubDate
      );

      topics.push({
        id: `sd-${dateStr}-${article.title.slice(0, 20).replace(/\W/g, '')}`,
        title: article.title,
        content: fallback.content,
        date: dateStr,
        category: 'psychology',
        links: [
          {
            title: 'Read Original Research on ScienceDaily',
            url: article.link,
            description: 'Full article with complete research details',
          },
        ],
        keyInsights: fallback.keyInsights,
        keyConcepts: fallback.keyConcepts,
        dailyPractice: fallback.dailyPractice,
        readingTime: estimateReadingTime(fallback.content),
      });
    }

    return topics;
  } catch (error) {
    console.error('Error getting ScienceDaily archive:', error);
    return [];
  }
}
