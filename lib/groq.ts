// Groq AI integration for generating educational psychology articles
// Free tier: 14,400 requests/day, 30 requests/minute
// Get your free API key at: https://console.groq.com/keys

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

interface GroqError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface GenerationResult {
  success: boolean;
  content?: string;
  error?: string;
  errorCode?: string;
  errorType?: string;
}

/**
 * Generate content using Groq's free Llama model
 */
export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 8000
): Promise<GenerationResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('[GROQ] API key not found in environment variables');
    return {
      success: false,
      error: 'Groq API key is not configured. Please add GROQ_API_KEY to your environment variables.',
      errorCode: 'NO_API_KEY',
    };
  }

  console.log('[GROQ] Starting generation request...');
  console.log('[GROQ] Model: llama-3.3-70b-versatile');
  console.log('[GROQ] Max tokens:', maxTokens);

  try {
    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const startTime = Date.now();
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
        top_p: 0.9,
      }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[GROQ] Response received in ${elapsed}ms, status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GROQ] API error response:', errorText);
      
      let errorData: GroqError | null = null;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // Not JSON, use raw text
      }

      const errorMessage = errorData?.error?.message || errorText;
      const errorType = errorData?.error?.type || 'unknown';
      const errorCode = errorData?.error?.code || response.status.toString();

      // Provide user-friendly error messages
      let userMessage = `Groq API error: ${errorMessage}`;
      
      if (response.status === 429) {
        userMessage = 'Rate limit exceeded. The free Groq tier has limits on requests per minute and per day. Please wait a few minutes and try again.';
      } else if (response.status === 401) {
        userMessage = 'Invalid API key. Please check your GROQ_API_KEY is correct.';
      } else if (response.status === 503) {
        userMessage = 'Groq service is temporarily unavailable. Please try again in a few minutes.';
      } else if (response.status === 500) {
        userMessage = 'Groq server error. The AI service is having issues. Please try again later.';
      }

      return {
        success: false,
        error: userMessage,
        errorCode,
        errorType,
      };
    }

    const data: GroqResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error('[GROQ] No choices in response:', JSON.stringify(data).substring(0, 500));
      return {
        success: false,
        error: 'Groq returned an empty response. The AI may be overloaded. Please try again.',
        errorCode: 'EMPTY_RESPONSE',
      };
    }

    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('[GROQ] No content in response choice');
      return {
        success: false,
        error: 'Groq returned no content. Please try again.',
        errorCode: 'NO_CONTENT',
      };
    }

    console.log(`[GROQ] Successfully generated ${content.length} characters`);
    
    return {
      success: true,
      content,
    };
  } catch (error) {
    console.error('[GROQ] Exception during API call:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      return {
        success: false,
        error: 'Network error connecting to Groq. Please check your internet connection.',
        errorCode: 'NETWORK_ERROR',
      };
    }
    
    return {
      success: false,
      error: `Failed to connect to Groq AI: ${errorMessage}`,
      errorCode: 'EXCEPTION',
    };
  }
}

/**
 * Format the article content for proper display
 * Ensures proper paragraph breaks and spacing
 */
function formatArticleContent(content: string): string {
  let formatted = content;

  // Ensure section headers have proper spacing
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '\n\n**$1**\n\n');

  // Convert single newlines to double for paragraph breaks
  formatted = formatted.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');

  // Ensure there's space after periods that start new sentences
  formatted = formatted.replace(/\.([A-Z])/g, '.\n\n$1');

  // Clean up excessive newlines (more than 3)
  formatted = formatted.replace(/\n{4,}/g, '\n\n\n');

  // Ensure the article starts clean
  formatted = formatted.trim();

  // Make sure each paragraph is properly separated
  const paragraphs = formatted.split(/\n\n+/);
  formatted = paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .join('\n\n');

  return formatted;
}

export interface ArticleGenerationResult {
  success: boolean;
  content?: string;
  keyInsights?: string[];
  keyConcepts?: { term: string; detail: string }[];
  dailyPractice?: string[];
  error?: string;
  errorCode?: string;
}

/**
 * Generate a full educational article about a psychology topic
 * Target: 5-8 minutes reading time (1000-1600 words)
 */
