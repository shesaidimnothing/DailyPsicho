'use client';

import { useAuth } from './AuthContext';

interface ArticleBadgesProps {
  articleId: string;  // Use unique article ID instead of date
  showLabels?: boolean;
}

export default function ArticleBadges({ articleId, showLabels = false }: ArticleBadgesProps) {
  const { readArticles, rewrittenIds } = useAuth();

  const isRead = readArticles.includes(articleId);
  const isRewritten = rewrittenIds.includes(articleId);

  if (!isRead && !isRewritten) return null;

  return (
    <div className="flex gap-2 items-center">
      {isRead && (
        <span 
          className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs uppercase tracking-wider"
          title="You've read this article"
        >
          <span>✓</span>
          {showLabels && <span>Read</span>}
        </span>
      )}
      {isRewritten && (
        <span 
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs uppercase tracking-wider"
          title="This article has been rewritten"
        >
          <span>↻</span>
          {showLabels && <span>Rewritten</span>}
        </span>
      )}
    </div>
  );
}
