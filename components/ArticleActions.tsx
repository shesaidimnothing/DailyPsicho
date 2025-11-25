'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';

interface ArticleActionsProps {
  date: string;
  onRewriteComplete?: () => void;
}

interface ErrorDetails {
  message: string;
  code?: string;
  debug?: Record<string, unknown>;
}

export default function ArticleActions({ date, onRewriteComplete }: ArticleActionsProps) {
  const { user, readArticles, rewrittenDates, markAsRead, rewriteArticle } = useAuth();
  const [rewriting, setRewriting] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const isRead = readArticles.includes(date);
  const isRewritten = rewrittenDates.includes(date);

  const handleMarkAsRead = async () => {
    if (!user) return;
    await markAsRead(date);
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
      <div className="mt-8 p-4 border border-foreground/10 bg-foreground/5 text-center">
        <p className="text-foreground/60">
          Sign in to mark articles as read and request rewrites
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 border-t border-foreground/10 pt-8"
    >
      <div className="flex flex-wrap gap-4 items-center">
        {/* Mark as Read Button */}
        <button
          onClick={handleMarkAsRead}
          disabled={isRead}
          className={`flex items-center gap-2 px-6 py-3 font-semibold uppercase tracking-wider transition-all ${
            isRead
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-foreground/10 hover:bg-green-600 hover:text-white'
          }`}
        >
          {isRead ? (
            <>
              <span className="text-lg">✓</span>
              <span>Read</span>
            </>
          ) : (
            <>
              <span className="text-lg">○</span>
              <span>Mark as Read</span>
            </>
          )}
        </button>

        {/* Rewrite Button */}
        <button
          onClick={handleRewrite}
          disabled={rewriting}
          className={`flex items-center gap-2 px-6 py-3 font-semibold uppercase tracking-wider transition-all ${
            isRewritten
              ? 'bg-blue-600 text-white'
              : 'bg-foreground/10 hover:bg-blue-600 hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {rewriting ? (
            <>
              <span className="animate-spin">⟳</span>
              <span>Rewriting... (this may take 30-60 seconds)</span>
            </>
          ) : isRewritten ? (
            <>
              <span className="text-lg">↻</span>
              <span>Rewrite Again</span>
            </>
          ) : (
            <>
              <span className="text-lg">↻</span>
              <span>Rewrite Article</span>
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">Rewrite Failed</p>
              <p className="mt-1">{error.message}</p>
              {error.code && (
                <p className="mt-1 text-sm text-red-600">
                  Error code: {error.code}
                </p>
              )}
            </div>
            {error.debug && (
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-sm underline hover:no-underline"
              >
                {showDebug ? 'Hide details' : 'Show details'}
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
            className="mt-3 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isRewritten && !error && (
        <p className="mt-4 text-sm text-foreground/60">
          This article has been rewritten by a user. Click &quot;Rewrite Again&quot; to generate a new version.
        </p>
      )}
    </motion.div>
  );
}
