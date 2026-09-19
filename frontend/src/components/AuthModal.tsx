import React, { useEffect, useState } from 'react';
import { X, Loader2, LogIn, UserPlus, User, Phone, Mail, Lock } from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import {
  validateUsername,
  validatePhone,
  validateEmail,
  validatePassword,
  validateConfirm,
  type FieldErrors,
} from '../utils/validation';

type AuthMode = 'login' | 'signup';

/** Inline validation message under a form field. */
const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="mt-1 text-[11px] font-semibold text-red-600">{msg}</p> : null;

/** Input border turns red while the field has a validation error. */
const inputCls = (hasError: boolean) =>
  `w-full bg-white border rounded px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden transition-colors ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-neutral-300 focus:border-[#0091ff]'
  }`;

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
      setFieldErrors({});
      setLoading(false);
    }
  }, [authModalOpen, authModalMode]);

  if (!authModalOpen) return null;

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setAuthModalMode(next);
    setError('');
    setFieldErrors({});
  };  /** Run every rule for the active mode; returns true when all pass. */
  const runValidation = (): boolean => {
    const errs: FieldErrors = {};

    if (mode === 'signup') {
      errs.username = validateUsername(username);
      errs.phone = validatePhone(phone);
      errs.email = validateEmail(email);
      errs.password = validatePassword(password);
      errs.confirmPassword = validateConfirm(confirmPassword, password);
    } else {
      // Login: identifier + non-empty password (server verifies the rest).
      const id = username.trim();
      if (!id) errs.username = 'Username or phone is required';
      if (!password) errs.password = 'Password is required';
    }

    setFieldErrors(errs);
    return Object.values(errs).every((v) => !v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!runValidation()) return;

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
                    className={inputCls(!!fieldErrors.username)}
                  />
                  <FieldError msg={fieldErrors.username} />
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
                    className={inputCls(!!fieldErrors.phone)}
                  />
                  <FieldError msg={fieldErrors.phone} />
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
                    className={inputCls(!!fieldErrors.email)}
                  />
                  <FieldError msg={fieldErrors.email} />
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
                  placeholder="Username or +251911000000"
                  autoComplete="username"
                  autoFocus
                  className={inputCls(!!fieldErrors.username)}
                />
                <FieldError msg={fieldErrors.username} />
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
                className={inputCls(!!fieldErrors.password)}
              />
              <FieldError msg={fieldErrors.password} />
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
                className={inputCls(!!fieldErrors.confirmPassword)}
              />
              <FieldError msg={fieldErrors.confirmPassword} />
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
