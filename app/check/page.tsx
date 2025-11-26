'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface GroqStatus {
  available: boolean;
  message: string;
  error?: string;
  limitType?: 'daily' | 'minute' | 'unknown';
  details?: string;
  checkedAt: string;
}

export default function CheckPage() {
  const [status, setStatus] = useState<GroqStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkGroq = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/check-groq');
      const data = await res.json();
      setStatus({
        available: data.available,
        message: data.message,
        error: data.error,
        limitType: data.limitType,
        details: data.details,
        checkedAt: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      setStatus({
        available: false,
        message: 'Failed to check Groq status',
        error: error instanceof Error ? error.message : 'Unknown error',
        checkedAt: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkGroq();
    
    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(checkGroq, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <h1 className="font-title text-3xl md:text-4xl font-bold mb-8 text-center">
          Groq API Status
        </h1>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 md:p-8">
          {loading && !status ? (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-4">⟳</div>
              <p className="text-[var(--text-muted)]">Checking Groq availability...</p>
            </div>
          ) : status ? (
            <div className="space-y-6">
              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-4">
                <div className={`w-6 h-6 rounded-full ${status.available ? 'bg-green-500' : 'bg-red-500'} ${loading ? 'animate-pulse' : ''}`} />
                <span className="text-2xl font-bold">
                  {status.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                </span>
              </div>

              {/* Message */}
              <div className="text-center">
                <p className={`text-lg ${status.available ? 'text-green-600' : 'text-red-600'}`}>
                  {status.message}
                </p>
                {status.details && (
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    {status.details}
                  </p>
                )}
                {status.error && (
                  <details className="mt-3 text-left">
                    <summary className="text-sm cursor-pointer text-[var(--text-muted)] hover:underline">
                      Show technical details
                    </summary>
                    <p className="mt-2 text-xs text-[var(--text-muted)] bg-[var(--bg-primary)] p-3 rounded border border-[var(--border-color)] whitespace-pre-wrap break-words">
                      {status.error}
                    </p>
                  </details>
                )}
              </div>

              {/* Last Checked */}
              <div className="text-center text-sm text-[var(--text-muted)]">
                Last checked: {status.checkedAt}
                {loading && <span className="ml-2">(refreshing...)</span>}
              </div>

              {/* Info Box */}
              {!status.available && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                  <p className="font-semibold mb-2">
                    {status.limitType === 'daily' ? '⚠️ Daily Limit Reached' : 
                     status.limitType === 'minute' ? 'Per-Minute Limit' : 
                     'Groq Unavailable'}
                  </p>
                  
                  {status.limitType === 'daily' ? (
                    <div className="space-y-2">
                      <p>The free Groq tier has a daily token limit that has been exhausted.</p>
                      <p className="font-semibold">This limit resets at midnight UTC.</p>
                      <p className="text-xs">
                        Current UTC time: {new Date().toUTCString()}
                      </p>
                      <p className="mt-3">
                        💡 New articles will use fallback content until the limit resets.
                        You can rewrite them later when Groq is available.
                      </p>
                    </div>
                  ) : status.limitType === 'minute' ? (
                    <div className="space-y-2">
                      <p>Too many requests in a short time. Please wait a moment.</p>
                      <p className="mt-3">
                        This is a temporary limit - check back in 1-2 minutes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>Possible reasons:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Daily token limit reached (resets at midnight UTC)</li>
                        <li>Rate limit per minute (wait 1-2 minutes)</li>
                        <li>Service temporarily down</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {status.available && (
                <div className="bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                  <p className="font-semibold mb-2">✓ Groq is ready!</p>
                  <p>
                    The API has been tested with realistic token usage and is ready to generate full articles.
                  </p>
                  <p className="mt-2">
                    You can now generate new articles or rewrite fallback articles.
                    Go to an article with fallback content and click &quot;Rewrite Article&quot;.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* Controls */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={checkGroq}
              disabled={loading}
              className="px-6 py-3 bg-[var(--gold-accent)] text-black font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Now'}
            </button>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm">Auto-refresh (30s)</span>
            </label>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="text-[var(--gold-accent)] hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}

