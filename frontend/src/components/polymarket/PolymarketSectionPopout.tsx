import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Gift,
  Code,
  FileText,
  HelpCircle,
  Shield,
  X,
  Activity,
  Wallet,
  TrendingUp,
  TrendingDown,
  LogIn,
  RefreshCw,
} from 'lucide-react';
import { useBetting } from '../../context/BettingContext';
import {
  polymarketTradingApi,
  PmPortfolioSummary,
  PM_PORTFOLIO_CHANGED,
} from '../../services/polymarketTradingApi';

export type PolymarketSection =
  | 'Rewards'
  | 'APIs'
  | 'Documentation'
  | 'Help Center'
  | 'Terms of Use';

interface PolymarketSectionPopoutProps {
  section: PolymarketSection | null;
  onClose: () => void;
}

const SECTION_META: Record<
  PolymarketSection,
  { icon: React.ReactNode; title: string; blurb: string }
> = {
  Rewards: {
    icon: <Gift className="w-4 h-4 text-emerald-400" />,
    title: 'Rewards',
    blurb: 'Your live prediction-market snapshot — cash, positions and realized P/L.',
  },
  APIs: {
    icon: <Code className="w-4 h-4 text-cyan-400" />,
    title: 'APIs',
    blurb: 'Programmatic access to the ሃገራዊ prediction market pipeline.',
  },
  Documentation: {
    icon: <FileText className="w-4 h-4 text-neutral-400" />,
    title: 'Documentation',
    blurb: 'How trading on ሃገራዊ prediction markets works.',
  },
  'Help Center': {
    icon: <HelpCircle className="w-4 h-4 text-neutral-400" />,
    title: 'Help Center',
    blurb: 'Quick answers about trading, deposits and settlements.',
  },
  'Terms of Use': {
    icon: <Shield className="w-4 h-4 text-neutral-400" />,
    title: 'Terms of Use',
    blurb: 'The rules every trader agrees to when using ሃገራዊ.',
  },
};

const fmtMoney = (n: number, currency = 'ETB') =>
  `${n < 0 ? '-' : ''}${Math.abs(n).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ${currency}`;

