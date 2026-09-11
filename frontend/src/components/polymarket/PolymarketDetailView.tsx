import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Code2,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ShieldCheck,
  Check,
  Smile,
  Image as ImageIcon,
  Send,
  AlertCircle,
} from 'lucide-react';
import {
  PolymarketMarket,
  PolymarketOutcome,
  PolymarketTradeState,
  PolymarketComment,
} from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';
import { PolymarketInteractiveChart } from './PolymarketInteractiveChart';

interface PolymarketDetailViewProps {
  market: PolymarketMarket;
  onBack: () => void;
  onSelectOutcome: (trade: PolymarketTradeState) => void;
}

export const PolymarketDetailView: React.FC<PolymarketDetailViewProps> = ({
  market,
  onBack,
  onSelectOutcome,
}) => {
  const { user, setNotification } = useBetting();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDateTab, setActiveDateTab] = useState<string>('Sep 16');
  const [activeTimeframe, setActiveTimeframe] = useState<string>('ALL');
  const [activeSectionTab, setActiveSectionTab] = useState<'comments' | 'holders' | 'positions' | 'activity'>('comments');

  // Order Book toggle for BTC 5m
  const [orderBookOpen, setOrderBookOpen] = useState(false);

  // Trading side
  const [selectedOutcomeIndex, setSelectedOutcomeIndex] = useState<number>(0);
  const [tradeSide, setTradeSide] = useState<'yes' | 'no'>('yes');
  const [orderType, setOrderType] = useState<'market' | 'limit' | '1-top'>('market');
  const [tradeAmount, setTradeAmount] = useState<number>(0);

  // Live timer for BTC 5m
  const [btcTimer, setBtcTimer] = useState({ mins: 4, secs: 21 });
  const [currentBtcPrice, setCurrentBtcPrice] = useState<number>(market.currentPrice || 79808.51);

  // Hovered data point for cursor graph movement
  const [hoveredChartPoint, setHoveredChartPoint] = useState<{
    date: string;
    leadName: string;
    leadVal: number;
    allValues: { name: string; value: number; color: string }[];
  } | null>(null);

  // Comments state
  const [comments, setComments] = useState<PolymarketComment[]>(market.commentsList || []);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [commentFilter, setCommentFilter] = useState<'newest' | 'holders'>('newest');

  const isBtc5m = market.id === 'pm-btc-5m' || market.displayType === 'up_down_btc';
  const isEthiopia = market.id === 'pm-ethiopia-pm';
  const isFed = market.id === 'pm-hero-fed-decision';

  const selectedOutcome = market.outcomes[selectedOutcomeIndex] || market.outcomes[0];

  // BTC countdown timer and price flicker simulation
  useEffect(() => {
    if (!isBtc5m) return;
    const interval = setInterval(() => {
      setBtcTimer((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { mins: prev.mins - 1, secs: 59 };
        return { mins: 5, secs: 0 };
      });

      // Subtle realistic price jitter
      setCurrentBtcPrice((prev) => {
        const delta = (Math.random() - 0.49) * 1.8;
        return Number((prev + delta).toFixed(2));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBtc5m]);

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setNotification?.({
      message: 'Market link copied to clipboard!',
      type: 'info',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExecuteTrade = (amountToTrade?: number, forcedOutcome?: PolymarketOutcome, forcedSide?: 'yes' | 'no') => {
    const amt = amountToTrade !== undefined ? amountToTrade : tradeAmount;
    if (amt <= 0) {
      setNotification?.({
        message: 'Please enter a trade amount greater than 0 ETB',
        type: 'warning',
      });
      return;
    }

    const out = forcedOutcome || selectedOutcome;
    const side = forcedSide || tradeSide;
    const price = side === 'yes' ? (out.yesPrice || out.probability) : (out.noPrice || 100 - out.probability);

    onSelectOutcome({
      market,
      outcome: out,
      side,
      price,
    });

    setNotification?.({
      message: `Trade prepared: ${amt} ETB on ${out.name} (${side.toUpperCase()})`,
      type: 'success',
    });
    setTradeAmount(0);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: PolymarketComment = {
      id: `c-${Date.now()}`,
      author: user.isLoggedIn ? user.username : 'You (Visitor)',
      timeAgo: 'Just now',
      text: newCommentText.trim(),
      likes: 0,
      sharesOutcome: selectedOutcome.name,
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    setNotification?.({
      message: 'Comment posted!',
      type: 'info',
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full text-white pb-16">
      {/* 1. Breadcrumb & Back Bar */}
      <div className="flex items-center justify-between gap-4 py-3 border-b border-[#181f2c] mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#111622] hover:bg-[#192334] border border-[#1e2738] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Markets</span>
          </button>

          <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
            <span>{market.category}</span>
            {market.subcategory && (
              <>
                <span>•</span>
                <span className="text-neutral-200">{market.subcategory}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-[#111622] hover:bg-[#192334] text-neutral-400 hover:text-white border border-[#1e2738] transition-colors cursor-pointer"
            title="Share market"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="p-2 rounded-lg bg-[#111622] hover:bg-[#192334] text-neutral-400 hover:text-white border border-[#1e2738] transition-colors cursor-pointer"
            title="Bookmark market"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`} />
          </button>
          <button
            onClick={() => setNotification?.({ message: 'Embed code copied to clipboard', type: 'info' })}
            className="p-2 rounded-lg bg-[#111622] hover:bg-[#192334] text-neutral-400 hover:text-white border border-[#1e2738] transition-colors cursor-pointer"
            title="Embed market"
          >
            <Code2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Grid: Left Details + Right Sticky Trade Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Title, Live Timer, Chart, Outcomes, Rules, Comments */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Header Title Section */}
          <div className="bg-[#111622] border border-[#1e2738] rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {market.countryFlag ? (
                  <span className="text-3xl sm:text-4xl leading-none select-none">{market.countryFlag}</span>
                ) : isBtc5m ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                    ₿
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                    P
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                    {market.title}
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1 font-medium">
                    {market.timeRange || market.endDate || market.volume}
                  </p>
                </div>
              </div>

              {/* Live Countdown Badge for BTC 5m */}
              {isBtc5m && (
                <div className="flex items-center gap-3 bg-[#0d121c] border border-[#223046] rounded-xl px-4 py-2 shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-xl font-black text-white tracking-wider">
                      0{btcTimer.mins} {btcTimer.secs < 10 ? `0${btcTimer.secs}` : btcTimer.secs}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">
                      MINS SECS
                    </span>
                  </div>
                  <div className="h-7 w-px bg-neutral-800" />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" className="w-4 h-4">
                      <path d="M12 2.5L21.5 8V16L12 21.5L2.5 16V8L12 2.5Z" />
                      <path d="M12 2.5V21.5" />
                      <path d="M2.5 8L21.5 16" />
                      <path d="M2.5 16L21.5 8" />
                    </svg>
                    <span>ሃገራዊ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Price to beat & Current Price for BTC 5m */}
            {isBtc5m && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1e2738]">
                <div className="bg-[#090d14] rounded-xl p-3 border border-[#1e293b]">
                  <div className="text-[11px] text-neutral-400 font-medium">Price to Beat</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-neutral-200">
                    {(market.priceToBeat || 79812.33).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </div>
                </div>

                <div className="bg-[#090d14] rounded-xl p-3 border border-emerald-500/30">
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Current Price
                  </div>
                  <div className="text-base sm:text-lg font-mono font-black text-emerald-400">
                    {currentBtcPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </div>
                </div>

                <div className="bg-[#090d14] rounded-xl p-3 border border-[#1e293b]">
                  <div className="text-[11px] text-neutral-400 font-medium">Target Line</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-amber-400">
                    {(market.targetPrice || 79814.00).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </div>
                </div>

                <div className="bg-[#090d14] rounded-xl p-3 border border-[#1e293b]">
                  <div className="text-[11px] text-neutral-400 font-medium">Resolution Source</div>
                  <div className="text-xs font-mono font-bold text-sky-400 truncate mt-1">
                    Chainlink TWAP
                  </div>
                </div>
              </div>
            )}

            {/* Interactive SVG Chart */}
            <div className="mt-6">
              {/* Date / Timeframe Selectors */}
              <div className="flex items-center justify-between gap-2 mb-3 text-xs">
                {isFed ? (
                  <div className="flex items-center gap-1.5 bg-[#090d14] p-1 rounded-lg border border-[#1e293b]">
                    {['Post', 'Sep 16', 'Oct 28', 'Dec 9', 'Jan 27, 2027'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveDateTab(tab)}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          activeDateTab === tab ? 'bg-[#1e2738] text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                ) : hoveredChartPoint ? (
                  <div className="flex items-center gap-3 text-xs font-semibold text-neutral-300">
                    <span className="text-blue-400 font-bold">{hoveredChartPoint.leadName}</span>
                    <span className="font-mono text-white text-sm">{hoveredChartPoint.leadVal.toFixed(1)}%</span>
                    <span className="text-neutral-400 font-mono text-xs">{hoveredChartPoint.date}</span>
                  </div>
                ) : isBtc5m ? (
                  <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                    <span className="text-emerald-400 font-bold">+ 8 ETB</span>
                    <span className="text-emerald-400 font-bold">+ 15 ETB</span>
                    <span className="text-emerald-400 font-bold">+ 8 ETB</span>
                    <span className="text-rose-400 font-bold">- 3 ETB</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-xs font-semibold text-neutral-300">
                    <span className="text-blue-400 font-bold">{selectedOutcome.name}</span>
                    <span className="font-mono text-white text-sm">{selectedOutcome.probability}%</span>
                    {selectedOutcome.change && (
                      <span className="text-emerald-400 font-mono text-xs">{selectedOutcome.change}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 bg-[#090d14] p-1 rounded-lg border border-[#1e293b]">
                  {['1H', '6H', '1D', '1W', '1M', 'ALL'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setActiveTimeframe(tf)}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                        activeTimeframe === tf ? 'bg-[#1e2738] text-white font-bold' : 'text-neutral-500 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Graph Canvas with Fluid Cursor Movement */}
              <PolymarketInteractiveChart
                market={market}
                timeframe={activeTimeframe}
                onHoverChange={setHoveredChartPoint}
              />

              <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 font-mono">
                <span>{market.volume}</span>
                <span className="text-neutral-600 font-mono text-[10px]">Real-time scrub enabled</span>
              </div>
            </div>
          </div>

          {/* Outcomes Matrix / Table */}
          <div className="bg-[#111622] border border-[#1e2738] rounded-2xl p-5 sm:p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Market Outcomes & Pricing
            </h3>

            <div className="flex flex-col divide-y divide-[#1e2738]">
              {market.outcomes.map((outcome, idx) => {
                const isSelected = selectedOutcomeIndex === idx;
                const yesPrice = outcome.yesPrice || outcome.probability;
                const noPrice = outcome.noPrice || 100 - outcome.probability;

                return (
                  <div
                    key={outcome.name}
                    onClick={() => setSelectedOutcomeIndex(idx)}
                    className={`py-3.5 px-3 -mx-3 rounded-xl flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#172030] border border-[#2b3a52]' : 'hover:bg-[#151c2a]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {outcome.avatar ? (
                        <img
                          src={outcome.avatar}
                          alt={outcome.name}
                          className="w-9 h-9 rounded-full object-cover border border-neutral-700 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#1b2536] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                          <span>{outcome.name}</span>
                          {outcome.change && (
                            <span
                              className={`text-[11px] font-mono font-semibold ${
                                outcome.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {outcome.change}
                            </span>
                          )}
                        </div>
                        {outcome.volume && (
                          <div className="text-xs text-neutral-400 font-mono mt-0.5">
                            {outcome.volume}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-extrabold text-base text-white mr-2">
                        {outcome.probability}%
                      </span>

                      {/* Buy Yes Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOutcomeIndex(idx);
                          setTradeSide('yes');
                          handleExecuteTrade(25, outcome, 'yes');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer flex flex-col items-center leading-tight"
                      >
                        <span>Buy Yes</span>
                        <span className="font-mono text-[10px] opacity-90">{yesPrice}¢</span>
                      </button>

                      {/* Buy No Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOutcomeIndex(idx);
                          setTradeSide('no');
                          handleExecuteTrade(25, outcome, 'no');
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer flex flex-col items-center leading-tight"
                      >
                        <span>Buy No</span>
                        <span className="font-mono text-[10px] opacity-90">{noPrice}¢</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BTC Order Book Collapsible Section */}
          {isBtc5m && (
            <div className="bg-[#111622] border border-[#1e2738] rounded-2xl overflow-hidden shadow-xl">
              <button
                onClick={() => setOrderBookOpen(!orderBookOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#161f30] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Order Book</span>
                  <span className="text-xs font-mono text-neutral-400">{market.orderBookVolume || '240 ETB Vol.'}</span>
                </div>
                {orderBookOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {orderBookOpen && (
                <div className="p-4 pt-0 border-t border-[#1e2738] grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-400 mb-2">BIDS (UP)</div>
                    <div className="flex justify-between text-neutral-300 py-1"><span>51.0¢</span><span>120.50 ETB</span></div>
                    <div className="flex justify-between text-neutral-400 py-1"><span>50.5¢</span><span>84.00 ETB</span></div>
                    <div className="flex justify-between text-neutral-500 py-1"><span>49.0¢</span><span>35.50 ETB</span></div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-rose-400 mb-2">ASKS (DOWN)</div>
                    <div className="flex justify-between text-neutral-300 py-1"><span>51.5¢</span><span>95.00 ETB</span></div>
                    <div className="flex justify-between text-neutral-400 py-1"><span>52.0¢</span><span>45.00 ETB</span></div>
                    <div className="flex justify-between text-neutral-500 py-1"><span>53.0¢</span><span>100.00 ETB</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rules & Market Context */}
          <div className="bg-[#111622] border border-[#1e2738] rounded-2xl p-5 sm:p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Rules & Market Context
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
              {market.rulesText ||
                "This market will resolve according to official consensus verified by decentralized oracles upon event conclusion."}
            </p>

            <div className="mt-4 pt-4 border-t border-[#1e2738] flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500">Market Opened:</span>
                <span className="text-neutral-300 font-mono">{market.marketOpened || 'Apr 27, 2024'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500">Resolver:</span>
                <span className="text-sky-400 font-mono">{market.resolverAddress || 'UMA 0x9fc47De9D...'}</span>
              </div>
            </div>
          </div>

          {/* Comments & Discussion Tabs */}
          <div className="bg-[#111622] border border-[#1e2738] rounded-2xl p-5 sm:p-6 shadow-xl">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-[#1e2738] pb-3 mb-4">
              <div className="flex items-center gap-4 text-xs sm:text-sm font-bold">
                <button
                  onClick={() => setActiveSectionTab('comments')}
                  className={`pb-3 -mb-3 border-b-2 transition-colors cursor-pointer ${
                    activeSectionTab === 'comments'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Comments ({comments.length || market.commentsCount || 43})
                </button>
                <button
                  onClick={() => setActiveSectionTab('holders')}
                  className={`pb-3 -mb-3 border-b-2 transition-colors cursor-pointer ${
                    activeSectionTab === 'holders'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Top Holders
                </button>
                <button
                  onClick={() => setActiveSectionTab('positions')}
                  className={`pb-3 -mb-3 border-b-2 transition-colors cursor-pointer ${
                    activeSectionTab === 'positions'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Positions
                </button>
                <button
                  onClick={() => setActiveSectionTab('activity')}
                  className={`pb-3 -mb-3 border-b-2 transition-colors cursor-pointer ${
                    activeSectionTab === 'activity'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Activity
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="hidden sm:inline text-[11px] text-amber-400/80 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Beware of external links
                </span>
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full h-11 bg-[#090d14] border border-[#1e2738] rounded-xl px-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors pr-24"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="flex flex-col divide-y divide-[#182130]">
              {comments.map((c) => (
                <div key={c.id} className="py-3.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-200">{c.author}</span>
                      <span className="text-[11px] text-neutral-500">{c.timeAgo}</span>
                      {c.sharesOutcome && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">
                          {c.sharesOutcome}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{c.text}</p>

                  {/* Nested Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-[#1e2738] flex flex-col gap-2">
                      {c.replies.map((reply) => (
                        <div key={reply.id} className="text-xs text-neutral-300">
                          <span className="font-bold text-neutral-200 mr-2">{reply.author}</span>
                          <span className="text-neutral-400">{reply.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Back to top button */}
            <div className="mt-6 pt-4 border-t border-[#1e2738] flex justify-center">
              <button
                onClick={scrollToTop}
                className="px-4 py-1.5 rounded-lg bg-[#151d2c] hover:bg-[#1d273a] text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar (4 cols): Exact Polymarket Trade Widget */}
        <div className="lg:col-span-4 sticky top-20 flex flex-col gap-4">
          <div className="bg-[#111622] border border-[#1e2738] rounded-2xl p-5 shadow-2xl">
            {/* Header info */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e2738]">
              <div className="flex items-center gap-2 min-w-0">
                {selectedOutcome.avatar && (
                  <img src={selectedOutcome.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                )}
                <span className="text-xs font-bold text-neutral-200 truncate">
                  {market.title}
                </span>
              </div>
              <span className="text-xs font-bold text-blue-400 shrink-0">
                {selectedOutcome.name}
              </span>
            </div>

            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 gap-1 bg-[#090d14] p-1 rounded-xl border border-[#1e2738] mb-4">
              <button
                onClick={() => setTradeSide('yes')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tradeSide === 'yes' ? 'bg-[#182233] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeSide('no')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tradeSide === 'no' ? 'bg-[#182233] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sell
              </button>
            </div>

            {/* For BTC 5m: Big Up / Down Action buttons */}
            {isBtc5m ? (
              <div className="flex flex-col gap-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setTradeSide('yes');
                      handleExecuteTrade(25, market.outcomes[0], 'yes');
                    }}
                    className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm flex flex-col items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer"
                  >
                    <span>Up 50¢</span>
                  </button>
                  <button
                    onClick={() => {
                      setTradeSide('no');
                      handleExecuteTrade(25, market.outcomes[1], 'no');
                    }}
                    className="py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-sm flex flex-col items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer"
                  >
                    <span>Down 51¢</span>
                  </button>
                </div>

                {/* One-tap Buy Presets */}
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
                  One-tap buy
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { amount: 5, win: 10 },
                    { amount: 25, win: 50 },
                    { amount: 100, win: 200 },
                  ].map((preset) => (
                    <button
                      key={preset.amount}
                      onClick={() => handleExecuteTrade(preset.amount)}
                      className="bg-[#090d14] hover:bg-[#182335] border border-[#1e293b] rounded-xl p-2.5 flex flex-col items-center transition-all active:scale-95 cursor-pointer"
                    >
                      <span className="text-xs font-black text-white">{preset.amount} ETB</span>
                      <span className="text-[10px] text-neutral-400 font-mono">win {preset.win} ETB</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Standard Yes / No Trade Controls */
              <div className="flex flex-col gap-4 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTradeSide('yes')}
                    className={`py-3 rounded-xl font-black text-sm flex flex-col items-center transition-all cursor-pointer ${
                      tradeSide === 'yes'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-500 border border-emerald-600/40'
                    }`}
                  >
                    <span>Yes {selectedOutcome.yesPrice || selectedOutcome.probability}¢</span>
                  </button>
                  <button
                    onClick={() => setTradeSide('no')}
                    className={`py-3 rounded-xl font-black text-sm flex flex-col items-center transition-all cursor-pointer ${
                      tradeSide === 'no'
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'bg-rose-600/15 hover:bg-rose-600/25 text-rose-500 border border-rose-600/40'
                    }`}
                  >
                    <span>No {selectedOutcome.noPrice || 100 - selectedOutcome.probability}¢</span>
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1.5 font-medium">
                    <span>Amount</span>
                    <span className="font-mono">Balance: {user.balance.toFixed(2)} ETB</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-400 text-base">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={tradeAmount === 0 ? '' : tradeAmount}
                      onChange={(e) => setTradeAmount(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full h-12 bg-[#090d14] border border-[#1e2738] rounded-xl pl-8 pr-4 text-base font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Preset Amount Chips */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[1, 5, 10, 100].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTradeAmount((prev) => prev + amt)}
                        className="py-1.5 bg-[#090d14] hover:bg-[#182335] border border-[#1e293b] text-neutral-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
                      >
                        +{amt} ETB
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Trade Submit Button */}
                <button
                  onClick={() => handleExecuteTrade()}
                  className="w-full py-3.5 bg-[#0070e0] hover:bg-[#0080ff] text-white font-black text-sm rounded-xl transition-all shadow-xl active:scale-95 cursor-pointer mt-2"
                >
                  Trade
                </button>
              </div>
            )}

            <div className="text-[11px] text-center text-neutral-500 mt-2 font-medium">
              By trading, you agree to the Terms of Use.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
