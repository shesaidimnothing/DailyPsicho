'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = mode === 'login' 
      ? await login(email, password)
      : await register(email, password);

    setLoading(false);

    if (result.success) {
      setEmail('');
      setPassword('');
      onClose();
    } else {
      setError(result.error || 'An error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[var(--bg-primary)] border-2 border-[var(--gold-accent)] p-6 md:p-8 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-muted)] text-2xl leading-none"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[var(--gold-accent)] text-2xl">🏛</span>
          <h2 className="font-title text-xl md:text-2xl font-bold mt-2">
            {mode === 'login' ? 'Welcome Back' : 'Join the Academy'}
          </h2>
          <p className="text-[var(--text-muted)] text-xs md:text-sm mt-1 font-heading tracking-wider">
            {mode === 'login' ? 'Enter the halls of wisdom' : 'Begin your journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2 font-heading">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm md:text-base"
              placeholder="scholar@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2 font-heading">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm md:text-base"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 md:py-3 bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-dark)] text-black font-semibold uppercase tracking-widest disabled:opacity-50 font-heading text-sm md:text-base"
          >
            {loading ? '...' : mode === 'login' ? 'Enter' : 'Join'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-5">
          <span className="flex-1 h-px bg-[var(--border-color)]" />
          <span className="text-[var(--gold-accent)]">❧</span>
          <span className="flex-1 h-px bg-[var(--border-color)]" />
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-xs md:text-sm text-[var(--text-muted)]"
          >
            {mode === 'login' 
              ? "New here? Create an account" 
              : 'Already a member? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
