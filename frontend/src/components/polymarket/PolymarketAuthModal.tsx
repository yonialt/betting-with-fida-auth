import React, { useState } from 'react';
import { X, Mail, Shield, Check } from 'lucide-react';
import { useBetting } from '../../context/BettingContext';

interface PolymarketAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const PolymarketAuthModal: React.FC<PolymarketAuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { loginUser, registerUser, setNotification, polymarketDarkMode } = useBetting();
  const isLight = !polymarketDarkMode;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Authenticate with Google
    const username = 'poly_trader_' + Math.floor(1000 + Math.random() * 9000);
    await registerUser({
      username,
      email: `${username}@gmail.com`,
      password: 'polyUserSecret123!',
      phone: '+251911' + Math.floor(100000 + Math.random() * 900000),
    });
    setLoading(false);
    setNotification?.({
      message: `Signed in with Google as ${username}`,
      type: 'info',
    });
    onClose();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setNotification?.({
        message: 'Please enter a valid email address',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    const username = email.split('@')[0] || 'poly_user';
    await registerUser({
      username,
      email: email.trim(),
      password: 'polyUserSecret123!',
      phone: '+251911' + Math.floor(100000 + Math.random() * 900000),
    });
    setLoading(false);
    setNotification?.({
      message: `Welcome to Polymarket, ${username}!`,
      type: 'info',
    });
    onClose();
  };

  const handleSocialWallet = async (provider: string) => {
    setLoading(true);
    const username = `${provider.toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`;
    await registerUser({
      username,
      email: `${username}@web3.eth`,
      password: 'polyUserSecret123!',
      phone: '+251911' + Math.floor(100000 + Math.random() * 900000),
    });
    setLoading(false);
    setNotification?.({
      message: `Connected via ${provider} as ${username}!`,
      type: 'info',
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150 ${isLight ? 'bg-black/40' : 'bg-black/70'}`}>
      <div
        id="polymarket-welcome-modal"
        className={`${isLight ? 'pm-body bg-white text-neutral-800 border-neutral-200' : 'bg-[#121824] text-white border-[#1e293b]'} border rounded-2xl w-full max-w-[420px] p-6 sm:p-7 shadow-2xl relative text-center`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1b2536] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Polymarket Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#172133] border border-[#2b3a52] flex items-center justify-center shadow-lg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7"
            >
              <path d="M12 2.5L21.5 8V16L12 21.5L2.5 16V8L12 2.5Z" />
              <path d="M12 2.5V21.5" />
              <path d="M2.5 8L21.5 16" />
              <path d="M2.5 16L21.5 8" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-6">Welcome to Polymarket</h2>

        {/* Continue with Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-11 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md active:scale-98 mb-5"
        >
          {/* Google Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* OR Divider */}
        <div className="flex items-center gap-3 my-5 text-xs text-neutral-500 uppercase font-bold tracking-wider">
          <div className="flex-1 h-px bg-[#1e293b]" />
          <span>OR</span>
          <div className="flex-1 h-px bg-[#1e293b]" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="mb-6">
          <div className="relative flex items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full h-11 bg-[#090d14] border border-[#1e2738] rounded-xl pl-4 pr-24 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3.5 bg-[#0070e0] hover:bg-[#0080ff] text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Continue
            </button>
          </div>
        </form>

        {/* Social / Web3 Wallet Icons Row */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {/* Discord */}
          <button
            onClick={() => handleSocialWallet('Discord')}
            title="Discord"
            className="w-9 h-9 rounded-xl bg-[#151d2a] hover:bg-[#1d273a] border border-[#223046] flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <span className="font-bold text-xs">🎮</span>
          </button>

          {/* Apple */}
          <button
            onClick={() => handleSocialWallet('Apple')}
            title="Apple"
            className="w-9 h-9 rounded-xl bg-[#151d2a] hover:bg-[#1d273a] border border-[#223046] flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <span className="font-bold text-xs">🍎</span>
          </button>

          {/* Phantom */}
          <button
            onClick={() => handleSocialWallet('Phantom')}
            title="Phantom"
            className="w-9 h-9 rounded-xl bg-[#151d2a] hover:bg-[#1d273a] border border-[#223046] flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all cursor-pointer"
          >
            <span className="font-bold text-xs">👻</span>
          </button>

          {/* MetaMask */}
          <button
            onClick={() => handleSocialWallet('MetaMask')}
            title="MetaMask"
            className="w-9 h-9 rounded-xl bg-[#151d2a] hover:bg-[#1d273a] border border-[#223046] flex items-center justify-center text-amber-500 hover:text-amber-400 transition-all cursor-pointer"
          >
            <span className="font-bold text-xs">🦊</span>
          </button>

          {/* Coinbase */}
          <button
            onClick={() => handleSocialWallet('Coinbase')}
            title="Coinbase"
            className="w-9 h-9 rounded-xl bg-[#151d2a] hover:bg-[#1d273a] border border-[#223046] flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all cursor-pointer"
          >
            <span className="font-bold text-xs">🔵</span>
          </button>

          {/* WalletConnect */}
          <button
            onClick={() => handleSocialWallet('WalletConnect')}
            title="WalletConnect"
            className="w-9 h-9 rounded-xl bg-[#151d2a] hover:bg-[#1d273a] border border-[#223046] flex items-center justify-center text-sky-400 hover:text-sky-300 transition-all cursor-pointer"
          >
            <span className="font-bold text-xs">⚡</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#1e2738] text-[11px] text-neutral-500 font-medium">
          Terms • Privacy
        </div>
      </div>
    </div>
  );
};
