#!/usr/bin/env node
/**
 * Migration: Remove article_date column from tracking tables
 * We now use article_id for tracking instead of article_date
 */

import { Pool } from 'pg';

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 Migrating article tracking tables...\n');

    // 1. Make article_date nullable in user_article_interactions (temporary step)
    console.log('1. Making article_date nullable in user_article_interactions...');
    await pool.query(`
      ALTER TABLE user_article_interactions 
      ALTER COLUMN article_date DROP NOT NULL
    `);
    console.log('   ✅ Done\n');

    // 2. Make article_date nullable in article_rewrites (temporary step)
    console.log('2. Making article_date nullable in article_rewrites...');
    await pool.query(`
      ALTER TABLE article_rewrites 
      ALTER COLUMN article_date DROP NOT NULL
    `);
    console.log('   ✅ Done\n');

    // 3. Show current state
    console.log('3. Current tracking data:');
    const interactions = await pool.query(`
      SELECT COUNT(*) as count, 
             COUNT(article_date) as with_date,
             COUNT(article_id) as with_id
      FROM user_article_interactions
    `);
    console.log(`   Interactions: ${interactions.rows[0].count} total`);
    console.log(`   - With article_date: ${interactions.rows[0].with_date}`);
    console.log(`   - With article_id: ${interactions.rows[0].with_id}\n`);

    const rewrites = await pool.query(`
      SELECT COUNT(*) as count,
             COUNT(article_date) as with_date,
             COUNT(article_id) as with_id
      FROM article_rewrites
    `);
    console.log(`   Rewrites: ${rewrites.rows[0].count} total`);
    console.log(`   - With article_date: ${rewrites.rows[0].with_date}`);
    console.log(`   - With article_id: ${rewrites.rows[0].with_id}\n`);

    console.log('✅ Migration completed successfully!');
    console.log('\n💡 Note: article_date columns are now nullable.');
    console.log('   New records will only use article_id for tracking.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

