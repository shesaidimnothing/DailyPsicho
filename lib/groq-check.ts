// Check if Groq API is available before generating articles
// Uses a lightweight check without consuming tokens

const GROQ_API_URL = 'https://api.groq.com/openai/v1/models';

/**
 * Check if Groq API is available and not rate-limited
 * Uses a lightweight models endpoint to check availability
 * Returns true if available, false if rate-limited or unavailable
 */
export async function isGroqAvailable(): Promise<boolean> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.log('[GROQ CHECK] No API key configured');
    return false;
  }

  try {
    // Use the models endpoint which is lightweight and doesn't consume tokens
    const response = await fetch(GROQ_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If we get 429, definitely rate limited
      if (response.status === 429) {
        console.log('[GROQ CHECK] Rate limit exceeded - API unavailable');
        return false;
      }
      
      // For other errors, check the response
      const errorText = await response.text();
      let errorData: any = null;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // Not JSON
      }

      // Check if it's a rate limit error
      if (errorData?.error?.code === 'rate_limit_exceeded' || 
          errorData?.error?.type === 'tokens') {
        console.log('[GROQ CHECK] Rate limit exceeded - API unavailable');
        return false;
      }

      // Other errors might be temporary, but we'll be conservative
      console.log('[GROQ CHECK] API error:', response.status);
      return false;
    }

    // If we get a successful response, API is available
    console.log('[GROQ CHECK] API is available');
    return true;
  } catch (error) {
    console.error('[GROQ CHECK] Error checking API availability:', error);
    return false;
  }
}
