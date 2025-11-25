// PostgreSQL database integration for storing articles and user data
// Uses Neon PostgreSQL (serverless)

import { Pool } from 'pg';
import type { DailyTopic } from '@/types/topic';

// Simple hash function for testing (NOT secure for production!)
function simpleHash(password: string): string {
  return 'plain:' + password;
}

function verifyPassword(password: string, hash: string): boolean {
  if (hash.startsWith('plain:')) {
    return hash === 'plain:' + password;
  }
  // Fallback for old bcrypt hashes - they won't match with simple comparison
  return false;
}

// Create connection pool
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
    })
  : null;

/**
 * Initialize all database tables
 */
export async function initDatabase(): Promise<void> {
  if (!pool) {
    console.log('DATABASE_URL not configured, skipping database init');
    return;
  }

  try {
    // Articles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_articles (
        id SERIAL PRIMARY KEY,
        date VARCHAR(10) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'psychology',
        reading_time INTEGER DEFAULT 10,
        key_insights JSONB,
        key_concepts JSONB,
        daily_practice JSONB,
        links JSONB,
        source_url TEXT,
        rewrite_count INTEGER DEFAULT 0,
        last_rewritten_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User article interactions (read/rewrite tracking)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_article_interactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        article_date VARCHAR(10) NOT NULL,
        has_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        UNIQUE(user_id, article_date)
      )
    `);

    // Global rewrite tracking (visible to all users)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS article_rewrites (
        id SERIAL PRIMARY KEY,
        article_date VARCHAR(10) UNIQUE NOT NULL,
        rewritten_by_user_id INTEGER REFERENCES users(id),
        rewritten_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// ============================================================================
// ARTICLE FUNCTIONS
// ============================================================================

/**
 * Save a generated article to the database
 */
export async function saveArticle(topic: DailyTopic): Promise<boolean> {
  if (!pool) return false;

  try {
    await pool.query(
      `INSERT INTO daily_articles 
        (date, title, content, category, reading_time, key_insights, key_concepts, daily_practice, links, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (date) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        category = EXCLUDED.category,
        reading_time = EXCLUDED.reading_time,
        key_insights = EXCLUDED.key_insights,
        key_concepts = EXCLUDED.key_concepts,
        daily_practice = EXCLUDED.daily_practice,
        links = EXCLUDED.links,
        source_url = EXCLUDED.source_url`,
      [
        topic.date,
        topic.title,
        topic.content,
        topic.category,
        topic.readingTime,
        JSON.stringify(topic.keyInsights || []),
        JSON.stringify(topic.keyConcepts || []),
        JSON.stringify(topic.dailyPractice || []),
        JSON.stringify(topic.links || []),
        topic.links?.[0]?.url || null,
      ]
    );
    console.log(`Article saved to database for date: ${topic.date}`);
    return true;
  } catch (error) {
    console.error('Error saving article:', error);
    return false;
  }
}

/**
 * Update an existing article (for rewrites)
 */
export async function updateArticle(topic: DailyTopic, userId?: number): Promise<boolean> {
  if (!pool) return false;

  try {
    await pool.query(
      `UPDATE daily_articles SET
        content = $2,
        reading_time = $3,
        key_insights = $4,
        key_concepts = $5,
        daily_practice = $6,
        rewrite_count = COALESCE(rewrite_count, 0) + 1,
        last_rewritten_at = CURRENT_TIMESTAMP
       WHERE date = $1`,
      [
        topic.date,
        topic.content,
        topic.readingTime,
        JSON.stringify(topic.keyInsights || []),
        JSON.stringify(topic.keyConcepts || []),
        JSON.stringify(topic.dailyPractice || []),
      ]
    );

    // Track who rewrote it
    if (userId) {
      await pool.query(
        `INSERT INTO article_rewrites (article_date, rewritten_by_user_id)
         VALUES ($1, $2)
         ON CONFLICT (article_date) DO UPDATE SET
           rewritten_by_user_id = $2,
           rewritten_at = CURRENT_TIMESTAMP`,
        [topic.date, userId]
      );
    }

    console.log(`Article updated in database for date: ${topic.date}`);
    return true;
  } catch (error) {
    console.error('Error updating article:', error);
    return false;
  }
}

/**
 * Get an article from the database by date
 */
export async function getArticleByDate(date: string): Promise<DailyTopic | null> {
  if (!pool) return null;

  try {
    const result = await pool.query(
      'SELECT * FROM daily_articles WHERE date = $1',
      [date]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: `db-${row.id}`,
      date: row.date,
      title: row.title,
      content: row.content,
      category: row.category || 'psychology',
      readingTime: row.reading_time || 10,
      keyInsights: row.key_insights || [],
      keyConcepts: row.key_concepts || [],
      dailyPractice: row.daily_practice || [],
      links: row.links || [],
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

/**
 * Get all articles from the database
 */
export async function getAllArticles(limit: number = 30): Promise<DailyTopic[]> {
  if (!pool) return [];

  try {
    const result = await pool.query(
      'SELECT * FROM daily_articles ORDER BY date DESC LIMIT $1',
      [limit]
    );

    return result.rows.map((row) => ({
      id: `db-${row.id}`,
      date: row.date,
      title: row.title,
      content: row.content,
      category: row.category || 'psychology',
      readingTime: row.reading_time || 10,
      keyInsights: row.key_insights || [],
      keyConcepts: row.key_concepts || [],
      dailyPractice: row.daily_practice || [],
      links: row.links || [],
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

/**
 * Check if article was rewritten
 */
export async function getArticleRewriteInfo(date: string): Promise<{ rewritten: boolean; rewrittenAt?: string } | null> {
  if (!pool) return null;

  try {
    const result = await pool.query(
      'SELECT rewritten_at FROM article_rewrites WHERE article_date = $1',
      [date]
    );

    if (result.rows.length === 0) {
      return { rewritten: false };
    }

    return {
      rewritten: true,
      rewrittenAt: result.rows[0].rewritten_at,
    };
  } catch (error) {
    console.error('Error checking rewrite info:', error);
    return null;
  }
}

/**
 * Delete article (for regeneration)
 */
export async function deleteArticle(date: string): Promise<boolean> {
  if (!pool) return false;

  try {
    await pool.query('DELETE FROM daily_articles WHERE date = $1', [date]);
    return true;
  } catch (error) {
    console.error('Error deleting article:', error);
    return false;
  }
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

/**
 * Create a new user
 */
export async function createUser(email: string, password: string): Promise<{ id: number; email: string } | null> {
  if (!pool) return null;

  try {
    const passwordHash = simpleHash(password);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email.toLowerCase(), passwordHash]
    );
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      // Unique violation - email already exists
      return null;
    }
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Authenticate user
 */
export async function authenticateUser(email: string, password: string): Promise<{ id: number; email: string } | null> {
  if (!pool) return null;

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    const isValid = verifyPassword(password, user.password_hash);

    if (!isValid) return null;

    return { id: user.id, email: user.email };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<{ id: number; email: string } | null> {
  if (!pool) return null;

  try {
    const result = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// ============================================================================
// USER INTERACTION FUNCTIONS
// ============================================================================

/**
 * Mark article as read by user
 */
export async function markArticleAsRead(userId: number, articleDate: string): Promise<boolean> {
  if (!pool) return false;

  try {
    await pool.query(
      `INSERT INTO user_article_interactions (user_id, article_date, has_read, read_at)
       VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, article_date) DO UPDATE SET
         has_read = TRUE,
         read_at = COALESCE(user_article_interactions.read_at, CURRENT_TIMESTAMP)`,
      [userId, articleDate]
    );
    return true;
  } catch (error) {
    console.error('Error marking article as read:', error);
    return false;
  }
}

/**
 * Get user's read articles
 */
export async function getUserReadArticles(userId: number): Promise<string[]> {
  if (!pool) return [];

  try {
    const result = await pool.query(
      'SELECT article_date FROM user_article_interactions WHERE user_id = $1 AND has_read = TRUE',
      [userId]
    );
    return result.rows.map(r => r.article_date);
  } catch (error) {
    console.error('Error getting read articles:', error);
    return [];
  }
}

/**
 * Get all rewritten article dates
 */
export async function getAllRewrittenDates(): Promise<string[]> {
  if (!pool) return [];

  try {
    const result = await pool.query(
      'SELECT article_date FROM article_rewrites'
    );
    return result.rows.map(r => r.article_date);
  } catch (error) {
    console.error('Error getting rewritten dates:', error);
    return [];
  }
}

/**
 * Check if specific article was read by user
 */
export async function hasUserReadArticle(userId: number, articleDate: string): Promise<boolean> {
  if (!pool) return false;

  try {
    const result = await pool.query(
      'SELECT 1 FROM user_article_interactions WHERE user_id = $1 AND article_date = $2 AND has_read = TRUE',
      [userId, articleDate]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if article read:', error);
    return false;
  }
}
