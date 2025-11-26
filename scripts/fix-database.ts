#!/usr/bin/env node
/**
 * Fix database: Remove duplicate articles and add unique constraint on date
 */

import { Pool } from 'pg';

async function fixDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 Fixing database...\n');

    // 1. Find and remove duplicates, keeping only the most recent for each date
    console.log('1. Checking for duplicate articles...');
    
    const duplicates = await pool.query(`
      SELECT date, COUNT(*) as count 
      FROM daily_articles 
      GROUP BY date 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.rows.length > 0) {
      console.log(`   Found ${duplicates.rows.length} dates with duplicates`);
      
      for (const row of duplicates.rows) {
        console.log(`   - ${row.date}: ${row.count} articles`);
        
        // Keep only the most recent article for this date
        await pool.query(`
          DELETE FROM daily_articles 
          WHERE date = $1 
          AND id NOT IN (
            SELECT id FROM daily_articles 
            WHERE date = $1 
            ORDER BY created_at DESC 
            LIMIT 1
          )
        `, [row.date]);
      }
      
      console.log('   ✅ Duplicates removed\n');
    } else {
      console.log('   ✅ No duplicates found\n');
    }

    // 2. Drop old constraint if exists
    console.log('2. Updating constraints...');
    await pool.query(`
      ALTER TABLE daily_articles DROP CONSTRAINT IF EXISTS daily_articles_date_key
    `).catch(() => {});
    await pool.query(`
      ALTER TABLE daily_articles DROP CONSTRAINT IF EXISTS daily_articles_date_unique
    `).catch(() => {});

    // 3. Add unique constraint on date
    await pool.query(`
      ALTER TABLE daily_articles ADD CONSTRAINT daily_articles_date_key UNIQUE (date)
    `);
    console.log('   ✅ Added unique constraint on date\n');

    // 4. Show current articles
    console.log('3. Current articles in database:');
    const articles = await pool.query(`
      SELECT date, title, is_fallback_content, created_at 
      FROM daily_articles 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    for (const row of articles.rows) {
      const status = row.is_fallback_content ? '(fallback)' : '(Groq)';
      console.log(`   - ${row.date}: "${row.title.substring(0, 40)}..." ${status}`);
    }

    console.log('\n✅ Database fixed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixDatabase();

