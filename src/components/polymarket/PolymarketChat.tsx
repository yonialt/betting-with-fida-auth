import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Smile,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Share2,
  Bot,
  Zap,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useBetting } from '../../context/BettingContext';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';
import { POLYMARKET_HERO, POLYMARKET_ALL_MARKETS } from '../../data/polymarketData';

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  badge?: 'Whale' | 'Top Trader' | 'Pro' | 'AI Oracle' | 'Mod';
  badgeColor?: string;
  text: string;
  channel: string;
  timestamp: string;
  isTradeAlert?: boolean;
  tradeDetails?: {
    marketTitle: string;
    side: 'YES' | 'NO' | string;
    price: number;
    amount: string;
  };
  isAi?: boolean;
  reactions: { [emoji: string]: number };
}

interface PolymarketChatProps {
  initialChannel?: string;
  selectedMarket?: PolymarketMarket | null;
  onTradeClick?: (trade: PolymarketTradeState) => void;
  compact?: boolean;
  className?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'SatoshiPrediction',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=faces',
    badge: 'Top Trader',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    text: 'Fed probability of 50bps rate cut in September just bounced to 44% following morning jobs revision. Huge volume moving in!',
    channel: '#fed-rates',
    timestamp: '2m ago',
    reactions: { '🚀': 14, '🔥': 8, '🐂': 19 },
  },
  {
    id: 'msg-2',
    sender: 'WhaleWatcher_0x82',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=64&h=64&fit=crop&crop=faces',
    badge: 'Whale',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    text: 'Just loaded $35,000 YES position on Gen.G winning LCK 2-0. KT drafting has been shaky all split.',
    channel: '#sports',
    timestamp: '1m ago',
    isTradeAlert: true,
    tradeDetails: {
      marketTitle: 'Gen.G vs KT Rolster - Match Winner',
      side: 'YES (Gen.G)',
      price: 92,
      amount: '$35,000',
    },
    reactions: { '🐋': 28, '🔥': 12 },
  },
  {
    id: 'msg-3',
    sender: 'Polymarket AI Oracle',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop',
    badge: 'AI Oracle',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    text: '📊 Market Brief: Claude Mythos by Oct 31 is currently trading at 96¢ (96% probability) with over $971K in 24h trading volume. Order book liquidity depth remains heavily bid.',
    channel: '#general',
    timestamp: 'Just now',
    isAi: true,
    reactions: { '🎯': 21, '⚡': 15 },
  },
  {
    id: 'msg-4',
    sender: 'AlphaSeeker_eth',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces',
    badge: 'Pro',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    text: 'Bitcoin holding above $64k. Up or Down Bitcoin market for 5:30 PM is pricing 78% UP right now.',
    channel: '#crypto-perps',
    timestamp: 'Just now',
    reactions: { '🐂': 9, '🚀': 16 },
  },
];

const CHANNELS = [
  { id: '#general', label: '#general', count: '1.2k' },
  { id: '#fed-rates', label: '#fed-rates', count: '840' },
  { id: '#politics', label: '#politics-2024', count: '2.1k' },
  { id: '#crypto-perps', label: '#crypto-perps', count: '1.5k' },
  { id: '#sports', label: '#sports', count: '690' },
  { id: '#ai-oracle', label: '#ai-oracle', count: 'Bot' },
];

