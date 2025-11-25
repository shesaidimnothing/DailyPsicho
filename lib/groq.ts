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
}

/**
 * Generate content using Groq's free Llama model
 */
export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 8000
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('GROQ_API_KEY not found in environment variables');
    return null;
  }

  try {
    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Latest free model for long-form writing
        messages,
        temperature: 0.7,
        max_tokens: maxTokens, // Increased for longer articles
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', response.status, error);
      return null;
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return null;
  }
}

/**
 * Generate a full educational article about a psychology topic
 * Target: 10-15 minutes reading time (2500-3500 words)
 */
export async function generatePsychologyArticle(
  title: string,
  summary: string,
  sourceUrl: string
): Promise<{
  content: string;
  keyInsights: string[];
  keyConcepts: { term: string; detail: string }[];
  dailyPractice: string[];
} | null> {
  const systemPrompt = `You are an expert psychology and neuroscience educator who writes engaging, comprehensive educational articles. Your writing style is:
- Clear and accessible to general audiences
- Scientifically accurate but not overly technical
- Engaging with real-world examples, analogies, and stories
- Well-structured with clear sections
- IMPORTANT: Write between 2800-3500 words (this is crucial - aim for a 12-15 minute read)
- Rich with explanations, examples, and practical insights

You always write original educational content that explains concepts deeply and thoroughly. Never rush through topics - take time to explain each concept fully with examples.`;

  const userPrompt = `Write a COMPREHENSIVE and LENGTHY educational article based on this recent psychology research news. The article MUST be between 2800-3500 words (12-15 minute read). Do not write a short article.

**Title:** ${title}

**Research Summary:** ${summary}

**Source:** ${sourceUrl}

Write the article with these sections (use **Section Title** format for headers). Each section should be substantial and detailed:

**The Discovery**
Start with the key finding in an engaging, narrative way. Set the scene. Why is this important? What problem does it address? Include context about why researchers were investigating this. (4-5 detailed paragraphs)

**Understanding the Science**
This is the heart of the article. Explain the underlying psychology/neuroscience concepts thoroughly:
- What biological or psychological mechanisms are involved?
- Use at least 2-3 analogies to make complex ideas accessible
- Include examples from everyday life
- Explain related concepts that help readers understand the full picture
- Discuss how this connects to what we already knew
(6-8 detailed paragraphs)

**The Research in Detail**
Explain how scientists typically study this topic:
- What methods do researchers use?
- What makes this kind of research challenging?
- What did this particular study find, and why is it significant?
(3-4 paragraphs)

**Why This Matters**
Discuss the broader implications thoroughly:
- How does this affect mental health understanding or treatment?
- What are the implications for everyday life?
- How might this change how we think about ourselves or others?
- What are the societal implications?
(4-5 paragraphs)

**The Bigger Picture**
Place this in the broader context of psychology/neuroscience:
- How does this fit with other research in the field?
- What questions remain unanswered?
- What might future research explore?
- What are the limitations we should keep in mind?
(3-4 paragraphs)

**Practical Applications**
Give readers concrete, actionable takeaways:
- What can people do with this knowledge?
- How might this change daily habits or perspectives?
- Include specific exercises or reflection prompts
- Make it personal and applicable
(4-5 paragraphs)

**Final Thoughts**
A thoughtful, memorable conclusion that:
- Ties everything together
- Leaves readers with something to think about
- Connects back to the opening
(2-3 paragraphs)

End with: "---\\n\\n*This article was inspired by research reported on ScienceDaily. For the original research summary and sources, see the link below.*"

IMPORTANT: Write a FULL, COMPREHENSIVE article. Do not summarize or shorten. Each section should be thorough and detailed. Aim for 3000+ words total. The reader should feel they've learned something substantial.`;

  const content = await generateWithGroq(systemPrompt, userPrompt, 8000);

  if (!content) {
    return null;
  }

  // Generate key insights
  const insightsPrompt = `Based on this article about "${title}", provide exactly 4 key takeaways as a JSON array of strings. Each should be one clear, memorable sentence that captures an important insight. Return ONLY the JSON array, no other text.

Example format: ["First insight here.", "Second insight here.", "Third insight here.", "Fourth insight here."]`;

  const insightsResponse = await generateWithGroq(
    'You extract key insights from educational content. Return only valid JSON.',
    insightsPrompt + '\n\nArticle:\n' + content.substring(0, 3000),
    500
  );

  let keyInsights: string[] = [];
  try {
    if (insightsResponse) {
      const parsed = JSON.parse(insightsResponse.trim());
      if (Array.isArray(parsed)) {
        keyInsights = parsed.slice(0, 4);
      }
    }
  } catch {
    keyInsights = [
      'New research continues to expand our understanding of the mind.',
      'Scientific discoveries often have practical applications for daily life.',
      'Understanding psychology helps us make better decisions about our well-being.',
      'See the original source for complete research details.',
    ];
  }

  // Generate key concepts
  const conceptsPrompt = `Based on this article about "${title}", provide exactly 4 key psychology/neuroscience terms and their definitions as a JSON array. Each definition should be 1-2 sentences. Format: [{"term": "Term Name", "detail": "Clear definition explaining the concept"}]. Return ONLY the JSON array.`;

  const conceptsResponse = await generateWithGroq(
    'You extract key concepts from educational content. Return only valid JSON.',
    conceptsPrompt + '\n\nArticle:\n' + content.substring(0, 3000),
    500
  );

  let keyConcepts: { term: string; detail: string }[] = [];
  try {
    if (conceptsResponse) {
      const parsed = JSON.parse(conceptsResponse.trim());
      if (Array.isArray(parsed)) {
        keyConcepts = parsed.slice(0, 4);
      }
    }
  } catch {
    keyConcepts = [
      { term: 'Neuroscience', detail: 'The scientific study of the nervous system and brain, exploring how neural activity creates thoughts, emotions, and behaviors.' },
      { term: 'Psychology', detail: 'The scientific study of mind and behavior, examining how we think, feel, and act.' },
      { term: 'Cognition', detail: 'The mental processes involved in gaining knowledge and understanding, including thinking, remembering, and problem-solving.' },
    ];
  }

  // Generate daily practice
  const practicePrompt = `Based on this article about "${title}", provide exactly 4 practical exercises or reflection prompts readers can try today. Each should be specific and actionable. Return as a JSON array of strings. Return ONLY the JSON array.`;

  const practiceResponse = await generateWithGroq(
    'You create practical exercises from educational content. Return only valid JSON.',
    practicePrompt + '\n\nArticle:\n' + content.substring(0, 3000),
    500
  );

  let dailyPractice: string[] = [];
  try {
    if (practiceResponse) {
      const parsed = JSON.parse(practiceResponse.trim());
      if (Array.isArray(parsed)) {
        dailyPractice = parsed.slice(0, 4);
      }
    }
  } catch {
    dailyPractice = [
      'Take 5 minutes to reflect on how today\'s topic relates to your own experiences.',
      'Share one insight from this article with a friend or family member.',
      'Write down one thing you learned that surprised you.',
      'Consider one small change you could make based on this knowledge.',
    ];
  }

  return {
    content,
    keyInsights,
    keyConcepts,
    dailyPractice,
  };
}
