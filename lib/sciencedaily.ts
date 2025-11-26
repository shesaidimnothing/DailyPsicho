// ScienceDaily integration for psychology news
// Fetches RSS headlines, uses Groq AI to generate articles,
// and stores them in PostgreSQL database.

import type { DailyTopic, ExternalLink, KeyConcept } from '@/types/topic';
import { generatePsychologyArticle } from './groq';
import { isGroqAvailable } from './groq-check';
import { RESET_HOUR, RESET_MINUTE, isPastResetTime, isBeforeResetTime } from './reset-config';
import { 
  initDatabase, 
  saveArticle, 
  getLatestArticle,
  getAllArticles,
  getArticleByDate,
} from './database';

export interface ScienceDailyArticle {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
}

const PSYCHOLOGY_RSS_URL =
  process.env.SCIENCEDAILY_PSYCHOLOGY_RSS ||
  'https://www.sciencedaily.com/rss/mind_brain/psychology.xml';

// Initialize database on module load
initDatabase().catch(console.error);

// In-memory state to prevent duplicate generations
let isGenerating = false;
let lastGenerationTime: number | null = null;

// Minimum time between generations (5 minutes)
const MIN_GENERATION_INTERVAL = 5 * 60 * 1000;

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

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.max(2, Math.ceil(wordCount / wordsPerMinute));
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

Stay curious about how your mind works. Practice evidence-based strategies for mental health, such as regular exercise, adequate sleep, and maintaining social connections.

Be open to updating your understanding as new research emerges. Seek professional help when needed—it's a sign of strength, not weakness.

**Looking Forward**

Psychology and neuroscience are rapidly evolving fields. What we understand today may be refined or expanded by tomorrow's discoveries. This is the nature of science—a continuous journey toward better understanding.

We encourage you to explore the original research linked below for the complete findings, methodology, and expert commentary.

---

