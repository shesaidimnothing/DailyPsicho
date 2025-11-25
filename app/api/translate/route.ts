import { NextResponse } from 'next/server';

// Simple server-side proxy for translation (currently unused because we removed
// external API calls from the client). You can enable this later if you decide
// to use a server-side translation service under your own control.

const DEFAULT_TRANSLATE_URL =
  process.env.TRANSLATE_API_URL || 'https://translate.argosopentech.com/translate';

export async function POST(request: Request) {
  try {
    const { text, source = 'en', target = 'fr' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid text' }, { status: 400 });
    }

    const textToTranslate = text.length > 5000 ? text.substring(0, 5000) : text;

    const response = await fetch(DEFAULT_TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: textToTranslate,
        source,
        target,
        format: 'text',
      }),
    });

    if (!response.ok) {
      console.error('Translation API error:', response.status, await response.text());
      return NextResponse.json({ translatedText: text }, { status: 200 });
    }

    const data = await response.json();
    const translated = (data as any).translatedText || text;

    return NextResponse.json({ translatedText: translated }, { status: 200 });
  } catch (error) {
    console.error('Translation route error:', error);
    return NextResponse.json({ translatedText: '' }, { status: 200 });
  }
}