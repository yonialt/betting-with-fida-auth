import React, { useState } from 'react';
import {
  X,
  Sliders,
  Check,
  Volume2,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Coins,
  ArrowRight,
  Sparkles,
  Gift,
  Copy,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { OddsAcceptanceMode } from '../types';

export const SettingsModal: React.FC = () => {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    oddsAcceptanceMode,
    setOddsAcceptanceMode,
    stakeAmount,
    setStakeAmount,
    user,
  } = useBetting();

  const [oddsFormat, setOddsFormat] = useState<string>(() => {
    try {
      return localStorage.getItem('fidabet_odds_format') || 'decimal';
    } catch {
      return 'decimal';
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fidabet_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const [oddsHighlight, setOddsHighlight] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fidabet_odds_highlight') !== 'false';
    } catch {
      return true;
    }
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);

  if (!settingsModalOpen) return null;

  // Personal referral link — earn 2 Birr for every bet a friend places.
  const referralCode =
    user?.isLoggedIn && user?.username && user.username !== 'Guest'
      ? user.username.replace(/\s+/g, '').toUpperCase().slice(0, 14)
      : 'HAGERAWI2BIRR';
  const referralLink = `https://hagerawi.bet/join?ref=${referralCode}`;

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {
      // Fallback for browsers without the async clipboard API
      try {
        const tmp = document.createElement('textarea');
        tmp.value = referralLink;
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      } catch {
        // ignore
      }
    }
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 1800);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('fidabet_odds_format', oddsFormat);
      localStorage.setItem('fidabet_sound_enabled', String(soundEnabled));
      localStorage.setItem('fidabet_odds_highlight', String(oddsHighlight));
    } catch {}

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSettingsModalOpen(false);
    }, 450);
  };

  const oddsFormatOptions = [
    { id: 'decimal', name: 'Decimal', example: '1.85', tag: 'Default' },
    { id: 'fractional', name: 'Fractional', example: '17/20' },
    { id: 'american', name: 'American', example: '-118' },
    { id: 'hongkong', name: 'Hong Kong', example: '0.85' },
  ];

  const acceptanceOptions: {
    id: OddsAcceptanceMode;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'increase',
      title: 'Accept Higher Odds Only',
      description: 'Auto-accepts if payouts improve; pauses if odds drop',
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
      badge: 'Recommended',
    },
    {
      id: 'any',
      title: 'Accept Any Odds Change',
      description: 'Fastest placement; never rejects a slip during live price shifts',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'ask',
      title: 'Always Ask Confirmation',
      description: 'Strict manual review; prompts confirmation on any price change',
      icon: <Shield className="w-4 h-4 text-blue-600" />,
    },
  ];

  const quickStakes = [20, 50, 100, 250, 500];

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150"
      onClick={() => setSettingsModalOpen(false)}
    >
      <div
        id="settings-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-neutral-800 animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header: #1b2838 matching navbar */}
        <div
          className="px-5 py-4 flex items-center justify-between text-white shadow-xs"
          style={{ backgroundColor: '#1b2838' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-400 shadow-inner">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15.5px] text-white tracking-tight leading-tight">
                Betting & Interface Settings
              </h3>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Configure odds display, slip execution rules, and live alerts
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings-modal"
            onClick={() => setSettingsModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal White Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar text-xs bg-white">
          {/* Refer & Earn — personal referral link (this is where the INVITE & EARN banner CTA lands) */}
          <div
            id="referral-link-section"
            className="space-y-2.5 p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
          >
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-emerald-600" />
                Refer &amp; Earn — 2 Birr per bet
              </label>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                Rewards
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-snug">
              Share your personal link — you earn{' '}
              <span className="font-bold text-emerald-700">2 Birr</span> cashback on every bet a
              friend places on ሃገራዊ.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-[11px] font-mono font-semibold text-neutral-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs truncate"
              />
              <button
                type="button"
                id="btn-copy-referral"
                onClick={handleCopyReferral}
                className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer shadow-2xs active:scale-[0.98] text-white ${
                  copiedReferral ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {copiedReferral ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 1: Odds Format Segmented Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Odds Format
              </label>
              <span className="text-[11px] text-neutral-500 font-medium">Selected: {oddsFormat}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {oddsFormatOptions.map((opt) => {
                const isSelected = oddsFormat === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOddsFormat(opt.id)}
                    className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[64px] ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-neutral-50/80 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/70 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-[12px] ${isSelected ? 'text-emerald-900' : 'text-neutral-800'}`}>
                        {opt.name}
                      </span>
                      {isSelected && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`font-mono text-[12px] font-extrabold ${isSelected ? 'text-emerald-700' : 'text-neutral-500'}`}>
                        {opt.example}
                      </span>
                      {opt.tag && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                          {opt.tag}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Automatic Odds Acceptance Rules */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Live Odds Acceptance Policy
            </label>
            <div className="space-y-2">
              {acceptanceOptions.map((opt) => {
                const isSelected = oddsAcceptanceMode === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setOddsAcceptanceMode(opt.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                        : 'bg-neutral-50/70 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/70'
                    }`}
                  >
                    <div className={`mt-0.5 p-2 rounded-lg ${isSelected ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-neutral-200'}`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${isSelected ? 'text-emerald-950' : 'text-neutral-800'}`}>
                          {opt.title}
                        </span>
                        {opt.badge && (
                          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-200 uppercase tracking-wide">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                        {opt.description}
                      </p>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Default Quick Stake Amount */}
          <div className="space-y-2 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                Default Quick Stake Amount
              </label>
              <span className="text-[11px] font-mono text-emerald-700 font-extrabold">
                {stakeAmount} {user?.currency || 'ETB'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-white border border-neutral-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-none transition-colors shadow-2xs"
                  placeholder="Stake amount"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-500">
                  {user?.currency || 'ETB'}
                </span>
              </div>
            </div>

            {/* Quick Stake Preset Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10.5px] text-neutral-500 mr-1">Presets:</span>
              {quickStakes.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setStakeAmount(preset)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                    stakeAmount === preset
                      ? 'bg-emerald-600 text-white border border-emerald-700 shadow-2xs'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Sound & Interactive Notifications */}
          <div className="space-y-2 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200">
            <div className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              Sound & Live Feedback
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Toggle 1: Sound Effects */}
              <div
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100/70 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-semibold text-[11.5px] text-neutral-800 block">
                    Goal & Winner Audio Alerts
                  </span>
                  <span className="text-[10.5px] text-neutral-500">
                    Play sound effects on live goals and winning settled tickets
                  </span>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                    soundEnabled ? 'bg-emerald-600' : 'bg-neutral-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-xs ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Toggle 2: Odds Fluctuation Glow */}
              <div
                onClick={() => setOddsHighlight(!oddsHighlight)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100/70 cursor-pointer transition-colors border-t border-neutral-200/80 pt-2"
              >
                <div>
                  <span className="font-semibold text-[11.5px] text-neutral-800 block">
                    Odds Fluctuation Animation
                  </span>
                  <span className="text-[10.5px] text-neutral-500">
                    Flash green/red pulses on dynamic market price movements
                  </span>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                    oddsHighlight ? 'bg-emerald-600' : 'bg-neutral-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-xs ${
                      oddsHighlight ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Developer Console Gateway */}
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center font-mono font-bold text-xs">
                &gt;_
              </div>
              <div>
                <span className="font-bold text-[11.5px] text-neutral-800 block">Engine & Live Odds Diagnostics</span>
                <span className="text-[10px] text-neutral-500">Spring Boot 3 + Redis + WebSocket monitor</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSettingsModalOpen(false);
                window.history.pushState({}, '', '/admin');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-all cursor-pointer"
            >
              <span>Admin Console</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Modal Footer with Actions: Crisp light footer + Green button */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSettingsModalOpen(false)}
            className="flex-1 py-2.5 bg-white hover:bg-neutral-100 text-neutral-700 font-bold text-xs rounded-xl border border-neutral-300 transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-save-settings"
            onClick={handleSave}
            className={`flex-1 py-2.5 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99] text-white ${
              savedSuccess
                ? 'bg-emerald-700 shadow-emerald-700/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{savedSuccess ? 'Preferences Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
