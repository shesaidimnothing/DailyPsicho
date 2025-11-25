# Setup Guide

## Quick Start

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Set up your CMS** (choose one):

   ### Option A: Supabase (Easiest)
   
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Create a new project
   - In the SQL Editor, run:
   ```sql
   CREATE TABLE daily_topics (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     date DATE NOT NULL UNIQUE,
     category TEXT NOT NULL DEFAULT 'both',
     videos JSONB,
     links JSONB,
     reading_time INTEGER NOT NULL DEFAULT 15,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```
   - Go to Settings > API
   - Copy your Project URL and anon/public key
   - Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Add your first topic**:

   ```sql
   INSERT INTO daily_topics (title, content, date, category, reading_time)
   VALUES (
     'The Philosophy of Mindfulness',
     'Your full article content here...',
     CURRENT_DATE,
     'philosophy',
     12
   );
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Visit** [http://localhost:3000](http://localhost:3000)

## Adding Videos and Links

When inserting topics, you can include videos and links:

```sql
INSERT INTO daily_topics (
  title, 
  content, 
  date, 
  category, 
  reading_time,
  videos,
  links
)
VALUES (
  'Your Title',
  'Your content...',
  CURRENT_DATE,
  'psychology',
  15,
  '[{"title": "Introduction Video", "url": "https://www.youtube.com/watch?v=VIDEO_ID", "platform": "youtube", "description": "Optional description"}]'::jsonb,
  '[{"title": "Further Reading", "url": "https://example.com", "description": "Learn more about this topic"}]'::jsonb
);
```

## Automated Daily Updates

To automatically add new topics daily, you can:

1. **Use Supabase Edge Functions** (recommended):
   - Create a scheduled function that runs daily
   - Fetch content from an API or generate it
   - Insert into the database

2. **Use a cron job**:
   - Set up a server-side script
   - Use a service like Vercel Cron or GitHub Actions
   - Run daily to insert new topics

3. **Use a webhook**:
   - Set up a webhook endpoint
   - Call it from your CMS or automation tool
   - Insert new topics via API

## Customization

### Changing the Design

- **Colors**: Edit `app/globals.css` CSS variables
- **Fonts**: Change fonts in `app/layout.tsx`
- **Layout**: Modify components in `components/` directory

### Adding New Features

- **New pages**: Add to `app/` directory
- **New components**: Add to `components/` directory
- **New types**: Extend `types/topic.ts`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variables in dashboard
4. Deploy!

The site automatically regenerates:
- Homepage: Every 24 hours
- Archive: Every hour

## Troubleshooting

### "Supabase credentials not found"
- This is normal if you haven't set up Supabase yet
- The site will use mock data for development
- Set up your `.env.local` file to use real data

### Build errors
- Make sure all dependencies are installed: `npm install`
- Check that TypeScript types are correct
- Verify environment variables are set (if using CMS)

### Styling issues
- Clear `.next` cache: `rm -rf .next`
- Rebuild: `npm run build`