export const PolymarketSectionPopout: React.FC<PolymarketSectionPopoutProps> = ({
  section,
  onClose,
}) => {
  const { polymarketDarkMode, user, openAuthModal } = useBetting();
  const isLight = !polymarketDarkMode;
  const [portfolio, setPortfolio] = useState<PmPortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!user?.isLoggedIn;

  // Load the real portfolio snapshot for the Rewards section.
  useEffect(() => {
    if (section !== 'Rewards' || !isLoggedIn) {
      setPortfolio(null);
      setError(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await polymarketTradingApi.portfolio();
        if (!cancelled) setPortfolio(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load portfolio');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    // Refresh when a trade settles elsewhere in the app.
    const onChange = () => load();
    window.addEventListener(PM_PORTFOLIO_CHANGED, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(PM_PORTFOLIO_CHANGED, onChange);
    };
  }, [section, isLoggedIn]);

  if (!section) return null;

  const meta = SECTION_META[section];

  const body = () => {
    switch (section) {
      case 'Rewards':
        return <RewardsBody />;
      case 'APIs':
        return <ApisBody />;
      case 'Documentation':
        return <DocumentationBody />;
      case 'Help Center':
        return <HelpBody />;
      case 'Terms of Use':
        return <TermsBody />;
    }
  };

  const RewardsBody = () => {
    if (!isLoggedIn) {
      return (
        <div className="text-center py-4 space-y-3">
          <div className="mx-auto w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[12.5px] leading-snug opacity-80">
            Sign in to see your live portfolio — cash balance, open positions, unrealized
            P/L and your won/lost record.
          </p>
          <button
            onClick={() => {
              onClose();
              openAuthModal('login');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in</span>
          </button>
        </div>
      );
    }
    if (loading && !portfolio) {
      return (
        <div className="flex items-center justify-center gap-2 py-8 text-[12px] opacity-60">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Loading your snapshot…</span>
        </div>
      );
    }
    if (error || !portfolio) {
      return (
        <div className="text-center py-6 text-[12px] opacity-70">
          {error || 'No portfolio data available yet.'}
        </div>
      );
    }
    const rows: {
      label: string;
      value: string;
      icon?: React.ReactNode;
      tone?: 'pos' | 'neg';
    }[] = [
      { label: 'Cash balance', value: fmtMoney(portfolio.cash, portfolio.currency) },
      {
        label: 'Open positions',
        value: `${portfolio.openPositions} · ${fmtMoney(portfolio.openValue, portfolio.currency)}`,
      },
      { label: 'Cost basis', value: fmtMoney(portfolio.openCost, portfolio.currency) },
      {
        label: 'Unrealized P/L',
        value: fmtMoney(portfolio.unrealizedPnl, portfolio.currency),
        icon:
          portfolio.unrealizedPnl >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          ),
        tone: portfolio.unrealizedPnl >= 0 ? 'pos' : 'neg',
      },
      {
        label: 'Realized P/L',
        value: fmtMoney(portfolio.realizedPnl, portfolio.currency),
        icon:
          portfolio.realizedPnl >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          ),
        tone: portfolio.realizedPnl >= 0 ? 'pos' : 'neg',
      },
      {
        label: 'Record (won / lost)',
        value: `${portfolio.won} / ${portfolio.lost}`,
      },
    ];
    return (
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${
              isLight
                ? 'bg-neutral-50/80 border-neutral-200'
                : 'bg-[#0d1320] border-[#1e293b]'
            }`}
          >
            <span className="text-[11.5px] font-medium opacity-70 flex items-center gap-1.5">
              {r.icon}
              {r.label}
            </span>
            <span
              className={`text-[12px] font-mono font-extrabold ${
                r.tone === 'pos'
                  ? 'text-emerald-500'
                  : r.tone === 'neg'
                    ? 'text-rose-500'
                    : ''
              }`}
            >
              {r.value}
            </span>
          </div>
        ))}
        <p className="text-[10.5px] opacity-50 pt-1 text-center">
          Live from your trade ledger — refreshes after every confirmed order.
        </p>
      </div>
    );
  };

  const ApisBody = () => {
    const endpoints = [
      { method: 'GET', path: '/api/pm/markets', desc: 'List tradable markets' },
      { method: 'POST', path: '/api/pm/orders', desc: 'Place a BUY / SELL order' },
      { method: 'GET', path: '/api/pm/positions', desc: 'Your open positions' },
      { method: 'GET', path: '/api/pm/portfolio', desc: 'Portfolio summary + P/L' },
      { method: 'GET', path: '/api/pm/activity', desc: 'Your trade ledger feed' },
    ];
    return (
      <div className="space-y-2">
        <p className="text-[12px] leading-snug opacity-80">
          Every screen in the prediction market runs on the same token-authenticated
          pipeline that is open to you. Authenticate with your Bearer token and call:
        </p>
        <div className="space-y-1.5">
          {endpoints.map((e) => (
            <div
              key={e.path + e.method}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border font-mono ${
                isLight
                  ? 'bg-neutral-50/80 border-neutral-200'
                  : 'bg-[#0d1320] border-[#1e293b]'
              }`}
            >
              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                  e.method === 'POST'
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-blue-500/15 text-blue-400'
                }`}
              >
                {e.method}
              </span>
              <span className="text-[11px] font-bold truncate">{e.path}</span>
              <span className="ml-auto text-[10px] opacity-50 shrink-0 hidden sm:inline">
                {e.desc}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10.5px] opacity-50">
          More endpoints (history, resolution, webhooks) are on the way.
        </p>
      </div>
    );
  };

  const DocumentationBody = () => (
    <div className="space-y-2.5 text-[12px] leading-relaxed">
      <div className="space-y-1.5">
        {[
          ['Shares, not odds', 'Each market trades YES/NO shares priced between 0.00 ETB and 1.00 ETB. The price is the live probability.'],
          ['Buy & sell anytime', 'BUY with cash; SELL some or all of a position before resolution to lock in (or cut) your P/L.'],
          ['Resolution', 'When a market resolves, each winning share pays exactly 1.00 ETB; losing shares pay nothing and settle automatically.'],
          ['Separate wallet', 'Prediction markets use the same cash balance as the sportsbook but keep their own positions and ledger.'],
        ].map(([h, d]) => (
          <div
            key={h}
            className={`px-3 py-2.5 rounded-xl border ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-[#0d1320] border-[#1e293b]'
            }`}
          >
            <div className="text-[11.5px] font-extrabold mb-0.5">{h}</div>
            <div className="text-[11px] opacity-70">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const HelpBody = () => (
    <div className="space-y-1.5">
      {[
        ['What is the minimum deposit?', 'ETB 100 per transaction via the telebirr checkout (max ETB 50,000).'],
        ['When can I sell my shares?', 'Any time before a market resolves — open your position from the profile page and place a SELL.'],
        ['When do markets settle?', 'Right after resolution. Winning shares credit 1.00 ETB each to your cash automatically.'],
        ['Why did my trade fail?', 'Most failures are an empty cash balance or a moved price — check your balance and retry.'],
      ].map(([q, a]) => (
        <details
          key={q}
          className={`group px-3 py-2.5 rounded-xl border ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-[#0d1320] border-[#1e293b]'
          }`}
        >
          <summary className="text-[11.5px] font-bold cursor-pointer list-none flex items-center justify-between">
            {q}
            <span className="text-[10px] opacity-40 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="text-[11px] opacity-70 mt-1.5">{a}</p>
        </details>
      ))}
    </div>
  );

  const TermsBody = () => (
    <ol className="space-y-1.5 text-[11.5px] leading-snug list-decimal list-inside opacity-80">
      <li>You must be 18+ and keep a single ሃገራዊ account in your own name.</li>
      <li>Deposited cash and prediction positions are yours to trade; bonuses may carry separate rules.</li>
      <li>Markets resolve against the published source stated on each market page.</li>
      <li>Order fills are final; prices move live and confirmation shows the executed terms.</li>
      <li>Manipulation, multi-accounting, or abuse of the trading pipeline may void positions.</li>
      <li>Prediction markets involve risk — never stake more than you can afford to lose.</li>
    </ol>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150 bg-black/60"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={meta.title}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[420px] max-h-[85vh] overflow-y-auto custom-scrollbar border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150 ${
          isLight
            ? 'pm-body bg-white text-neutral-800 border-neutral-200'
            : 'bg-[#121824] text-white border-[#1e293b]'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-2.5 px-4 py-3.5 border-b backdrop-blur-md bg-opacity-90"
          style={{
            borderColor: isLight ? '#e5e7eb' : '#1e293b',
            backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(18,24,36,0.9)',
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border"
            style={{
              borderColor: isLight ? '#e5e7eb' : '#243350',
              backgroundColor: isLight ? '#f3f4f6' : '#0d1320',
            }}
          >
            {meta.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-[13.5px] font-extrabold tracking-tight leading-tight">
              {meta.title}
            </h3>
            <p className="text-[10.5px] opacity-55 leading-tight truncate">{meta.blurb}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isLight
                ? 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">{body()}</div>

        {/* Footer hint */}
        <div
          className="px-4 py-2.5 border-t flex items-center gap-1.5 text-[10px] opacity-45"
          style={{ borderColor: isLight ? '#e5e7eb' : '#1e293b' }}
        >
          <Activity className="w-3 h-3" />
          <span>ሃገራዊ Prediction Market</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};
