# Content Sources Integration

This document explains how the website fetches real content from various psychology and philosophy sources.

## How It Works

The website automatically fetches real content from multiple sources without requiring any CMS setup. When you visit the site:

1. **Date-Based Topic Selection**: Each date gets a deterministic topic based on a seed derived from the date
2. **Wikipedia Integration**: Fetches psychology/philosophy articles from Wikipedia REST API
3. **Content Processing**: Formats and truncates content to 10-20 minute reads
4. **Video Search**: Finds related YouTube videos (requires API key for best results)
5. **Encyclopedia Links**: Adds links to Stanford Encyclopedia of Philosophy (SEP) and Internet Encyclopedia of Philosophy (IEP)

## Content Sources

### 1. Wikipedia (Primary Source)

**API**: Wikipedia REST API (no key required)
**Usage**: Fetches article summaries and full articles
**Topics**: Psychology and philosophy articles

**Example Topics**:
- Psychology: Cognitive psychology, Behavioral psychology, Social psychology, etc.
- Philosophy: Stoicism, Existentialism, Epistemology, Ethics, etc.

**Implementation**: `lib/wikipedia.ts`

### 2. Stanford Encyclopedia of Philosophy (SEP)

**Access**: Direct URL links (web-based)
**Usage**: Provides links to in-depth philosophical articles
**Coverage**: Comprehensive philosophical topics

**Example Topics**: Stoicism, Epistemology, Ethics, Consciousness, Free Will, etc.

**Implementation**: `lib/philosophy-encyclopedias.ts`

### 3. Internet Encyclopedia of Philosophy (IEP)

**Access**: Direct URL links (web-based)
**Usage**: Provides links to comprehensive philosophy resources
**Coverage**: Wide range of philosophical topics

**Example Topics**: Stoicism, Epicurus, Aristotle, Plato, Kant, Nietzsche, etc.

**Implementation**: `lib/philosophy-encyclopedias.ts`

### 4. YouTube / TED Talks

**API**: YouTube Data API v3 (optional - requires API key)
**Usage**: Searches for relevant psychology/philosophy videos
**Fallback**: Curated video list when API key is not available

**To enable YouTube API search**:
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Enable YouTube Data API v3
3. Add to `.env.local`: `YOUTUBE_API_KEY=your_key_here`

**Implementation**: `lib/youtube-search.ts`

## Content Processing

The `lib/content-processor.ts` file handles:

1. **Content Formatting**: Cleans up Wikipedia content, removes citations, formats paragraphs
2. **Reading Time Calculation**: Estimates reading time based on word count (200 words/minute)
3. **Content Truncation**: Ensures content fits 10-20 minute read time
4. **Topic Generation**: Creates DailyTopic objects with all metadata

## Daily Topic Generation

### Automatic (Default)

The site automatically generates topics when:
- No Supabase is configured
- No topic exists for the requested date
- Database query fails

### Manual Generation

You can manually trigger topic generation:

```bash
# Via API endpoint
curl http://localhost:3000/api/generate-daily

# Or in production
curl https://your-domain.com/api/generate-daily
```

### Scheduled Generation

Set up a cron job or scheduled function to call the API daily:

**Vercel Cron** (recommended):
```json
// vercel.json
{
  "crons": [{
    "path": "/api/generate-daily",
    "schedule": "0 0 * * *"
  }]
}
```

**GitHub Actions**:
```yaml
name: Generate Daily Topic
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: curl https://your-domain.com/api/generate-daily
```

## Topic Selection Algorithm

Topics are selected deterministically based on the date:

1. Convert date to days since epoch
2. Use modulo to alternate between psychology and philosophy
3. Select random topic from the chosen category
4. Same date always produces the same topic

This ensures:
- Consistency: Same date = same topic
- Variety: Different dates = different topics
- Balance: Alternates between psychology and philosophy

## Customization

### Adding More Topics

Edit `lib/content-processor.ts`:

```typescript
const topics = {
  psychology: [
    // Add your topics here
    'Your New Psychology Topic',
  ],
  philosophy: [
    // Add your topics here
    'Your New Philosophy Topic',
  ],
};
```

### Changing Content Sources

You can modify or extend the content sources:

1. **Wikipedia**: Edit `lib/wikipedia.ts` to change search queries or add filters
2. **Encyclopedias**: Edit `lib/philosophy-encyclopedias.ts` to add more topics
3. **Videos**: Edit `lib/youtube-search.ts` to change search parameters

### Content Formatting

Modify `lib/content-processor.ts` functions:
- `formatContent()`: Change how content is cleaned/formatted
- `truncateToReadingTime()`: Adjust reading time targets
- `estimateReadingTime()`: Change reading speed calculation

## Limitations

1. **Wikipedia API Rate Limits**: No official limits, but be respectful
2. **YouTube API**: Requires API key for full functionality (free tier available)
3. **Content Quality**: Depends on Wikipedia article quality
4. **Network Dependency**: Requires internet connection to fetch content

## Future Enhancements

Potential improvements:
- Cache Wikipedia content locally
- Add more content sources (PubMed, PhilPapers, etc.)
- Implement content quality scoring
- Add user feedback/rating system
- Support for multiple languages