export async function generatePsychologyArticle(
  title: string,
  summary: string,
  sourceUrl: string
): Promise<ArticleGenerationResult> {
  console.log('[GROQ] Generating article for:', title);
  console.log('[GROQ] Summary length:', summary.length, 'characters');

  const systemPrompt = `You are an expert psychology and neuroscience educator who writes engaging, comprehensive educational articles.

Your writing style:
- Clear and accessible to general audiences
- Scientifically accurate but not overly technical  
- Engaging with real-world examples, analogies, and stories
- Well-structured with clear sections
- IMPORTANT: Write 1000-1600 words (5-8 minute read)

FORMATTING RULES (CRITICAL):
- Start each new paragraph on a new line
- Leave a blank line between paragraphs
- Use **Section Title** for headers (with blank lines before and after)
- Write in flowing paragraphs, not bullet points
- Each paragraph should be 3-5 sentences
- Never write wall-of-text - always use paragraph breaks`;

  const userPrompt = `Write a comprehensive educational article about this psychology research.

TITLE: ${title}

RESEARCH SUMMARY: ${summary}

SOURCE: ${sourceUrl}

Write the article with these sections. IMPORTANT: Put a blank line between every paragraph!

**The Discovery**

Write 2-3 paragraphs introducing the key finding. Make it engaging and set the scene. Each paragraph should be separated by a blank line.

**Understanding the Science**

Write 3-4 paragraphs explaining the psychology/neuroscience concepts. Use analogies and everyday examples. Separate each paragraph with a blank line.

**The Research in Detail**

Write 2-3 paragraphs about how scientists study this and what they found. Separate paragraphs with blank lines.

**Why This Matters**

Write 2-3 paragraphs on broader implications for mental health and daily life. Use blank lines between paragraphs.

**The Bigger Picture**

Write 2 paragraphs placing this in context. What questions remain? Separate with blank lines.

**Practical Applications**

Write 2-3 paragraphs with concrete takeaways readers can apply. Blank lines between paragraphs.

**Final Thoughts**

Write 1-2 concluding paragraphs. Separate with blank lines.

End with:

---

*This article was inspired by research reported on ScienceDaily. For the original research summary and sources, see the link below.*

REMEMBER: 
- 1000-1600 words total (5-8 minute read)
- Blank line between EVERY paragraph
- NO walls of text
- Flowing, readable paragraphs`;

  // Reduced max tokens for 5-8 minute articles (1000-1600 words ≈ 4000-5000 tokens)
  const result = await generateWithGroq(systemPrompt, userPrompt, 5000);

  if (!result.success) {
    console.error('[GROQ] Article generation failed:', result.error);
    return {
      success: false,
      error: result.error,
      errorCode: result.errorCode,
    };
  }

  // Format the content for proper display
  const formattedContent = formatArticleContent(result.content!);
  console.log('[GROQ] Article formatted, final length:', formattedContent.length, 'characters');

  return {
    success: true,
    content: formattedContent,
    keyInsights: getDefaultInsights(title),
    keyConcepts: getDefaultConcepts(),
    dailyPractice: getDefaultPractice(title),
  };
}

function getDefaultInsights(title: string): string[] {
  return [
    `This research on "${title}" reveals new insights about how our minds work.`,
    'Scientific discoveries in psychology often have practical applications for daily life.',
    'Understanding the brain helps us make better decisions about our mental well-being.',
    'For complete research details and methodology, see the original source below.',
  ];
}

function getDefaultConcepts(): { term: string; detail: string }[] {
  return [
    { 
      term: 'Neuroscience', 
      detail: 'The scientific study of the nervous system and brain, exploring how neural activity creates thoughts, emotions, and behaviors.' 
    },
    { 
      term: 'Psychology', 
      detail: 'The scientific study of mind and behavior, examining how we think, feel, and act in various situations.' 
    },
    { 
      term: 'Cognition', 
      detail: 'The mental processes involved in gaining knowledge and understanding, including thinking, remembering, and problem-solving.' 
    },
    {
      term: 'Neuroplasticity',
      detail: 'The brain\'s ability to reorganize itself by forming new neural connections throughout life, allowing adaptation and learning.'
    },
  ];
}

function getDefaultPractice(title: string): string[] {
  return [
    `Take 5 minutes to reflect on how "${title}" relates to your own experiences or observations.`,
    'Share one insight from this article with a friend or family member today.',
    'Write down one thing you learned that surprised you or changed your perspective.',
    'Consider one small change you could make in your daily life based on this knowledge.',
  ];
}
