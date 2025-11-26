// Script to find and restore the menopause article
// Run with: npx tsx scripts/restore-menopause.ts

import { Pool } from 'pg';
import { findArticleByTitle } from '../lib/database';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function restoreMenopauseArticle() {
  try {
    // Find the menopause article
    const menopauseArticle = await findArticleByTitle('menopause');
    
    if (!menopauseArticle) {
      console.log('Menopause article not found in database');
      return;
    }
    
    console.log('Found menopause article:');
    console.log('Title:', menopauseArticle.title);
    console.log('Date:', menopauseArticle.date);
    console.log('Content length:', menopauseArticle.content.length);
    
    // Get today's date (6 PM reset logic)
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const today = new Date();
    
    if (hour < 18 || (hour === 18 && minute < 16)) {
      today.setDate(today.getDate() - 1);
    }
    
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if today's article is the fallback one
    const result = await pool.query(
      'SELECT * FROM daily_articles WHERE date = $1',
      [todayStr]
    );
    
    if (result.rows.length > 0) {
      const todayArticle = result.rows[0];
      if (todayArticle.is_fallback_content) {
        console.log(`\nReplacing fallback article for ${todayStr} with menopause article...`);
        
        // Restore the menopause article for today
        await pool.query(
          `UPDATE daily_articles SET
            title = $2,
            content = $3,
            category = $4,
            reading_time = $5,
            key_insights = $6,
            key_concepts = $7,
            daily_practice = $8,
            links = $9,
            is_fallback_content = FALSE,
            generation_error = NULL
           WHERE date = $1`,
          [
            todayStr,
            menopauseArticle.title,
            menopauseArticle.content,
            menopauseArticle.category,
            menopauseArticle.readingTime,
            JSON.stringify(menopauseArticle.keyInsights || []),
            JSON.stringify(menopauseArticle.keyConcepts || []),
            JSON.stringify(menopauseArticle.dailyPractice || []),
            JSON.stringify(menopauseArticle.links || []),
          ]
        );
        
        console.log('✅ Menopause article restored for today!');
      } else {
        console.log(`Today's article (${todayStr}) is not a fallback article. Current title: ${todayArticle.title}`);
      }
    } else {
      console.log(`No article found for today (${todayStr}). Creating menopause article...`);
      
      await pool.query(
        `INSERT INTO daily_articles 
          (date, title, content, category, reading_time, key_insights, key_concepts, daily_practice, links, is_fallback_content)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE)`,
        [
          todayStr,
          menopauseArticle.title,
          menopauseArticle.content,
          menopauseArticle.category,
          menopauseArticle.readingTime,
          JSON.stringify(menopauseArticle.keyInsights || []),
          JSON.stringify(menopauseArticle.keyConcepts || []),
          JSON.stringify(menopauseArticle.dailyPractice || []),
          JSON.stringify(menopauseArticle.links || []),
        ]
      );
      
      console.log('✅ Menopause article created for today!');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

restoreMenopauseArticle();