*This summary is based on research reported on ScienceDaily. For complete details and sources, see the original article linked below.*`;

  const keyInsights = [
    description.split('.')[0] + '.',
    'Understanding brain and behavior research helps us make informed decisions about mental health.',
    'Scientific discoveries often have practical applications we can use in daily life.',
    'For complete research details and methodology, see the original source.',
  ];

  const keyConcepts: KeyConcept[] = [
    {
      term: 'Psychological Research',
      detail: 'Scientific studies that investigate mental processes, behavior, and their underlying mechanisms.',
    },
    {
      term: 'Evidence-Based Practice',
      detail: 'Approaches and interventions that are supported by scientific research and data.',
    },
    {
      term: 'Neuroplasticity',
      detail: 'The brain\'s ability to change and adapt throughout life by forming new neural connections.',
    },
  ];

  const dailyPractice = [
    'Take a few minutes to reflect on how today\'s topic relates to your own experiences.',
    'Consider one thing you learned that you could share with someone else.',
    'Think about whether this knowledge might change any of your daily habits or perspectives.',
    'Write down one question this article raised for you.',
  ];

  return { content, keyInsights, keyConcepts, dailyPractice };
}

/**
 * Check if we should generate a NEW article.
 * Generate if:
 * - We are past reset time today AND
 * - No article was created after reset time today AND
 * - We haven't generated recently (prevents duplicates from page refreshes)
 */
async function shouldGenerateNewArticle(): Promise<boolean> {
  // Check in-memory lock
  if (isGenerating) {
    console.log('[shouldGenerate] Already generating - skip');
    return false;
  }

  // Check if we generated recently (prevents duplicates)
  if (lastGenerationTime && (Date.now() - lastGenerationTime) < MIN_GENERATION_INTERVAL) {
    console.log('[shouldGenerate] Generated recently - skip');
    return false;
  }

  // Only generate if we're past reset time
  if (!isPastResetTime()) {
    console.log('[shouldGenerate] Not past reset time yet');
    return false;
  }

  try {
    // Check if any article was created after reset time TODAY
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Get the most recent article
    const result = await pool.query(
      'SELECT created_at FROM daily_articles ORDER BY created_at DESC LIMIT 1'
    );
    await pool.end();

    if (result.rows.length === 0) {
      console.log('[shouldGenerate] No articles exist - will generate');
      return true;
    }

    const createdAt = new Date(result.rows[0].created_at);
    const now = new Date();
    
    // Check if the most recent article was created today
    const isCreatedToday = createdAt.toDateString() === now.toDateString();
    
    if (!isCreatedToday) {
      console.log('[shouldGenerate] No article created today - will generate');
      return true;
    }

    // Check if it was created after reset time today
    const createdHour = createdAt.getHours();
    const createdMinute = createdAt.getMinutes();
    const wasCreatedAfterReset = !isBeforeResetTime(createdHour, createdMinute);
    
    if (wasCreatedAfterReset) {
      // Update lastGenerationTime so we don't keep checking
      lastGenerationTime = createdAt.getTime();
      console.log(`[shouldGenerate] Article exists for this period (${createdHour}:${String(createdMinute).padStart(2, '0')}) - NOT generating`);
      return false;
    }

    console.log(`[shouldGenerate] Article from before reset - will generate new one`);
    return true;
  } catch (error) {
    console.error('[shouldGenerate] Error:', error);
    return false;
  }
}

/**
 * Create a DailyTopic from a ScienceDaily article.
 */
async function createTopicFromScienceDaily(
  article: ScienceDailyArticle,
  date: string
): Promise<DailyTopic> {
  const cleanDescription = cleanHtml(article.description);
  const hasGroqKey = !!process.env.GROQ_API_KEY;

  let content: string;
  let keyInsights: string[];
  let keyConcepts: KeyConcept[];
  let dailyPractice: string[];
  let isFallbackContent = false;
  let generationError: string | undefined = undefined;

  if (hasGroqKey) {
    console.log('[createTopic] Generating with Groq AI for:', article.title);
    
    const generated = await generatePsychologyArticle(
      article.title,
      cleanDescription,
      article.link
    );

    if (generated.success && generated.content) {
      content = generated.content;
      keyInsights = generated.keyInsights || [];
      keyConcepts = generated.keyConcepts || [];
      dailyPractice = generated.dailyPractice || [];
      isFallbackContent = false;
      console.log('[createTopic] Groq generation successful');
    } else {
      console.warn('[createTopic] Groq failed:', generated.error);
      isFallbackContent = true;
      generationError = generated.error;
      const fallback = generateFallbackContent(article.title, cleanDescription, article.pubDate);
      content = fallback.content;
      keyInsights = fallback.keyInsights;
      keyConcepts = fallback.keyConcepts;
      dailyPractice = fallback.dailyPractice;
    }
  } else {
    console.log('[createTopic] No GROQ_API_KEY, using fallback');
    isFallbackContent = true;
    generationError = 'Groq API key not configured';
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

  const topic: DailyTopic = {
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
    isFallbackContent,
    generationError,
  };

  // Save to database
  const saved = await saveArticle(topic);
  if (saved) {
    // Mark generation time to prevent duplicates
    lastGenerationTime = Date.now();
    console.log(`[createTopic] Saved article for ${date}`);
  }

  return topic;
}

/**
 * Get the topic for a specific date.
 * - Returns most recent article normally
 * - Generates a new one only after reset time if none exists for this period
 */
export async function getTodaysScienceDailyTopic(date: string, forceGenerate: boolean = false): Promise<DailyTopic | null> {
  try {
    // Get the most recent article
    const latestArticle = await getLatestArticle();
    
    // Check if we should generate a new article
    const shouldGenerate = forceGenerate || await shouldGenerateNewArticle();
    
    if (!shouldGenerate) {
      if (latestArticle) {
        console.log(`[getTopic] Returning latest article: "${latestArticle.title}"`);
        return latestArticle;
      }
      // No articles at all - fall through to generate
    }
    
    // Need to generate - check lock
    if (isGenerating) {
      console.log('[getTopic] Generation in progress, returning latest');
      return latestArticle;
    }
    
    isGenerating = true;
    
    try {
      console.log(`[getTopic] Generating NEW article for ${date}...`);
      
      // Check Groq availability
      const groqAvailable = await isGroqAvailable();
      
      if (!groqAvailable) {
        console.log('[getTopic] Groq unavailable');
        if (latestArticle) {
          return latestArticle;
        }
        return null; // Will redirect to wait page
      }

      // Fetch from ScienceDaily
      const articles = await fetchPsychologyArticles();
      if (!articles.length) {
        console.error('[getTopic] No ScienceDaily articles found');
        return latestArticle;
      }

      // Pick a fresh article - use current time for variety
      const now = new Date();
      const seed = now.getHours() * 60 + now.getMinutes(); // Changes each minute
      const index = Math.abs(seed) % Math.min(articles.length, 10);

      console.log(`[getTopic] Selected article ${index}: "${articles[index].title}"`);

      // Create and save the new article (adds to DB, doesn't replace)
      return await createTopicFromScienceDaily(articles[index], date);
    } finally {
      isGenerating = false;
    }
  } catch (error) {
    console.error('[getTopic] Error:', error);
    isGenerating = false;
    return null;
  }
}

/**
 * Get archive of all topics from database.
 */
export async function getScienceDailyArchive(days: number = 30): Promise<DailyTopic[]> {
  try {
    const dbArticles = await getAllArticles(days);
    if (dbArticles.length > 0) {
      console.log(`[getArchive] Returning ${dbArticles.length} articles from database`);
      return dbArticles;
    }

    // Fallback: generate placeholders from RSS
    const articles = await fetchPsychologyArticles();
    if (!articles.length) return [];

    const topics: DailyTopic[] = [];
    const today = new Date();
    
    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const seed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
      const index = Math.abs(seed) % articles.length;

      const article = articles[index];
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
        links: [{
          title: 'Read Original Research on ScienceDaily',
          url: article.link,
          description: 'Full article with complete research details',
        }],
        keyInsights: fallback.keyInsights,
        keyConcepts: fallback.keyConcepts,
        dailyPractice: fallback.dailyPractice,
        readingTime: estimateReadingTime(fallback.content),
      });
    }

    return topics;
  } catch (error) {
    console.error('[getArchive] Error:', error);
    return [];
  }
}
