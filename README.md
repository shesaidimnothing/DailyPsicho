# Daily Psicho

A modern daily psychology and philosophy news site with Ancient Greek-inspired aesthetics, built with Next.js.

## Features

- **Daily Topics**: Display one psychology/philosophy topic per day (10-20 minute reads)
- **Real Content Sources**: Automatically fetches content from:
  - Wikipedia (psychology & philosophy articles)
  - Stanford Encyclopedia of Philosophy (SEP)
  - Internet Encyclopedia of Philosophy (IEP)
  - YouTube/TED Talks (videos)
- **Rich Media**: Support for embedded videos (YouTube, Vimeo) and external links
- **CMS Integration**: Flexible integration with Supabase, Sanity, or Contentful (optional)
- **Greek Aesthetics**: Beautiful typography and design inspired by Ancient Greece
- **Smooth Animations**: Framer Motion animations for polished user experience
- **Mobile Responsive**: Fully responsive design for all devices
- **ISR**: Incremental Static Regeneration for daily content updates

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your CMS (choose one):

#### Option 1: Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy your Project URL and anon key
3. Create a table called `daily_topics` with this SQL:

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

4. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Option 2: Sanity.io

See `lib/cms-alternatives.ts` for integration example. Uncomment and configure the Sanity client.

#### Option 3: Contentful

See `lib/cms-alternatives.ts` for integration example. Uncomment and configure the Contentful client.

#### Option 4: Real Content Mode (Default)

If no CMS is configured, the site will automatically fetch real content from:
- **Wikipedia**: Psychology and philosophy articles
- **Stanford Encyclopedia of Philosophy**: In-depth philosophical resources
- **Internet Encyclopedia of Philosophy**: Comprehensive philosophy content
- **YouTube**: Related videos (requires API key for best results)

The site uses date-based seeding to ensure consistent topics per day, so the same date will always show the same topic.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## Project Structure

```
├── app/
│   ├── archive/          # Archive page for past topics
│   ├── topic/[date]/     # Individual topic pages
│   ├── layout.tsx        # Root layout with fonts
│   ├── page.tsx          # Homepage (latest topic)
│   └── globals.css       # Global styles with Greek theme
├── components/
│   ├── Navigation.tsx    # Site navigation
│   ├── TopicContent.tsx  # Main topic display component
│   ├── VideoEmbed.tsx    # Video embedding component
│   ├── ExternalLink.tsx  # External link component
│   └── ArchiveItem.tsx   # Archive list item
├── lib/
│   ├── supabase.ts       # Supabase integration
│   └── cms-alternatives.ts # Alternative CMS examples
└── types/
    └── topic.ts          # TypeScript type definitions
```

## Content Sources

The website automatically fetches real content from multiple sources:

### Wikipedia
- Uses the Wikipedia REST API to fetch psychology and philosophy articles
- Automatically formats content for 10-20 minute reads
- Includes links to full articles and related topics

### Philosophy Encyclopedias
- **Stanford Encyclopedia of Philosophy (SEP)**: Links to in-depth philosophical articles
- **Internet Encyclopedia of Philosophy (IEP)**: Comprehensive philosophy resources

### Videos
- **YouTube**: Searches for relevant psychology/philosophy videos
- **TED Talks**: Includes TED content when available
- Requires `YOUTUBE_API_KEY` in `.env.local` for API-based search (optional - has fallback)

### How It Works

1. Each day, the site selects a random psychology or philosophy topic
2. Fetches content from Wikipedia
3. Finds related videos on YouTube
4. Adds links to SEP, IEP, and related Wikipedia articles
5. Formats everything into a readable 10-20 minute article

The selection is deterministic based on the date, so the same date always shows the same topic.

## Adding Daily Topics

### Automatic (Recommended)

The site automatically generates topics daily. You can trigger manual generation:

```bash
# Call the API endpoint
curl http://localhost:3000/api/generate-daily
```

Or set up a cron job/webhook to call this endpoint daily.

### Via Supabase (Manual)

Insert a new topic into the `daily_topics` table:

```sql
INSERT INTO daily_topics (title, content, date, category, reading_time, videos, links)
VALUES (
  'Your Topic Title',
  'Your full article content here...',
  '2024-01-15',
  'psychology', -- or 'philosophy' or 'both'
  15,
  '[{"title": "Video Title", "url": "https://youtube.com/watch?v=...", "platform": "youtube"}]'::jsonb,
  '[{"title": "Link Title", "url": "https://example.com", "description": "Optional description"}]'::jsonb
);
```

### Automated Daily Updates

You can set up a cron job or scheduled function to:
1. Fetch new content from an external API
2. Insert it into your database
3. The site will automatically regenerate with ISR

## Styling

The site uses:
- **TailwindCSS v4** for utility-first styling
- **Greek-inspired fonts**: Cinzel (headings), Playfair Display (titles), Crimson Text (body)
- **Black & white color scheme** with subtle Greek decorative borders
- **Framer Motion** for smooth animations

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

The site uses ISR (Incremental Static Regeneration) with:
- Homepage: Regenerates every 24 hours (`revalidate: 86400`)
- Archive: Regenerates every hour (`revalidate: 3600`)

### Other Platforms

The site can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

Make sure to set your environment variables in your hosting platform's dashboard.

## Customization

### Changing Fonts

Edit `app/layout.tsx` to use different Google Fonts.

### Modifying Styles

Edit `app/globals.css` for global styles and Greek decorative elements.

### Adding Features

- Add new components in the `components/` directory
- Create new pages in the `app/` directory
- Extend types in `types/topic.ts`

## License

MIT
