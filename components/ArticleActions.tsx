'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';

interface ArticleActionsProps {
  articleId: string;  // Unique article ID for tracking
  date: string;       // Date needed for rewrite API
  onRewriteComplete?: () => void;
}

interface ErrorDetails {
  message: string;
  code?: string;
  debug?: Record<string, unknown>;
}

export default function ArticleActions({ articleId, date, onRewriteComplete }: ArticleActionsProps) {
  const { user, readArticles, rewrittenIds, markAsRead, rewriteArticle } = useAuth();
  const [rewriting, setRewriting] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const isRead = readArticles.includes(articleId);
  const isRewritten = rewrittenIds.includes(articleId);

  const handleMarkAsRead = async () => {
    if (!user) return;
    await markAsRead(articleId);
  };

  const handleRewrite = async () => {
    if (!user) return;
    
    setRewriting(true);
    setError(null);
    
    const result = await rewriteArticle(date);
    
    setRewriting(false);
    
    if (result.success) {
      onRewriteComplete?.();
      // Reload the page to show new content
      window.location.reload();
    } else {
      setError({
        message: result.error || 'Failed to rewrite article',
        code: result.errorCode,
        debug: result.debug,
      });
    }
  };

  if (!user) {
    return (
      <div className="mt-8 p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] text-center">
        <p className="text-[var(--text-muted)] text-sm md:text-base">
          Sign in to mark articles as read and request rewrites
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 md:mt-12 border-t border-[var(--border-color)] pt-6 md:pt-8">
      <div className="flex flex-wrap gap-3 md:gap-4 items-center">
        {/* Mark as Read Button */}
        <button
          onClick={handleMarkAsRead}
          disabled={isRead}
          className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-semibold uppercase tracking-wider transition-all ${
            isRead
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-[var(--bg-accent)] active:bg-green-600 active:text-white'
          }`}
        >
          {isRead ? (
            <>
              <span>✓</span>
              <span>Read</span>
            </>
          ) : (
            <>
              <span>○</span>
              <span>Mark as Read</span>
            </>
          )}
        </button>

        {/* Rewrite Button */}
        <button
          onClick={handleRewrite}
          disabled={rewriting}
          className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-semibold uppercase tracking-wider transition-all ${
            isRewritten
              ? 'bg-blue-600 text-white'
              : 'bg-[var(--bg-accent)] active:bg-blue-600 active:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {rewriting ? (
            <>
              <span className="animate-spin">⟳</span>
              <span className="hidden sm:inline">Rewriting... (30-60s)</span>
              <span className="sm:hidden">Rewriting...</span>
            </>
          ) : isRewritten ? (
            <>
              <span>↻</span>
              <span>Rewrite Again</span>
            </>
          ) : (
            <>
              <span>↻</span>
              <span>Rewrite Article</span>
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-800 text-sm md:text-base">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">Rewrite Failed</p>
              <p className="mt-1">{error.message}</p>
              {error.code && (
                <p className="mt-1 text-xs md:text-sm text-red-600">
                  Error code: {error.code}
                </p>
              )}
            </div>
            {error.debug && (
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs md:text-sm underline shrink-0"
              >
                {showDebug ? 'Hide' : 'Details'}
              </button>
            )}
          </div>
          
          {showDebug && error.debug && (
            <pre className="mt-3 p-2 bg-red-100 text-xs overflow-x-auto rounded">
              {JSON.stringify(error.debug, null, 2)}
            </pre>
          )}
          
          <button
            onClick={() => setError(null)}
            className="mt-3 text-xs md:text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isRewritten && !error && (
        <p className="mt-4 text-xs md:text-sm text-[var(--text-muted)]">
          This article has been rewritten. Click &quot;Rewrite Again&quot; to generate a new version.
        </p>
      )}
    </div>
  );
}
