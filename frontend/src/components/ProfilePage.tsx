import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  Pencil,
  Share2,
  Download,
  Upload,
  Search,
  SlidersHorizontal,
  TrendingUp,
  X,
  AlertCircle,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { usePolymarketPortfolio } from '../hooks/usePolymarketPortfolio';
import { polymarketTradingApi, PmPosition } from '../services/polymarketTradingApi';

interface ProfilePageProps {
  onBack: () => void;
}

/**
 * User profile / portfolio page (ሃগራዊ prediction & sports betting) — supports
 * both light and dark themes, toggled by the polymarketDarkMode context value.
 */
export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const {
    user,
    placedBets,
    matches,
    polymarketDarkMode,
    setDepositModalOpen,
    setWithdrawModalOpen,
    setNotification,
    updateProfile,
  } = useBetting();

  const dark = polymarketDarkMode;

  const [topTab, setTopTab] = useState<'predictions' | 'sportsbook'>('predictions');

  const [pnlRange, setPnlRange] = useState<'1D' | '1W' | '1M' | '1Y' | 'YTD' | 'ALL'>('1D');
  const [posTab, setPosTab] = useState<'positions' | 'activity'>('positions');
  const [posFilter, setPosFilter] = useState<'active' | 'closed'>('active');
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // --- Close position (SELL from the portfolio, any part or all, before resolution) ---
  const [closePos, setClosePos] = useState<PmPosition | null>(null);
  const [closeShares, setCloseShares] = useState<string>('');
  const [closeSubmitting, setCloseSubmitting] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const currency = user.currency || 'ETB';
  const displayName = user.username && user.username !== 'Guest' ? user.username : 'Guest';

  // --- Prediction-market portfolio (backend /api/pm/*) ---
  // Positions/Activity and the P/L card are driven by the prediction-market
  // trading pipeline. The sportsbook placedBets list remains for its own domain.
  const {
    positions: pmPositions,
    history: pmHistory,
    activity: pmActivity,
    summary: pmSummary,
    refresh: pmRefresh,
  } = usePolymarketPortfolio();

  // Auto-refresh when a confirmed prediction-market order lands anywhere.
  useEffect(() => {
    const onPmChange = () => pmRefresh();
    window.addEventListener('pm:portfolio-changed', onPmChange);
    return () => window.removeEventListener('pm:portfolio-changed', onPmChange);
  }, [pmRefresh]);

  // Positions tab = ACTIVE (open) or CLOSED/SETTLED (history) positions. Active
  // rows carry the live backend quote (currentPriceCents) so value/P/L move with
  // the market; closed rows carry booked realized P/L and their exit price.
  const activeBets = pmPositions.map((p) => ({
    key: `pm-open-${p.id}`,
    id: `PM-${p.id}`,
    matchTitle: p.marketTitle,
    league: p.category || 'Predictions',
    selectionName: p.outcomeName,
    side: p.side,
    status: 'active' as const,
    shares: p.shares,
    avgCents: p.avgPriceCents,
    curCents: p.currentPriceCents ?? p.lastPriceCents ?? p.avgPriceCents,
    value: p.currentValue,
    pnl: p.unrealizedPnl,
    pnlPct: p.pnlPercent ?? 0,
    costBasis: p.costBasis,
    openedAt: p.openedAt,
    resolvedAt: null as string | null,
  }));
  const closedBets = pmHistory.map((p) => ({
    key: `pm-hist-${p.id}`,
    id: `PM-${p.id}`,
    matchTitle: p.marketTitle,
    league: p.category || 'Predictions',
    selectionName: p.outcomeName,
    side: p.side,
    status: (p.status === 'won' ? 'won' : p.status === 'lost' ? 'lost' : 'cashed_out') as
      'won' | 'lost' | 'cashed_out',
    shares: p.shares,
    avgCents: p.avgPriceCents,
    curCents: (p.exitPriceCents ?? p.lastPriceCents ?? p.avgPriceCents),
    value: p.currentValue,
    pnl: p.realizedPnl ?? 0,
    pnlPct: 0,
    costBasis: p.costBasis,
    openedAt: p.openedAt,
    resolvedAt: p.resolvedAt,
  }));

  // Portfolio stats (prediction-market domain)
  const positionsValue = user.balance + (pmSummary?.openValue ?? 0);
  const wonBets = pmHistory.filter((p) => p.status === 'won');
  const biggestWin = wonBets.length
    ? Math.max(...wonBets.map((b) => (b.realizedPnl ?? 0)))
    : null;
  const predictionsCount = pmPositions.length + pmHistory.length;
  const totalPnl = (pmSummary?.unrealizedPnl ?? 0) + (pmSummary?.realizedPnl ?? 0);

  const rangeLabel: Record<typeof pnlRange, string> = {
    '1D': 'Past Day',
    '1W': 'Past Week',
    '1M': 'Past Month',
    '1Y': 'Past Year',
    YTD: 'Year to Date',
    ALL: 'All Time',
  };

  const money = (n: number) =>
    `${n < 0 ? '-' : ''}${currency === 'ETB' ? '' : '$'}${Math.abs(n).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}${currency === 'ETB' ? ` ${currency}` : ''}`;

  // Prediction-market share price: the backend stores it in cents (30 = 0.30 ETB);
  // render it as the ETB price paid per share, never as USD cents.
  const birrPrice = (cents: number | null | undefined) =>
    cents == null ? '—' : `${(cents / 100).toFixed(2)} ${currency}`;

  const shownBets = (posFilter === 'active' ? activeBets : closedBets).filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (b.matchTitle || '').toLowerCase().includes(q) ||
      (b.league || '').toLowerCase().includes(q) ||
      (b.selectionName || '').toLowerCase().includes(q)
    );
  });

  // Activity tab data: the prediction-market trade ledger (buys, sells, resolution
  // wins/losses), newest first — straight from the backend.
  const activityRows = pmActivity.map((t) => ({
    key: t.reference,
    action: t.action,
    side: t.side,
    outcomeName: t.outcomeName,
    priceCents: t.priceCents,
    marketTitle: t.marketTitle,
    shares: t.shares,
    amount: t.amount,
    executedAt: t.executedAt,
  }));

  // --- Sportsbook section (separate domain from the prediction market) ---
  // Status derivation is evidence-based: backend status for settled bets, and for
  // active bets the LIVE match state only (winning/losing while the game runs).
  // A bet whose match hasn't started can never show as won — it stays "Upcoming".
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const sportsbookBets = placedBets.map((bet) => {
    const legStates = (bet.items || []).map((item) => {
      const m = item.matchId ? matchById.get(item.matchId) : undefined;
      if (bet.status === 'won') return 'won' as const;
      if (bet.status === 'lost') return 'lost' as const;
      if (bet.status === 'cashed_out') return 'cashed_out' as const;
      if (!m || (!m.isLive && !m.startTime)) return 'upcoming' as const;
      if (!m.isLive) {
        // Has a kickoff but not live: check if it should have started
        const kickoff = m.startTime ? new Date(m.startTime).getTime() : null;
        if (kickoff && kickoff > Date.now()) return 'upcoming' as const;
        return 'live' as const; // treat as in-play
      }
      return 'live' as const;
    });

    const allDecided = legStates.every((s) => s === 'won' || s === 'lost' || s === 'cashed_out');
    const hasLive = legStates.some((s) => s === 'live');

    // Effective display status — backend verdict first, live state otherwise.
    let effStatus: 'won' | 'lost' | 'cashed_out' | 'live_win' | 'live_lose' | 'live_draw' | 'active';
    if (bet.status === 'won') effStatus = 'won';
    else if (bet.status === 'lost') effStatus = 'lost';
    else if (bet.status === 'cashed_out') effStatus = 'cashed_out';
    else if (hasLive || allDecided === false) {
      // Estimate live direction from current scores across legs
      let up = 0, down = 0;
      (bet.items || []).forEach((item) => {
        const m = item.matchId ? matchById.get(item.matchId) : undefined;
        if (!m || !m.isLive) return;
        const s1 = m.score1, s2 = m.score2;
        const label = item.selectionLabel || '';
        const winning =
          (label === '1' || label === 'W1') ? s1 > s2 :
          (label === '2' || label === 'W2') ? s2 > s1 :
          label === 'X' ? s1 === s2 :
          label === '1X' ? s1 >= s2 :
          label === 'X2' ? s2 >= s1 :
          label === '12' ? s1 !== s2 :
          label.startsWith('Over') ? s1 + s2 > 2.5 :
          label.startsWith('Under') ? s1 + s2 < 2.5 : false;
        if (winning) up++; else down++;
      });
      effStatus = up > 0 && down === 0 ? 'live_win' : down > 0 ? 'live_lose' : 'active';
    } else effStatus = 'active';

    return { bet, legStates, effStatus };
  });

  const sbActive = sportsbookBets.filter((s) =>
    ['live_win', 'live_lose', 'live_draw', 'active'].includes(s.effStatus));
  const sbWon = sportsbookBets.filter((s) => s.effStatus === 'won');
  const sbLost = sportsbookBets.filter((s) => s.effStatus === 'lost');
  const sbCashedOut = sportsbookBets.filter((s) => s.effStatus === 'cashed_out');
  const sbTotalStaked = sportsbookBets.reduce((a, s) => a + (s.bet.stake || 0), 0);
  const sbTotalPayout = sbWon.reduce((a, s) => a + (s.bet.potentialWin || 0), 0);
  const sbNetPnl = sbTotalPayout - sbTotalStaked;
  const [sbFilter, setSbFilter] = useState<'active' | 'won' | 'lost' | 'all'>('active');

  // --- P/L chart (Predictions tab): cumulative net cash-flow curve built from the
  // prediction-market activity ledger, honoring the selected time range. Buys are
  // cash outflows; sells and resolution wins are inflows; losses plot flat at 0.
  const pmChart = useMemo(() => {
    const now = Date.now();
    const rangeStart = (() => {
      switch (pnlRange) {
        case '1D': return now - 24 * 3600e3;
        case '1W': return now - 7 * 24 * 3600e3;
        case '1M': return now - 30 * 24 * 3600e3;
        case '1Y': return now - 365 * 24 * 3600e3;
        case 'YTD': return new Date(new Date().getFullYear(), 0, 1).getTime();
        default: return 0; // ALL
      }
    })();
    const events = pmActivity
      .filter((t) => new Date(t.executedAt).getTime() >= rangeStart)
      .sort((a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime());
    let cum = 0;
    const points = events.map((t) => {
      if (t.action === 'BUY') cum -= t.amount;
      else if (t.action === 'RESOLVE_LOSS') cum += 0;
      else cum += t.amount; // SELL proceeds / RESOLVE_WIN payout
      return {
        t: new Date(t.executedAt).getTime(),
        v: Math.round(cum * 100) / 100,
        label: `${t.action} ${t.outcomeName} — ${t.marketTitle}`,
      };
    });
    return { points, final: points.length ? points[points.length - 1].v : 0 };
  }, [pmActivity, pnlRange]);

  // SVG geometry for the curve (viewBox 0 0 100 40, stretched to the card).
  const pmChartPath = useMemo(() => {
    const pts = pmChart.points;
    if (pts.length < 2) return null;
    const vs = pts.map((p) => p.v);
    const min = Math.min(...vs, 0);
    const max = Math.max(...vs, 0);
    const span = max - min || 1;
    const x = (i: number) => (i / (pts.length - 1)) * 100;
    const y = (v: number) => 38 - ((v - min) / span) * 36; // 2px padding top/bottom
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(p.v).toFixed(2)}`).join(' ');
    const area = `${line} L100,40 L0,40 Z`;
    return { line, area };
  }, [pmChart]);

  // --- Close position handlers (SELL against the backend at the live price) ---
  const openClose = (p: PmPosition) => {
    setClosePos(p);
    setCloseShares(String(p.shares));
    setCloseError(null);
  };

  const confirmClose = async () => {
    if (!closePos || closeSubmitting) return;
    const shares = parseFloat(closeShares) || 0;
    if (shares <= 0 || shares > closePos.shares + 1e-9) return;
    setCloseSubmitting(true);
    setCloseError(null);
    try {
      await polymarketTradingApi.placeOrder({
        action: 'SELL',
        marketId: closePos.marketId,
        side: closePos.side,
        priceCents: closePos.currentPriceCents ?? Math.round(closePos.lastPriceCents ?? closePos.avgPriceCents),
        shares: Math.min(shares, closePos.shares),
        outcomeName: closePos.outcomeName,
      });
      setClosePos(null);
      await pmRefresh();
    } catch (err: any) {
      setCloseError(err?.message || 'Failed to close position');
    } finally {
      setCloseSubmitting(false);
    }
  };

  const openEdit = () => {
    setEditName(user.username && user.username !== 'Guest' ? user.username : '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditOpen(true);
  };

  const saveEdit = () => {
    const updates: Record<string, string> = {};
    if (editName.trim()) updates.username = editName.trim();
    updates.email = editEmail.trim();
    updates.phone = editPhone.trim();
    updateProfile(updates);
    setEditOpen(false);
  };

  // --- Profile picture ---
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Downscale to a square (max 256px) JPEG data URL so it fits comfortably in
  // the backend's 300 KB avatar budget and survives session restores.
  const fileToAvatarDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read the image'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Unsupported image file'));
        img.onload = () => {
          const size = Math.min(256, Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas unavailable'));
          const scale = size / Math.min(img.width, img.height);
          const sw = size / scale;
          const sh = size / scale;
          ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, size, size);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotification({ message: 'Please choose an image file', type: 'warning' });
      return;
    }
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      updateProfile({ avatarUrl: dataUrl });
    } catch {
      setNotification({ message: 'Could not process that image', type: 'warning' });
    }
  };

  // --- Theme helpers ---
  const pageBg = dark ? 'bg-[#0a0d14] text-white' : 'bg-[#eef1f5] text-[#1f2937]';
  const cardBg = dark ? 'bg-[#101622] border-[#1b2536]' : 'bg-white border-[#e5e8ec]';
  const tabBorder = dark ? 'border-[#1b2536]' : 'border-[#e5e8ec]';
  const tabActive = dark ? 'text-white' : 'text-[#111827]';
  const tabInactive = dark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-500 hover:text-neutral-800';
  const mutedText = dark ? 'text-neutral-400' : 'text-neutral-500';
  const strongText = dark ? 'text-white' : 'text-[#111827]';
  const dividerColor = dark ? 'border-[#1b2536]' : 'border-[#e5e8ec]';
  const filterBg = dark ? 'bg-[#101622] border-[#1b2536]' : 'bg-white border-[#e5e8ec]';
  const filterActive = dark ? 'bg-[#1a2333] text-white' : 'bg-neutral-200 text-neutral-900';
  const filterInactive = dark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-500 hover:text-neutral-900';
  const inputBg = dark
    ? 'bg-[#101622] border-[#1b2536] text-white placeholder-neutral-500'
    : 'bg-white border-[#e5e8ec] text-[#1f2937] placeholder-neutral-400';
  const iconBtnCls = dark
    ? 'text-neutral-400 hover:text-white hover:bg-[#1a2333] border-[#1d2738]'
    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border-[#e5e8ec]';
  const btnBg = dark
    ? 'bg-[#141b27] hover:bg-[#1a2333] border-[#1d2738] text-neutral-300'
    : 'bg-neutral-100 hover:bg-neutral-200 border-[#e5e8ec] text-neutral-800';
  const pnlRangeBg = dark ? 'bg-[#0b1018] border-[#1d2738]' : 'bg-neutral-100 border-[#e5e8ec]';
  const tableRowHover = dark ? 'hover:bg-[#141b27]' : 'hover:bg-neutral-50';
  const tableBorder = dark ? 'border-[#1b2536]' : 'border-[#eef1f4]';
  const watermarkText = dark ? 'text-neutral-700' : 'text-neutral-200';

  const editInputCls = dark
    ? 'mt-1.5 w-full bg-[#0b1018] border border-[#1d2738] rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-colors'
    : 'mt-1.5 w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-colors';

  const editModalBg = dark ? 'bg-[#101622] border-[#1b2536]' : 'bg-white border-neutral-200';
  const editModalFooter = dark
    ? 'border-[#1b2536] bg-[#0b1018]'
    : 'border-neutral-200 bg-neutral-50';
  const editCancelBtn = dark
    ? 'bg-[#141b27] hover:bg-[#1a2333] text-neutral-300 border-[#1d2738]'
    : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300';
  const editLabel = dark ? 'text-neutral-400' : 'text-neutral-600';

  return (
    <div className={`min-h-screen w-full font-sans antialiased transition-colors ${pageBg}`}>
      {/* Hidden file input for the profile picture (triggered from the avatar and the edit modal) */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={onPickAvatar}
        className="hidden"
      />
      {/* Navy top bar */}
      <div className="sticky top-0 z-30 w-full text-white shadow-sm" style={{ backgroundColor: '#1b2838' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="h-5 w-px bg-white/15" />
          <span className="font-black tracking-tight text-[15px]">
            ሃገራዊ <span className="text-[#38bdf8]">Portfolio</span>
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {/* Top Tabs: Predictions | Sportsbook (separate domains) */}
        <div className={`flex items-center gap-6 border-b ${tabBorder} mb-6`}>
          {(['predictions', 'sportsbook'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTopTab(tab)}
              className={`relative pb-3 text-sm font-bold capitalize transition-colors cursor-pointer ${
                topTab === tab ? tabActive : tabInactive
              }`}
            >
              {tab}
              {topTab === tab && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#0084ff] rounded-full" />
              )}
            </button>
          ))}
        </div>

            {topTab === 'predictions' && (
            <>

            {/* Two top cards: Profile summary + Profit/Loss */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Profile Summary Card */}
              <div className={`rounded-2xl border ${cardBg} p-5`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      title="Change profile picture"
                      className="relative w-14 h-14 rounded-full shrink-0 group cursor-pointer"
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Profile picture"
                          className="w-14 h-14 rounded-full object-cover shadow-inner ring-1 ring-black/10"
                        />
                      ) : (
                        <span className="block w-14 h-14 rounded-full bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-600 shadow-inner ring-1 ring-black/10" />
                      )}
                      <span className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="w-4 h-4" />
                      </span>
                    </button>
                    <div className="min-w-0">
                      <h1 className={`text-2xl font-black tracking-tight truncate ${strongText}`}>
                        {displayName}
                      </h1>
                      <p className={`text-xs ${mutedText} mt-0.5`}>Joined Sep 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${iconBtnCls}`} title="Edit profile" onClick={openEdit}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${iconBtnCls}`}
                      title="Share profile"
                      onClick={() => {
                        navigator.clipboard?.writeText?.(window.location.href);
                        setNotification({ message: 'Profile link copied', type: 'success' });
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div>
                    <div className={`text-lg font-black tracking-tight ${strongText}`}>
                      {money(positionsValue)}
                    </div>
                    <div className={`text-[11px] ${mutedText} font-semibold mt-0.5`}>
                      Positions Value
                    </div>
                  </div>
                  <div className={`border-l ${dividerColor} pl-3`}>
                    <div className={`text-lg font-black tracking-tight ${mutedText}`}>
                      {biggestWin != null ? money(biggestWin) : '—'}
                    </div>
                    <div className={`text-[11px] ${mutedText} font-semibold mt-0.5`}>
                      Biggest Win
                    </div>
                  </div>
                  <div className={`border-l ${dividerColor} pl-3`}>
                    <div className={`text-lg font-black tracking-tight ${strongText}`}>
                      {predictionsCount}
                    </div>
                    <div className={`text-[11px] ${mutedText} font-semibold mt-0.5`}>
                      Predictions
                    </div>
                  </div>
                </div>

                {/* Deposit / Withdraw */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={() => setDepositModalOpen(true)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${btnBg}`}
                  >
                    <Download className="w-4 h-4" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${btnBg}`}
                  >
                    <Upload className="w-4 h-4" />
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Profit / Loss Card */}
              <div className={`rounded-2xl border ${cardBg} p-5 relative overflow-hidden`}>
                <div className="flex items-start justify-between">
                  <div className={`flex items-center gap-2 text-sm font-bold ${mutedText}`}>
                    <span className={`w-2 h-2 rounded-full ${dark ? 'bg-neutral-500' : 'bg-neutral-400'}`} />
                    Profit/Loss
                  </div>
                  <div className={`flex items-center gap-1 rounded-lg p-0.5 ${pnlRangeBg}`}>
                    {(['1D', '1W', '1M', '1Y', 'YTD', 'ALL'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setPnlRange(r)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                          pnlRange === r
                            ? 'bg-[#0084ff] text-white'
                            : dark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`text-3xl font-black tracking-tight ${
                      totalPnl > 0 ? 'text-emerald-500' : totalPnl < 0 ? 'text-rose-500' : strongText
                    }`}
                  >
                    {money(totalPnl)}
                  </span>
                  <button
                    className={`${dark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-800'} transition-colors cursor-pointer`}
                    title="Share P/L"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-xs ${mutedText} font-semibold mt-1`}>{rangeLabel[pnlRange]}</p>

                {/* Faint brand watermark */}
                <div className={`absolute top-20 right-5 flex items-center gap-1 select-none pointer-events-none ${watermarkText}`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-black tracking-tight">ሃገራዊ</span>
                </div>

                {/* P/L chart — real curve from the prediction-market activity ledger */}
                {pmChartPath ? (
                  <svg
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                    className="mt-6 h-16 w-full rounded-lg"
                    role="img"
                    aria-label={`P/L over ${rangeLabel[pnlRange]}: ${money(pmChart.final)}`}
                  >
                    <defs>
                      <linearGradient id="pmPlFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0084ff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0084ff" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={pmChartPath.area} fill="url(#pmPlFill)">
                      <title>{`P/L ${rangeLabel[pnlRange]}: ${money(pmChart.final)}`}</title>
                    </path>
                    <path
                      d={pmChartPath.line}
                      fill="none"
                      stroke={pmChart.final > 0 ? '#10b981' : pmChart.final < 0 ? '#f43f5e' : '#0084ff'}
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    >
                      <title>{`P/L ${rangeLabel[pnlRange]}: ${money(pmChart.final)}`}</title>
                    </path>
                  </svg>
                ) : (
                  <div className="mt-6 h-16 w-full rounded-lg bg-gradient-to-t from-[#0084ff]/15 to-transparent border-b-2 border-[#0084ff]/40" />
                )}
              </div>
            </div>
            </>
            )}

            {topTab === 'sportsbook' && (
            <>

            {/* ---- Sportsbook section (separate from the prediction market) ---- */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-sm font-black uppercase tracking-wide ${strongText}`}>
                  Sportsbook
                </h2>
                <div className={`flex items-center gap-1 rounded-lg p-0.5 ${filterBg}`}>
                  {(['active', 'won', 'lost', 'all'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setSbFilter(f)}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                        sbFilter === f ? filterActive : filterInactive
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sportsbook summary strip */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4`}>
                <div className={`rounded-xl border ${cardBg} p-3`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Active</div>
                  <div className={`text-lg font-black ${strongText}`}>{sbActive.length}</div>
                </div>
                <div className={`rounded-xl border ${cardBg} p-3`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Won</div>
                  <div className="text-lg font-black text-emerald-500">{sbWon.length}</div>
                </div>
                <div className={`rounded-xl border ${cardBg} p-3`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Lost</div>
                  <div className="text-lg font-black text-rose-500">{sbLost.length}</div>
                </div>
                <div className={`rounded-xl border ${cardBg} p-3`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Net P/L</div>
                  <div className={`text-lg font-black ${sbNetPnl > 0 ? 'text-emerald-500' : sbNetPnl < 0 ? 'text-rose-500' : strongText}`}>
                    {money(sbNetPnl)}
                  </div>
                </div>
              </div>

              {/* Sportsbook bet cards */}
              <div className="space-y-2.5">
                {sportsbookBets
                  .filter((s) =>
                    sbFilter === 'all' ? true :
                    sbFilter === 'active' ? ['live_win', 'live_lose', 'active'].includes(s.effStatus) :
                    sbFilter === 'won' ? s.effStatus === 'won' :
                    s.effStatus === 'lost'
                  )
                  .map(({ bet, effStatus }) => {
                    const statusMeta: Record<string, { label: string; cls: string }> = {
                      live_win: { label: 'Currently winning', cls: 'bg-emerald-100 text-emerald-700' },
                      live_lose: { label: 'Currently losing', cls: 'bg-rose-100 text-rose-700' },
                      active: { label: 'Upcoming', cls: 'bg-amber-100 text-amber-800' },
                      won: { label: 'Won', cls: 'bg-emerald-100 text-emerald-800' },
                      lost: { label: 'Lost', cls: 'bg-red-100 text-red-800' },
                      cashed_out: { label: 'Cashed out', cls: 'bg-blue-100 text-blue-800' },
                    };
                    const meta = statusMeta[effStatus] || statusMeta.active;
                    return (
                      <div key={bet.id} className={`rounded-xl border ${cardBg} p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-mono text-[11px] font-bold ${mutedText}`}>{bet.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {(bet.items || []).map((item, idx) => (
                            <div key={idx} className={`border-l-2 border-[#ffc600] pl-2`}>
                              <div className={`text-xs font-bold truncate ${strongText}`}>{item.matchTitle}</div>
                              <div className={`text-[11px] ${mutedText}`}>
                                {item.marketName} · {item.selectionLabel || item.selectionName} @{' '}
                                <span className="font-mono font-bold">{item.odds}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-2 pt-2 flex items-center justify-between text-[11px] border-t ${dividerColor}`}>
                          <span className={mutedText}>
                            Stake: <span className="font-mono font-bold">{bet.stake} {bet.currency}</span>
                          </span>
                          <span className={mutedText}>
                            {bet.status === 'won'
                              ? <span className="font-mono font-bold text-emerald-600">+{bet.potentialWin} {bet.currency}</span>
                              : bet.status === 'lost'
                              ? <span className="font-mono font-bold text-rose-600">−{bet.stake} {bet.currency}</span>
                              : <span className="font-mono font-bold text-emerald-700">Potential: {bet.potentialWin} {bet.currency}</span>}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                {sportsbookBets.length === 0 && (
                  <div className={`py-8 text-center text-xs font-semibold ${mutedText}`}>
                    No sportsbook bets yet — placed bets appear here.
                  </div>
                )}
              </div>
            </div>
            </>
            )}

            {topTab === 'predictions' && (
            <>

            {/* Positions / Activity section */}
            <div className="mt-8">
              <div className={`flex items-center gap-6 border-b ${tabBorder} mb-4`}>
                {(['positions', 'activity'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPosTab(tab)}
                    className={`relative pb-3 text-sm font-bold capitalize transition-colors cursor-pointer ${
                      posTab === tab ? tabActive : tabInactive
                    }`}
                  >
                    {tab}
                    {posTab === tab && (
                      <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#0084ff] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Filters row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
                <div className={`flex items-center rounded-xl p-0.5 shrink-0 ${filterBg}`}>
                  {(['active', 'closed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setPosFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                        posFilter === f ? filterActive : filterInactive
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search positions"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#0084ff] transition-colors ${inputBg}`}
                  />
                </div>

                <button className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer shrink-0 ${dark ? 'bg-[#101622] border-[#1b2536] text-neutral-400 hover:text-neutral-200' : 'bg-white border-[#e5e8ec] text-neutral-600 hover:text-neutral-900'}`}>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Value
                </button>
              </div>

              {/* Table — Positions tab; Activity tab shows the prediction-market ledger */}
              {posTab === 'activity' ? (
                <div className={`w-full rounded-2xl border overflow-hidden ${cardBg}`}>
                  {activityRows.length === 0 ? (
                    <div className={`py-14 text-center text-sm font-semibold ${mutedText}`}>
                      No trades yet — confirmed trades appear here instantly.
                    </div>
                  ) : (
                    activityRows.map((t) => {
                      const isBuy = t.action === 'BUY';
                      const isSell = t.action === 'SELL';
                      const isWin = t.action === 'RESOLVE_WIN';
                      const isLoss = t.action === 'RESOLVE_LOSS';
                      const actionLabel = isBuy ? 'Bought' : isSell ? 'Sold' : isWin ? 'Resolution win' : 'Resolution loss';
                      const amountColor = isBuy ? 'text-rose-500' : 'text-emerald-500';
                      const amountPrefix = isBuy ? '-' : '+';
                      return (
                        <div
                          key={t.key}
                          className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 transition-colors ${tableRowHover} ${dark ? 'border-[#1b2536]/50' : 'border-[#eef1f4]'}`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-bold truncate ${strongText}`}>
                              {actionLabel}{' '}
                              <span className={t.side === 'yes' ? 'text-emerald-500' : 'text-rose-500'}>
                                {t.outcomeName?.toUpperCase() || t.side?.toUpperCase()}
                              </span>
                              {t.priceCents != null && <span className={`font-normal ${mutedText}`}> @ {birrPrice(t.priceCents)}</span>}
                            </div>
                            <div className={`text-[11px] truncate ${mutedText}`}>
                              {t.marketTitle} · {t.shares} shares ·{' '}
                              {new Date(t.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <span className={`shrink-0 text-xs font-mono font-bold ${amountColor}`}>
                            {amountPrefix}{money(t.amount)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
              <div className={`w-full rounded-2xl border overflow-hidden ${cardBg}`}>
                <div className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-neutral-500' : 'text-neutral-500'} ${dividerColor}`}>
                  <span>Market</span>
                  <span className="w-16 text-right">Avg</span>
                  <span className="w-20 text-right">Current</span>
                  <span className="w-24 text-right">Value</span>
                  <span className="w-20 text-right">{posFilter === 'active' ? 'Trade' : ''}</span>
                </div>

                {shownBets.length === 0 ? (
                  <div className={`py-14 text-center text-sm font-semibold ${mutedText}`}>
                    No positions found
                  </div>
                ) : (
                  shownBets.map((bet) => {
                    const title = bet.matchTitle || bet.league || bet.selectionName;
                    const pmOpen =
                      bet.status === 'active'
                        ? pmPositions.find((p) => `PM-${p.id}` === bet.id)
                        : undefined;
                    const statusLabel =
                      bet.status === 'active'
                        ? bet.pnl > 0
                          ? 'Winning'
                          : bet.pnl < 0
                          ? 'Losing'
                          : 'Active'
                        : bet.status === 'won'
                        ? 'Won'
                        : bet.status === 'lost'
                        ? 'Lost'
                        : 'Sold';
                    const pnlColor =
                      bet.pnl > 0 ? 'text-emerald-500' : bet.pnl < 0 ? 'text-rose-500' : mutedText;
                    return (
                      <div
                        key={bet.key}
                        className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b last:border-0 items-center transition-colors ${tableRowHover} ${dark ? 'border-[#1b2536]/50' : 'border-[#eef1f4]'}`}
                      >
                        <div className="min-w-0">
                          <div className={`text-sm font-bold truncate ${strongText}`}>{title}</div>
                          <div className={`text-[11px] truncate ${mutedText}`}>
                            <span className={bet.side === 'yes' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                              {bet.selectionName?.toUpperCase() || bet.side?.toUpperCase()}
                            </span>
                            {' · '}{bet.shares} shares · {statusLabel}
                          </div>
                        </div>
                        <span className={`w-16 text-right text-sm font-mono ${mutedText}`}>
                          {birrPrice(bet.avgCents)}
                        </span>
                        <span className={`w-20 text-right text-sm font-mono ${mutedText}`}>
                          {birrPrice(bet.curCents)}
                        </span>
                        <span className="w-24 text-right">
                          <span className={`block text-sm font-mono font-bold ${strongText}`}>
                            {money(bet.status === 'active' ? bet.value : bet.pnl)}
                          </span>
                          {bet.status !== 'active' && (
                            <span className={`block text-[10px] font-bold ${pnlColor}`}>
                              {bet.pnl >= 0 ? '+' : ''}{money(bet.pnl)}
                            </span>
                          )}
                        </span>
                        <span className="w-20 text-right">
                          {bet.status === 'active' && pmOpen && (
                            <button
                              onClick={() => openClose(pmOpen)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                bet.pnl >= 0
                                  ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30'
                                  : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30'
                              }`}
                              title={`Sell ${pmOpen.shares} ${pmOpen.side.toUpperCase()} shares at market`}
                            >
                              Close
                            </button>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              )}
            </div>
            </>
            )}
      </div>

      {/* Edit profile modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={() => setEditOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border animate-in fade-in zoom-in-95 duration-150 ${editModalBg}`}
          >
            <div
              className="px-5 py-4 flex items-center justify-between text-white"
              style={{ backgroundColor: '#1b2838' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-[15px]">Edit Profile</h3>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              {/* Profile picture picker */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  title="Change profile picture"
                  className="relative shrink-0 rounded-full group cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Profile picture"
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-black/10"
                    />
                  ) : (
                    <span className="block w-12 h-12 rounded-full bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-600 ring-1 ring-black/10" />
                  )}
                  <span className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-4 h-4" />
                    </span>
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${btnBg}`}
                  >
                    {user.avatarUrl ? 'Change picture' : 'Upload picture'}
                  </button>
                  {user.avatarUrl && (
                    <button
                      onClick={() => updateProfile({ avatarUrl: null })}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wide ${editLabel}`}>
                  Display name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  className={editInputCls}
                />
              </div>
              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wide ${editLabel}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={editInputCls}
                />
              </div>
              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wide ${editLabel}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+251911000000"
                  className={editInputCls}
                />
              </div>
            </div>
            <div className={`p-4 border-t flex items-center gap-3 ${editModalFooter}`}>
              <button
                onClick={() => setEditOpen(false)}
                className={`flex-1 py-2.5 font-bold text-xs rounded-xl border transition-colors cursor-pointer ${editCancelBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2.5 bg-[#0084ff] hover:bg-[#0070db] text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Close position modal — sell any part or all at the live market price.
          Reuses the existing edit-profile modal styling (no redesign). */}
      {closePos && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={() => !closeSubmitting && setClosePos(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border animate-in fade-in zoom-in-95 duration-150 ${editModalBg}`}
          >
            <div
              className="px-5 py-4 flex items-center justify-between text-white"
              style={{ backgroundColor: '#1b2838' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-[15px]">Close Position</h3>
              </div>
              <button
                onClick={() => setClosePos(null)}
                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className={`text-sm font-bold truncate ${strongText}`}>{closePos.marketTitle}</div>
                <div className={`text-xs mt-0.5 ${mutedText}`}>
                  <span className={closePos.side === 'yes' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {closePos.outcomeName?.toUpperCase() || closePos.side.toUpperCase()}
                  </span>
                  {' · '}{closePos.shares} shares @ {birrPrice(closePos.avgPriceCents)} avg · now{' '}
                  {birrPrice(closePos.currentPriceCents ?? closePos.avgPriceCents)}
                </div>
              </div>

              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wide ${editLabel}`}>
                  Shares to sell (you hold {closePos.shares})
                </label>
                <input
                  type="number"
                  value={closeShares}
                  onChange={(e) => setCloseShares(e.target.value)}
                  max={closePos.shares}
                  className={editInputCls}
                />
                <div className="flex items-center gap-1.5 mt-2">
                  {[25, 50, 75].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setCloseShares(String(Math.floor(closePos.shares * (pct / 100) * 10000) / 10000))}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${btnBg}`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    onClick={() => setCloseShares(String(closePos.shares))}
                    className="px-3 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/40 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {(() => {
                const n = parseFloat(closeShares) || 0;
                const price = closePos.currentPriceCents ?? Math.round(closePos.lastPriceCents ?? closePos.avgPriceCents);
                const proceeds = Math.round(n * price) / 100;
                const pnl = Math.round((n * price - n * closePos.avgPriceCents) / 100 * 100) / 100;
                return (
                  <div className={`rounded-xl border p-3 text-xs flex flex-col gap-1.5 ${cardBg}`}>
                    <div className="flex justify-between">
                      <span className={mutedText}>You receive</span>
                      <span className="font-mono font-bold text-emerald-500">{proceeds.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedText}>Realized P/L</span>
                      <span className={`font-mono font-bold ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} {currency}
                      </span>
                    </div>
                  </div>
                );
  })()}

              {closeError && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{closeError}</span>
                </div>
              )}
            </div>
            <div className={`p-4 border-t flex items-center gap-3 ${editModalFooter}`}>
              <button
                onClick={() => setClosePos(null)}
                className={`flex-1 py-2.5 font-bold text-xs rounded-xl border transition-colors cursor-pointer ${editCancelBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmClose}
                disabled={closeSubmitting || (parseFloat(closeShares) || 0) <= 0}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {closeSubmitting ? 'Closing...' : 'Confirm Sell'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
