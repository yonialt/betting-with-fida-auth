import React, { useEffect, useState } from 'react';
import { X, Loader2, LogIn, UserPlus, ShieldCheck, User, Phone, Mail, Lock } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

type AuthMode = 'login' | 'signup';

/**
 * Shared Sign up / Log in modal.
 * One account session is used across both Sport Betting (1xBET/Hagerawi) and Polymarket.
 */
export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginUser,
    registerUser,
  } = useBetting();

  const [mode, setMode] = useState<AuthMode>(authModalMode);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync tab + reset fields every time the modal opens
  useEffect(() => {
    if (authModalOpen) {
      setMode(authModalMode);
      setUsername('');
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setLoading(false);
    }
  }, [authModalOpen, authModalMode]);

  if (!authModalOpen) return null;

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setAuthModalMode(next);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (mode === 'signup') {
      if (phone.trim().length < 7) {
        setError('Please enter a valid phone number');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    const result =
      mode === 'login'
        ? await loginUser(username, password)
        : await registerUser({ username: username.trim(), phone: phone.trim(), email: email.trim() || undefined, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  const fillDemoAccount = () => {
    setUsername('Player_8831');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div
        id="auth-modal"
        className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-neutral-200"
      >
        {/* Header */}
        <div className="bg-[#1e2329] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ffc600] text-black flex items-center justify-center">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h3>
              <p className="text-[11px] text-neutral-400">One account for Sport Betting & Polymarket</p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switch */}
        <div className="grid grid-cols-2 gap-1 p-3 bg-[#f4f6f8] border-b border-neutral-200">
          <button
            onClick={() => switchMode('login')}
            className={`py-2 rounded text-xs font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#1e2329] text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/70'
            }`}
          >
            LOG IN
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`py-2 rounded text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#0091ff] text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/70'
            }`}
          >
            SIGN UP
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5">
          {/* Error */}
          {error && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="space-y-3">
                {/* Username */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1">
                    <User className="w-3 h-3 text-neutral-400" /> Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    autoComplete="username"
                    className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-[#0091ff]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1">
                    <Phone className="w-3 h-3 text-neutral-400" /> Phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +251911000000"
                    autoComplete="tel"
                    className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-[#0091ff]"
                  />
                </div>

                {/* Email (optional) */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1">
                    <Mail className="w-3 h-3 text-neutral-400" /> Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-[#0091ff]"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1">
                  <User className="w-3 h-3 text-neutral-400" /> Username or phone
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Player_8831 or +251911000000"
                  autoComplete="username"
                  autoFocus
                  className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-[#0091ff]"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1">
                <Lock className="w-3 h-3 text-neutral-400" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-[#0091ff]"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1">
                  <Lock className="w-3 h-3 text-neutral-400" /> Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-[#0091ff]"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'login' ? 'bg-[#1e2329] hover:bg-black' : 'bg-[#0091ff] hover:bg-[#007ad6]'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </>
              ) : mode === 'login' ? (
                'Log in'
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          {/* Demo hint (only on login) */}
          {mode === 'login' && (
            <div className="flex items-start gap-2 p-2.5 bg-[#fff8e1] border border-amber-200 rounded text-xs text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Demo account:</span> Player_8831 / password123.{' '}
                <button
                  onClick={fillDemoAccount}
                  className="underline font-semibold hover:text-amber-900 cursor-pointer"
                >
                  Fill it in
                </button>
              </div>
            </div>
          )}

          {/* Switch prompt */}
          <div className="text-center text-xs text-neutral-500">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-[#0091ff] font-bold hover:underline cursor-pointer"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-[#0091ff] font-bold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
