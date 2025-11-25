'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
}

interface RewriteResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  debug?: Record<string, unknown>;
}

interface AuthContextType {
  user: User | null;
  readArticles: string[];
  rewrittenDates: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  markAsRead: (date: string) => Promise<boolean>;
  rewriteArticle: (date: string) => Promise<RewriteResult>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [rewrittenDates, setRewrittenDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user || null);
      setReadArticles(data.readArticles || []);
      setRewrittenDates(data.rewrittenDates || []);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setReadArticles([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const markAsRead = async (date: string) => {
    if (!user) return false;
    
    try {
      const res = await fetch('/api/articles/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const data = await res.json();
      
      if (data.success) {
        setReadArticles(prev => [...new Set([...prev, date])]);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const rewriteArticle = async (date: string): Promise<RewriteResult> => {
    if (!user) {
      return { 
        success: false, 
        error: 'You must be logged in to rewrite articles',
        errorCode: 'NOT_AUTHENTICATED'
      };
    }
    
    console.log('[AuthContext] Starting rewrite for date:', date);
    
    try {
      const res = await fetch('/api/articles/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      
      console.log('[AuthContext] Rewrite response status:', res.status);
      
      const data = await res.json();
      console.log('[AuthContext] Rewrite response data:', data);
      
      if (data.success) {
        setRewrittenDates(prev => [...new Set([...prev, date])]);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: data.error || 'Unknown error occurred',
        errorCode: data.errorCode,
        debug: data.debug
      };
    } catch (error) {
      console.error('[AuthContext] Rewrite exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { 
        success: false, 
        error: `Network error: ${errorMessage}`,
        errorCode: 'NETWORK_ERROR',
        debug: { exception: errorMessage }
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      readArticles,
      rewrittenDates,
      loading,
      login,
      register,
      logout,
      markAsRead,
      rewriteArticle,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
