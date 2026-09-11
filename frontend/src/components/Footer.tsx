import React, { useState } from 'react';
import { Mail, Globe, ChevronDown } from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { SportId } from '../types';

export const Footer: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const {
    setAppMode,
    setActiveSport,
    setActiveSubTab,
    setBonusesModalOpen,
    setLoginModalOpen,
    openAuthModal,
  } = useBetting();

  // Column 1: Sport Betting
  const sportBettingLinks: { title: string; sportId?: SportId; action?: string }[] = [
    { title: 'Football / Soccer', sportId: 'football' },
    { title: 'Ethiopian Premier League', sportId: 'football' },
    { title: 'Basketball', sportId: 'basketball' },
    { title: 'Tennis', sportId: 'tennis' },
    { title: 'Live Match Tracker', action: 'tracker' },
    { title: 'Table Tennis', sportId: 'table_tennis' },
    { title: 'Volleyball', sportId: 'volleyball' },
    { title: 'Esports & Virtuals', sportId: 'esports' },
  ];

  // Column 2: Betting
  const bettingLinks = [
    { title: 'Live In-Play Betting', action: 'live' },
    { title: 'Sportsbook', action: 'sportsbook' },
    { title: 'Multi-Bet Parlays', action: 'bonuses' },
    { title: 'Crypto 5M Up / Down', action: 'crypto' },
    { title: 'Perps & 20x Leverage', action: 'perps' },
    { title: 'Promotions & Bonuses', action: 'bonuses' },
    { title: 'Cash Out & Settled Bets', action: 'cashout' },
    { title: 'Betting Statistics', action: 'stats' },
  ];

  // Column 3: Information
  const infoLinks = [
    { title: 'How to Place a Bet' },
    { title: 'Rules & Settlements' },
    { title: 'Responsible Gaming' },
    { title: 'Fayda Age Verification' },
    { title: 'FAQ & Help Center' },
    { title: 'Terms of Service' },
    { title: 'Privacy Policy' },
    { title: 'AML & Compliance' },
  ];

  // Column 4: Support & Social
  const supportLinks = [
    'Contact Us',
    'Telegram Support',
    '𝕏 (Twitter)',
    'Instagram',
    'Discord',
    'TikTok',
    'News & Updates',
    'Help Center',
    'System Status',
  ];

  // Column 5: Polymarket
  const polymarketLinks = [
    'Prediction Markets',
    'Rewards Program',
    'Developer APIs & CLOB',
    'Global Leaderboard',
    'Oracle Resolution',
    'Institutional Trading',
    'Brand & Press',
    'Admin Console',
  ];

  const handleSportClick = (item: (typeof sportBettingLinks)[0]) => {
    setAppMode('1xbet');
    if (item.sportId) {
      setActiveSport(item.sportId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBettingClick = (item: (typeof bettingLinks)[0]) => {
    if (item.action === 'crypto' || item.action === 'perps') {
      setAppMode('polymarket');
    } else if (item.action === 'bonuses') {
      setBonusesModalOpen(true);
      return;
    } else if (item.action === 'live') {
      setAppMode('1xbet');
      setActiveSubTab('live');
    } else {
      setAppMode('1xbet');
      setActiveSubTab('all');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInfoClick = (_title: string) => {
    setBonusesModalOpen(true);
  };

  const handleSupportLinkClick = (linkName: string) => {
    if (linkName === 'Contact Us' || linkName === 'Telegram Support') {
      setLoginModalOpen(true);
    } else if (linkName === 'Help Center') {
      setBonusesModalOpen(true);
    }
  };

  const handlePolymarketLinkClick = (linkName: string) => {
    if (linkName === 'Admin Console') {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (linkName === 'Prediction Markets' || linkName === 'Rewards Program') {
      setAppMode('polymarket');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setBonusesModalOpen(true);
    }
  };

  const handleLegalClick = (name: string) => {
    if (name === 'Admin Console') {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (name === 'Sign In' || name === 'Registration') {
      openAuthModal('signup');
    } else {
      setBonusesModalOpen(true);
    }
  };

  return (
    <footer id="main-footer" className="w-full bg-[#101217] text-white border-t border-[#1f2330] mt-12 pt-12 pb-8 select-none">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Header: Unified ሃገራዊ BETTING & Polymarket */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-5">
            {/* Sports Brand */}
            <div
              onClick={() => {
                setAppMode('1xbet');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[#0F1B2A] ring-1.5 ring-[#8DC63F]/50 group-hover:ring-[#8DC63F] group-hover:scale-105 transition-all shadow-md shrink-0">
                <img
                  src="/hagerawi-logo.png"
                  alt="ሃገራዊ Logo"
                  className="w-full h-full object-cover select-none"
                />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white group-hover:text-[#8DC63F] transition-colors">
                  ሃገራዊ <span className="text-[#8DC63F]">SPORT BETTING</span> <span className="text-[#ffc600]">& MARKET</span>
                </span>
                <p className="text-[10px] text-neutral-400 font-medium">
                  Ethiopia's Premier Sportsbook & Prediction Market
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              24/7 LIVE PLATFORM
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px] font-semibold">
              INSTANT SETTLEMENT
            </span>
          </div>
        </div>

        {/* Main 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 pb-12 border-b border-[#212534]">
          {/* Column 1 - Sport Betting */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Sport Betting
            </h4>
            <div className="flex flex-col gap-2.5">
              {sportBettingLinks.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleSportClick(item)}
                  className="text-sm text-neutral-300 hover:text-white transition-colors text-left cursor-pointer"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Column 2 - Betting */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Betting
            </h4>
            <div className="flex flex-col gap-2.5">
              {bettingLinks.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleBettingClick(item)}
                  className="text-sm text-neutral-300 hover:text-white transition-colors text-left cursor-pointer"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Column 3 - Information */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Information
            </h4>
            <div className="flex flex-col gap-2.5">
              {infoLinks.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleInfoClick(item.title)}
                  className="text-sm text-neutral-300 hover:text-white transition-colors text-left cursor-pointer"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Column 4 - Support & Social */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Support & Social
            </h4>
            <div className="flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => handleSupportLinkClick(link)}
                  className="text-sm text-neutral-300 hover:text-white transition-colors text-left cursor-pointer"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          {/* Column 5 - Polymarket */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Polymarket
            </h4>
            <div className="flex flex-col gap-2.5">
              {polymarketLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => handlePolymarketLinkClick(link)}
                  className={`text-sm transition-colors text-left cursor-pointer ${
                    link === 'Admin Console'
                      ? 'text-emerald-400 hover:text-emerald-300 font-semibold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Social Icons + Legal Links + Language Selector */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          {/* Social Icons */}
          <div className="flex items-center gap-4 text-neutral-300">
            <button
              type="button"
              onClick={() => setBonusesModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
              title="Email Newsletter"
            >
              <Mail className="w-4 h-4" />
            </button>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors cursor-pointer font-bold text-xs"
              title="𝕏 (Twitter)"
            >
              𝕏
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors cursor-pointer"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors cursor-pointer"
              title="Discord"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors cursor-pointer"
              title="TikTok"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.48 2.78 1.26-.04 2.4-1.03 2.68-2.26.11-.47.16-.95.16-1.43.02-4.63.01-9.26.01-13.88.01-1.38.01-2.76.01-4.14z"/>
              </svg>
            </a>
          </div>

          {/* Legal / Company Notice */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-normal">
            <span className="font-semibold text-neutral-300">ሃገራዊ SPORT BETTING & MARKET & Polymarket © 2026</span>
            <span>·</span>
            <button type="button" onClick={() => handleLegalClick('Privacy')} className="hover:text-neutral-200 transition-colors cursor-pointer">Privacy</button>
            <span>·</span>
            <button type="button" onClick={() => handleLegalClick('Terms of Use')} className="hover:text-neutral-200 transition-colors cursor-pointer">Terms of Use</button>
            <span>·</span>
            <button type="button" onClick={() => handleLegalClick('Responsible Gaming')} className="hover:text-neutral-200 transition-colors cursor-pointer">Responsible Gaming (21+)</button>
            <span>·</span>
            <button type="button" onClick={() => handleLegalClick('Transparency')} className="hover:text-neutral-200 transition-colors cursor-pointer">Transparency</button>
            <span>·</span>
            <button type="button" onClick={() => handleLegalClick('Help Center')} className="hover:text-neutral-200 transition-colors cursor-pointer">Help Center</button>
            <span>·</span>
            <button type="button" onClick={() => handleLegalClick('Admin Console')} className="hover:text-emerald-300 font-semibold transition-colors cursor-pointer">Admin Console</button>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c202a] hover:bg-[#262c3a] border border-[#2b3142] text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{selectedLanguage}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 bg-[#1c202a] border border-[#2b3142] rounded-lg shadow-xl py-1 z-30 min-w-[130px]">
                {['English', 'አማርኛ (Amharic)', 'Español', 'Français', 'Deutsch', '中文', '日本語'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                      selectedLanguage === lang
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-neutral-300 hover:bg-[#252b39] hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Regulatory Disclaimer Text */}
        <div className="pt-4 border-t border-[#1c202c] text-[11px] text-neutral-500 leading-relaxed space-y-1.5">
          <p>
            ሃገራዊ SPORT BETTING & MARKET is licensed and regulated under Ethiopian national gaming regulations and lottery administration frameworks. Access is strictly restricted to verified persons aged 21 and older with valid Fayda identification. Please gamble responsibly.
          </p>
          <p>
            Polymarket prediction markets operate globally via decentralized contract mechanisms. Prediction markets involve risk of loss and are not available to prohibited jurisdictions.
          </p>
        </div>
      </div>
    </footer>
  );
};
