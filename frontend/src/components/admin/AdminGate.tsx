import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import { isAdminUnlocked, unlockAdmin } from '../../hooks/useAdminAccess';

/**
 * Client-side gate for the admin console routes (/admin, /admin/polymarket).
 *
 * The Admin Console links in the footer/settings are hidden for non-admins, but
 * the /admin path itself is also protected here: anyone who types the URL
 * manually still has to enter the admin passphrase once per browser session
 * (persisted in sessionStorage).
 *
 * NOTE: this is a UI-level gate only. The backend admin endpoints are still
 * public by design — do not treat this as real authorization.
 */

const ADMIN_PASSPHRASE = 'hagerawi/admin';

interface AdminGateProps {
  children: React.ReactNode;
}

export const AdminGate: React.FC<AdminGateProps> = ({ children }) => {
  const [unlocked, setUnlocked] = useState<boolean>(isAdminUnlocked);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === ADMIN_PASSPHRASE) {
      unlockAdmin();
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-[#161b22] border border-white/10 shadow-2xl p-8"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white font-mono tracking-wider uppercase">
              FIDA<span className="text-emerald-400">BET</span> ADMIN
            </h1>
            <p className="text-[11px] text-neutral-400 mt-1 font-mono">
              Restricted area · authentication required
            </p>
          </div>
          <div className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0d1117] border border-white/10 text-[11px] text-neutral-400 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">/admin</span>
          </div>
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Admin passphrase"
            autoFocus
            className={`w-full px-4 py-2.5 rounded-lg bg-[#0d1117] border text-sm text-white font-mono placeholder-neutral-500 outline-none transition-colors ${
              error
                ? 'border-red-500/70 focus:border-red-400'
                : 'border-white/10 focus:border-emerald-500/60'
            }`}
          />
          {error && (
            <p className="text-[11px] text-red-400 font-mono -mt-2">
              Incorrect passphrase. Access denied.
            </p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold uppercase tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Unlock Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-[11px] text-neutral-400 hover:text-white font-mono transition-colors cursor-pointer"
          >
            ← Back to site
          </button>
        </div>
      </form>
    </div>
  );
};