export const PolymarketChat: React.FC<PolymarketChatProps> = ({
  initialChannel = '#general',
  selectedMarket,
  onTradeClick,
  compact = false,
  className = '',
}) => {
  const { user } = useBetting();
  const [activeChannel, setActiveChannel] = useState<string>(initialChannel);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [bullishVotes, setBullishVotes] = useState<number>(68);
  const [userVoted, setUserVoted] = useState<'bull' | 'bear' | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [aiThinking, setAiThinking] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages change if not paused
  useEffect(() => {
    if (!isPaused) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isPaused]);

  // Simulated real-time incoming chatter & whale trades
  useEffect(() => {
    if (isPaused) return;

    const simulatedNames = ['CryptoWhale99', 'PredictMaster', 'MacroAlpha', 'DeFiDegen', 'VoltTrader', 'QuantAnalyst'];
    const simulatedAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=64&h=64&fit=crop',
    ];
    const generalPool = [
      'Order book spread is tightening fast on the September 30 target! 📈',
      'Anyone looking at the UEFA Champions League winner odds? Real Madrid at 22% seems solid value.',
      'Fed minutes tomorrow will decide if we hit 50bps or 25bps. Market is split 50/50.',
      'Just cashed out +34% profit on the Bitcoin weekly prediction 🔥',
      'Whales are accumulating YES shares heavily this afternoon.',
      'Who is watching the LCK playoff finals live? Insane draft in Game 2!',
    ];

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * generalPool.length);
      const isTrade = Math.random() > 0.65;
      const randomSender = simulatedNames[Math.floor(Math.random() * simulatedNames.length)];
      const randomAvatar = simulatedAvatars[Math.floor(Math.random() * simulatedAvatars.length)];

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: randomSender,
        avatar: randomAvatar,
        badge: isTrade ? 'Whale' : 'Pro',
        badgeColor: isTrade
          ? 'bg-purple-100 text-purple-800 border-purple-300'
          : 'bg-emerald-100 text-emerald-800 border-emerald-300',
        text: isTrade
          ? `Executed market order: $${(Math.floor(Math.random() * 15) + 5) * 1000} on high volume prediction.`
          : generalPool[randomIdx],
        channel: activeChannel,
        timestamp: 'Just now',
        isTradeAlert: isTrade,
        tradeDetails: isTrade
          ? {
              marketTitle: 'Claude Mythos - Next-Gen Model Release',
              side: 'YES (Oct 31)',
              price: 96,
              amount: `$${(Math.floor(Math.random() * 25) + 8) * 1000}`,
            }
          : undefined,
        reactions: { '🔥': 2, '🚀': 1 },
      };

      setMessages((prev) => [...prev.slice(-40), newMsg]);
    }, 6500);

    return () => clearInterval(interval);
  }, [isPaused, activeChannel]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: user.isLoggedIn ? user.username : 'You (Trader)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop',
      badge: 'Pro',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      text: userText,
      channel: activeChannel,
      timestamp: 'Just now',
      reactions: { '👍': 1 },
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // If in #ai-oracle channel or user mentioned @ai, provide instant intelligent oracle response
    if (activeChannel === '#ai-oracle' || userText.toLowerCase().includes('@ai') || userText.toLowerCase().includes('oracle')) {
      setAiThinking(true);
      setTimeout(() => {
        setAiThinking(false);
        const aiResponse: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'Polymarket AI Oracle',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop',
          badge: 'AI Oracle',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          text: generateAiAnalysis(userText),
          channel: activeChannel,
          timestamp: 'Just now',
          isAi: true,
          reactions: { '🎯': 3, '⚡': 2 },
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1200);
    }
  };

  const generateAiAnalysis = (prompt: string): string => {
    const p = prompt.toLowerCase();
    if (p.includes('fed') || p.includes('rate') || p.includes('cut')) {
      return '🧠 Fed Rates Forecast: Polymarket order flow currently prices a 56% probability of 25bps cut and 44% probability of 50bps cut. Key catalyst: upcoming CPI print and Jackson Hole remarks.';
    }
    if (p.includes('claude') || p.includes('model') || p.includes('mythos') || p.includes('ai')) {
      return '🧠 AI Release Market: "October 31" outcome holds a 96% win probability with massive liquidity ($971K volume). Historical delivery timelines suggest end of Q3/early Q4 target.';
    }
    if (p.includes('btc') || p.includes('bitcoin') || p.includes('crypto')) {
      return '🧠 Crypto Momentum: Real-time order books indicate 78% bullish sentiment on BTC holding above key moving averages through today\'s settlement.';
    }
    return `🧠 Polymarket Market Analysis: Analyzing real-time order books and historical prediction volume for "${prompt.slice(0, 40)}...". Liquidity depth is strong with balanced 64/36 buy-to-sell ratios.`;
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const currentCount = msg.reactions[emoji] || 0;
          return {
            ...msg,
            reactions: {
              ...msg.reactions,
              [emoji]: currentCount + 1,
            },
          };
        }
        return msg;
      })
    );
  };

  const handleShareMarketPosition = () => {
    const market = selectedMarket || POLYMARKET_HERO;
    const shareMsg: ChatMessage = {
      id: `share-${Date.now()}`,
      sender: user.isLoggedIn ? user.username : 'You (Trader)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop',
      badge: 'Top Trader',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      text: `📢 Discussing live market: "${market.title}" (Current volume: ${market.volume})`,
      channel: activeChannel,
      timestamp: 'Just now',
      isTradeAlert: true,
      tradeDetails: {
        marketTitle: market.title,
        side: market.outcomes[0]?.name || 'YES',
        price: market.outcomes[0]?.probability || 50,
        amount: '100 Shares',
      },
      reactions: { '🔥': 5, '🎯': 4 },
    };
    setMessages((prev) => [...prev, shareMsg]);
  };

  const handleVoteSentiment = (type: 'bull' | 'bear') => {
    if (userVoted === type) return;
    setUserVoted(type);
    if (type === 'bull') {
      setBullishVotes((prev) => Math.min(99, prev + 2));
    } else {
      setBullishVotes((prev) => Math.max(1, prev - 2));
    }
  };

  const filteredMessages = messages.filter(
    (m) => m.channel === activeChannel || activeChannel === '#general'
  );

  return (
    <div
      id="polymarket-live-chat"
      className={`w-full bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col overflow-hidden text-neutral-900 ${
        compact ? 'h-[520px]' : 'h-[620px]'
      } ${className}`}
    >
      {/* 1. Chat Top Header Bar */}
      <div className="bg-[#f8fafc] border-b border-neutral-200 px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            💬
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-neutral-900">
              <span>Polymarket Trollbox</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                2,841 Live
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">Real-time prediction discussions & whale alerts</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-neutral-500">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute chat chime' : 'Enable chat chime'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              isPaused ? 'bg-amber-100 text-amber-800' : 'hover:bg-neutral-200'
            }`}
            title={isPaused ? 'Resume auto-scroll' : 'Pause chat stream'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Channel Filter Pills */}
      <div className="bg-white border-b border-neutral-100 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
        {CHANNELS.map((ch) => {
          const isActive = activeChannel === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              <span>{ch.label}</span>
              <span
                className={`text-[9px] px-1 rounded ${
                  isActive ? 'bg-blue-700 text-blue-100' : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {ch.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Community Sentiment Meter Bar */}
      <div className="bg-gradient-to-r from-emerald-50 via-neutral-50 to-red-50 border-b border-neutral-200 px-3 py-1.5 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-neutral-700">Sentiment:</span>
          <div className="flex items-center gap-1">
            <span className="text-emerald-700 font-extrabold text-[11px]">{bullishVotes}% Bullish</span>
            <div className="w-16 sm:w-24 h-2 bg-neutral-200 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${bullishVotes}%` }}
              />
              <div
                className="bg-red-500 h-full transition-all duration-300"
                style={{ width: `${100 - bullishVotes}%` }}
              />
            </div>
            <span className="text-red-700 font-extrabold text-[11px]">{100 - bullishVotes}%</span>
          </div>
        </div>

        {/* Sentiment Vote Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVoteSentiment('bull')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer ${
              userVoted === 'bull'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
            }`}
          >
            <TrendingUp className="w-2.5 h-2.5" />
            <span>Bull 🐂</span>
          </button>
          <button
            onClick={() => handleVoteSentiment('bear')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer ${
              userVoted === 'bear'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-100 hover:bg-red-200 text-red-800'
            }`}
          >
            <TrendingDown className="w-2.5 h-2.5" />
            <span>Bear 🐻</span>
          </button>
        </div>
      </div>

      {/* 4. Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#fafbfe]">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`group rounded-xl p-2.5 transition-colors ${
              msg.isAi
                ? 'bg-blue-50/80 border border-blue-200/80'
                : msg.isTradeAlert
                ? 'bg-purple-50/80 border border-purple-200/80'
                : 'bg-white border border-neutral-150 hover:border-neutral-300 shadow-2xs'
            }`}
          >
            {/* Header of message: Avatar, Name, Badge, Time */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <img
                  src={msg.avatar}
                  alt={msg.sender}
                  className="w-5 h-5 rounded-full object-cover border border-neutral-200"
                />
                <span className="font-bold text-xs text-neutral-900">{msg.sender}</span>
                {msg.badge && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                      msg.badgeColor || 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {msg.badge}
                  </span>
                )}
                {msg.isAi && <Sparkles className="w-3 h-3 text-blue-600" />}
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">{msg.timestamp}</span>
            </div>

            {/* Message Body */}
            <p className="text-xs text-neutral-800 leading-relaxed font-normal">{msg.text}</p>

            {/* Trade Alert Card Snippet inside chat */}
            {msg.tradeDetails && (
              <div className="mt-2 p-2 bg-white/90 border border-neutral-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    Market Position
                  </div>
                  <div className="text-xs font-bold text-neutral-900 truncate">
                    {msg.tradeDetails.marketTitle}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold mt-0.5">
                    <span className="text-emerald-600 font-extrabold">{msg.tradeDetails.side}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-700">{msg.tradeDetails.price}¢</span>
                    <span className="text-neutral-400">·</span>
                    <span className="font-mono text-purple-700 font-bold">{msg.tradeDetails.amount}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const hero = POLYMARKET_HERO;
                    onTradeClick?.({
                      market: hero,
                      outcome: hero.outcomes[0],
                      side: 'yes',
                      price: msg.tradeDetails?.price || 96,
                    });
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  Trade
                </button>
              </div>
            )}

            {/* Reactions bar */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {Object.entries(msg.reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(msg.id, emoji)}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-[10px] font-bold transition-all cursor-pointer"
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              ))}

              {/* Quick Add Reaction buttons */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto">
                {['🔥', '🚀', '🎯', '🐂'].map((emo) => (
                  <button
                    key={emo}
                    onClick={() => handleReaction(msg.id, emo)}
                    className="hover:scale-125 transition-transform text-xs cursor-pointer p-0.5"
                    title={`React ${emo}`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {aiThinking && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-blue-900 animate-pulse">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="font-bold">Polymarket AI Oracle is analyzing market order book...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Quick Prompts / Share Position Action Row */}
      <div className="bg-white border-t border-neutral-100 px-3 py-1.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShareMarketPosition}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-colors cursor-pointer border border-blue-200 whitespace-nowrap"
            title="Share active market probability to trollbox"
          >
            <Share2 className="w-3 h-3" />
            <span>Share Market</span>
          </button>

          <button
            onClick={() => {
              setActiveChannel('#ai-oracle');
              setInputText('Analyze odds for Fed 50bps rate cut in September');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold transition-colors cursor-pointer border border-purple-200 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Ask AI: Fed Cut</span>
          </button>

          <button
            onClick={() => {
              setActiveChannel('#ai-oracle');
              setInputText('Who has the highest winning probability in Claude Mythos release?');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors cursor-pointer border border-indigo-200 whitespace-nowrap"
          >
            <Bot className="w-3 h-3 text-indigo-600" />
            <span>Ask AI: Claude</span>
          </button>
        </div>

        {/* Emoji Quick Picker Trigger */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
        >
          <Smile className="w-4 h-4" />
        </button>
      </div>

      {/* 6. Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="bg-white border-t border-neutral-200 px-3 py-1.5 flex items-center gap-2 overflow-x-auto shrink-0 bg-neutral-50">
          {['🚀', '🔥', '🐂', '🐻', '📉', '🎯', '🐋', '💎', '🍿', '⚡'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + ' ' + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-base hover:scale-125 transition-transform cursor-pointer p-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 7. Chat Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-neutral-200 p-2.5 flex items-center gap-2 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeChannel}...`}
            className="w-full bg-[#f4f6f8] focus:bg-white border border-neutral-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all pr-8"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
            inputText.trim()
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
