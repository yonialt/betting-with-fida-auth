import React, { useState } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Pencil,
  Share2,
  Download,
  Upload,
  Search,
  SlidersHorizontal,
  TrendingUp,
  X,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';

interface ProfilePageProps {
  onBack: () => void;
}

/**
 * User profile / portfolio page (ሃገራዊ prediction & sports betting) — LIGHT theme,
 * matching the Account & Wallet modal. Opened from the header profile capsule and
 * driven by live account data (balance, placed bets) from BettingContext.
 */
export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const {
    user,
    placedBets,
    setDepositModalOpen,
    setWithdrawModalOpen,
    setLoginModalOpen,
    setNotification,
    updateProfile,
  } = useBetting();

  const [topTab, setTopTab] = useState<'predictions' | 'perps'>('predictions');
  const [pnlRange, setPnlRange] = useState<'1D' | '1W' | '1M' | '1Y' | 'YTD' | 'ALL'>('1D');
  const [posTab, setPosTab] = useState<'positions' | 'activity'>('positions');
  const [posFilter, setPosFilter] = useState<'active' | 'closed'>('active');
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const currency = user.currency || 'ETB';
  const displayName = user.username && user.username !== 'Guest' ? user.username : 'Guest';

  // Derived portfolio stats from placed bets
  const activeBets = placedBets.filter((b) => b.status === 'active' || b.status === 'pending');
  const closedBets = placedBets.filter(
    (b) => b.status === 'won' || b.status === 'lost' || b.status === 'cashed_out'
  );
  const positionsValue = activeBets.reduce((s, b) => s + (b.cashoutValue ?? b.stake ?? 0), 0);
  const wonBets = placedBets.filter((b) => b.status === 'won');
  const biggestWin = wonBets.length ? Math.max(...wonBets.map((b) => b.potentialWin || 0)) : null;
  const predictionsCount = placedBets.length;

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

  const shownBets = (posFilter === 'active' ? activeBets : closedBets).filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.items.some(
      (it) =>
        (it.matchTitle || '').toLowerCase().includes(q) ||
        (it.league || '').toLowerCase().includes(q)
    );
  });

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

  const editInputCls =
    'mt-1.5 w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-colors';

  const iconBtn =
    'w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border border-[#e5e8ec] transition-colors cursor-pointer';

  return (
    <div className="min-h-screen w-full bg-[#eef1f5] text-[#1f2937] font-sans antialiased">
      {/* Navy top bar (matches the Account & Wallet modal header) */}
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
        {/* Top Tabs: Predictions | Perps */}
        <div className="flex items-center gap-6 border-b border-[#e5e8ec] mb-6">
          {(['predictions', 'perps'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTopTab(tab)}
              className={`relative pb-3 text-sm font-bold capitalize transition-colors cursor-pointer ${
                topTab === tab ? 'text-[#111827]' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab}
              {topTab === tab && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#0084ff] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {topTab === 'perps' ? (
          <div className="w-full rounded-2xl border border-[#e5e8ec] bg-white p-12 text-center shadow-sm">
            <p className="text-neutral-700 font-bold text-sm">Perps portfolio</p>
            <p className="text-neutral-500 text-xs mt-1">No open perpetual positions yet.</p>
          </div>
        ) : (
          <>
            {/* Two top cards: Profile summary + Profit/Loss */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Profile Summary Card */}
              <div className="rounded-2xl border border-[#e5e8ec] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-full shrink-0 bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-600 shadow-inner ring-1 ring-black/5" />
                    <div className="min-w-0">
                      <h1 className="text-2xl font-black tracking-tight truncate text-[#111827]">
                        {displayName}
                      </h1>
                      <p className="text-xs text-neutral-500 mt-0.5">Joined Sep 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className={iconBtn} title="View public profile">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button className={iconBtn} title="Edit profile" onClick={openEdit}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className={iconBtn}
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
                    <div className="text-lg font-black tracking-tight text-[#111827]">
                      {money(positionsValue)}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                      Positions Value
                    </div>
                  </div>
                  <div className="border-l border-[#e5e8ec] pl-3">
                    <div className="text-lg font-black tracking-tight text-neutral-600">
                      {biggestWin != null ? money(biggestWin) : '—'}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                      Biggest Win
                    </div>
                  </div>
                  <div className="border-l border-[#e5e8ec] pl-3">
                    <div className="text-lg font-black tracking-tight text-[#111827]">
                      {predictionsCount}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                      Predictions
                    </div>
                  </div>
                </div>

                {/* Deposit / Withdraw */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={() => setDepositModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-[#e5e8ec] text-sm font-bold text-neutral-800 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-[#e5e8ec] text-sm font-bold text-neutral-800 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Profit / Loss Card */}
              <div className="rounded-2xl border border-[#e5e8ec] bg-white p-5 relative overflow-hidden shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    Profit/Loss
                  </div>
                  <div className="flex items-center gap-1 bg-neutral-100 border border-[#e5e8ec] rounded-lg p-0.5">
                    {(['1D', '1W', '1M', '1Y', 'YTD', 'ALL'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setPnlRange(r)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                          pnlRange === r
                            ? 'bg-[#0084ff] text-white'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-3xl font-black tracking-tight text-[#111827]">{money(0)}</span>
                  <button
                    className="text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
                    title="Share P/L"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-neutral-500 font-semibold mt-1">{rangeLabel[pnlRange]}</p>

                {/* Faint brand watermark — below the range pills */}
                <div className="absolute top-20 right-5 flex items-center gap-1 text-neutral-300 select-none pointer-events-none">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-black tracking-tight">ሃገራዊ</span>
                </div>

                {/* Flat P/L chart area */}
                <div className="mt-6 h-16 w-full rounded-lg bg-gradient-to-t from-[#0084ff]/15 to-transparent border-b-2 border-[#0084ff]/40" />
              </div>
            </div>

            {/* Positions / Activity section */}
            <div className="mt-8">
              <div className="flex items-center gap-6 border-b border-[#e5e8ec] mb-4">
                {(['positions', 'activity'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPosTab(tab)}
                    className={`relative pb-3 text-sm font-bold capitalize transition-colors cursor-pointer ${
                      posTab === tab ? 'text-[#111827]' : 'text-neutral-500 hover:text-neutral-800'
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
                <div className="flex items-center bg-white border border-[#e5e8ec] rounded-xl p-0.5 shrink-0 shadow-sm">
                  {(['active', 'closed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setPosFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                        posFilter === f
                          ? 'bg-neutral-200 text-neutral-900'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search positions"
                    className="w-full bg-white border border-[#e5e8ec] rounded-xl pl-9 pr-3 py-2 text-sm text-[#1f2937] placeholder-neutral-400 focus:outline-none focus:border-[#0084ff] transition-colors shadow-sm"
                  />
                </div>

                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e5e8ec] text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer shrink-0 shadow-sm">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Value
                </button>
              </div>

              {/* Table */}
              <div className="w-full rounded-2xl border border-[#e5e8ec] bg-white overflow-hidden shadow-sm">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-[#e5e8ec] text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <span>Market</span>
                  <span className="w-16 text-right">Avg</span>
                  <span className="w-20 text-right">Current</span>
                  <span className="w-24 text-right">Value</span>
                </div>

                {shownBets.length === 0 ? (
                  <div className="py-14 text-center text-sm text-neutral-500 font-semibold">
                    No positions found
                  </div>
                ) : (
                  shownBets.map((bet) => {
                    const first = bet.items[0];
                    const title = first
                      ? first.matchTitle || first.league || first.selectionName
                      : bet.id;
                    const avg = first ? first.odds : bet.totalOdds;
                    const value =
                      bet.status === 'active' ? bet.cashoutValue ?? bet.stake : bet.potentialWin;
                    return (
                      <div
                        key={bet.id}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-[#eef1f4] last:border-0 items-center hover:bg-neutral-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#111827] truncate">{title}</div>
                          <div className="text-[11px] text-neutral-500 truncate">
                            {first?.selectionLabel ? `${first.selectionLabel} · ` : ''}
                            {bet.type} · {bet.status}
                          </div>
                        </div>
                        <span className="w-16 text-right text-sm font-mono text-neutral-600">
                          {avg?.toFixed?.(2) ?? avg}
                        </span>
                        <span className="w-20 text-right text-sm font-mono text-neutral-600">
                          {bet.totalOdds?.toFixed?.(2) ?? bet.totalOdds}
                        </span>
                        <span className="w-24 text-right text-sm font-mono font-bold text-[#111827]">
                          {money(value ?? 0)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
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
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-150"
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
                className="p-1 text-neutral-300 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">
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
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">
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
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">
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
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2.5 bg-white hover:bg-neutral-100 text-neutral-700 font-bold text-xs rounded-xl border border-neutral-300 transition-colors cursor-pointer"
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
    </div>
  );
};
