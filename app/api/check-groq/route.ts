import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      available: false,
      message: 'Groq API key not configured',
      error: 'GROQ_API_KEY environment variable is not set',
    });
  }

  try {
    // Make a realistic request that simulates actual article generation
    // Use similar token count to what a real generation would need
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: 'You are an educational psychology writer. Write comprehensive, engaging articles.' 
          },
          { 
            role: 'user', 
            content: 'Write a 500-word educational article about a recent psychology study.' 
          }
        ],
        max_tokens: 1000,  // Test with realistic token count
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const usage = data.usage;
      
      // Check if we have enough tokens left for a full article (needs ~4000-5000 tokens)
      // If this 1000-token request succeeded, we should have plenty
      return NextResponse.json({
        available: true,
        message: 'Groq API is available and ready to generate articles!',
        details: usage ? `Tokens used: ${usage.total_tokens}` : undefined,
      });
    }

    const data = await response.json();
    const errorMessage = data.error?.message || 'Unknown error';
    const errorType = data.error?.type || 'unknown';
    
    // Check for rate limit
    if (response.status === 429 || errorMessage.includes('Rate limit')) {
      // Parse details from error message
      const waitMatch = errorMessage.match(/try again in ([\d.]+[smh])/i);
      const waitTime = waitMatch ? waitMatch[1] : '';
      
      // Check if it's a daily limit (TPD) or per-minute limit (TPM)
      const isDailyLimit = errorMessage.includes('TPD') || errorMessage.includes('tokens per day');
      const isMinuteLimit = errorMessage.includes('TPM') || errorMessage.includes('tokens per minute');
      
      let message = 'Rate limit reached.';
      if (isDailyLimit) {
        message = '⚠️ Daily token limit reached! Resets at midnight UTC.';
      } else if (isMinuteLimit && waitTime) {
        message = `Per-minute limit reached. Try again in ${waitTime}.`;
      } else if (waitTime) {
        message = `Rate limit reached. Try again in ${waitTime}.`;
      }
      
      return NextResponse.json({
        available: false,
        message,
        error: errorMessage,
        limitType: isDailyLimit ? 'daily' : isMinuteLimit ? 'minute' : 'unknown',
      });
    }

    return NextResponse.json({
      available: false,
      message: 'Groq API returned an error',
      error: errorMessage,
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      message: 'Failed to connect to Groq API',
      error: error instanceof Error ? error.message : 'Network error',
    });
  }
}

