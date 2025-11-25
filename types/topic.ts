// Type definitions for daily psychology/philosophy topics

export interface ExternalLink {
  title: string;
  url: string;
  description?: string;
}

export interface VideoEmbed {
  title: string;
  url: string; // YouTube, Vimeo, or other video URL
  platform: 'youtube' | 'vimeo' | 'other';
  description?: string;
}

export interface KeyConcept {
  term: string;
  detail: string;
}

export interface DailyTopic {
  id: string;
  title: string;
  content: string; // Main article content (10-20 min read)
  date: string; // ISO date string (YYYY-MM-DD)
  category: 'psychology' | 'philosophy' | 'both';
  videos?: VideoEmbed[];
  links?: ExternalLink[];
  keyInsights?: string[];
  keyConcepts?: KeyConcept[];
  dailyPractice?: string[];
  readingTime: number; // Estimated reading time in minutes
  createdAt?: string;
  updatedAt?: string;
}

