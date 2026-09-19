import React, { useState, useEffect, useRef } from 'react';
import { Send, Pause, Play, Zap, X } from 'lucide-react';
import { useBetting } from '../../context/BettingContext';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';

/** UI strings — English / Amharic. */
const STRINGS = {
  en: {
    title: 'Live chat',
    messagePlaceholder: (ch: string) => `Message #${ch}`,
    loginPlaceholder: 'Log in to chat',
    superchat: 'Superchat',
    cancel: 'Cancel',
    pause: 'Pause stream',
    resume: 'Resume',
    aiThinking: 'AI is analyzing the order book…',
    trade: 'Trade',
    insufficient: 'Low balance',
    now: 'now',
    guest: 'Guest',
    close: 'Close chat',
  },
  am: {
    title: 'ቀጥታ ውይይት',
    messagePlaceholder: (ch: string) => `መልእክት #${ch}`,
    loginPlaceholder: 'ውይይት ለመጠቀም ይግቡ',
    superchat: 'ሱፐርቻት',
    cancel: 'ሰርዝ',
    pause: 'ለአፍታ አቁም',
    resume: 'ቀጥል',
    aiThinking: 'AI ትዕዛዙን በማስተንተን ላይ…',
    trade: 'ገዛ',
    insufficient: 'ሂሳብ አልበቃ',
    now: 'አሁን',
    guest: 'እንግዳ',
    close: 'ውይይቱን ዝጋ',
  },
} as const;

/** Avatar: real image when provided, otherwise an initials circle derived from the name. */
const Avatar: React.FC<{ name: string; url?: string; cls?: string }> = ({ name, url, cls = 'w-6 h-6' }) => {
  if (url) {
    return <img src={url} alt="" className={`${cls} rounded-full object-cover shrink-0`} />;
  }
  const hue = [...(name || '?')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className={`${cls} rounded-full shrink-0 flex items-center justify-center text-white font-black text-[10px] select-none`}
      style={{ backgroundColor: `hsl(${hue} 55% 45%)` }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
};

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  channel: string;
  timestamp: string;
  isAi?: boolean;
  /** Highlighted Superchat (paid highlight or whale trade announcement). */
  isSuperchat?: boolean;
  superAmount?: number;
  tradeDetails?: {
    marketTitle: string;
    side: string;
    price: number;
    amount: string;
  };
}

interface PolymarketChatProps {
  initialChannel?: string;
  selectedMarket?: PolymarketMarket | null;
  onTradeClick?: (trade: PolymarketTradeState) => void;
  compact?: boolean;
  className?: string;
  /** When provided, a close (X) control renders in the chat header. */
  onClose?: () => void;
}

const CHANNELS = [
  { id: 'general', label: 'general' },
  { id: 'politics', label: 'politics' },
  { id: 'crypto', label: 'crypto' },
  { id: 'sports', label: 'sports' },
  { id: 'ai', label: 'ai' },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'MacroAlpha',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    text: 'Fed probability of a 50bps cut in September bounced to 44% after the morning jobs revision.',
    channel: 'general',
    timestamp: '2m',
  },
  {
    id: 'm2',
    sender: 'WhaleWatcher',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces',
    text: 'Big position just went through on the LCK final.',
    channel: 'sports',
    timestamp: '1m',
    isSuperchat: true,
    superAmount: 100,
    tradeDetails: {
      marketTitle: 'Gen.G vs KT Rolster — Match Winner',
      side: 'YES (Gen.G)',
      price: 92,
      amount: '35,000 ETB',
    },
  },
  {
    id: 'm3',
    sender: 'AlphaSeeker',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces',
    text: 'Bitcoin holding above 64k. The 5:30pm Up/Down market is pricing 78% UP.',
    channel: 'crypto',
    timestamp: '1m',
  },
];

const CHATTER_POOL = [
  'Order book spread is tightening fast on the Sep 30 target.',
  'Anyone looking at the Champions League winner odds? Real Madrid at 22% looks like value.',
  'Fed minutes tomorrow decide 50bps vs 25bps. Market is split evenly.',
  'Closed my Bitcoin weekly position for a 34% gain.',
  'Whales are accumulating YES shares heavily this afternoon.',
  'Watching the LCK playoff finals live — Game 2 draft was wild.',
];

const NAMES = ['CryptoWhale99', 'PredictMaster', 'MacroAlpha', 'VoltTrader', 'QuantAnalyst', 'DeFiDegen'];
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=64&h=64&fit=crop',
];

const SUPER_TIERS = [
  { min: 100, cls: 'bg-amber-50/90 border-amber-300', badge: 'bg-amber-500' },
  { min: 50, cls: 'bg-violet-50/90 border-violet-300', badge: 'bg-violet-500' },
  { min: 0, cls: 'bg-blue-50/90 border-blue-300', badge: 'bg-blue-600' },
];

const tierFor = (amount: number) => SUPER_TIERS.find((t) => amount >= t.min) || SUPER_TIERS[2];

export const PolymarketChat: React.FC<PolymarketChatProps> = ({
  initialChannel = 'general',
  selectedMarket,
  onTradeClick,
  compact = false,
  className = '',
  onClose,
}) => {
  const { user, language, openAuthModal } = useBetting();
  const S = STRINGS[language];
  const isGuest = !user.isLoggedIn;
  const [activeChannel, setActiveChannel] = useState<string>(initialChannel);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [superAmount, setSuperAmount] = useState<number | null>(null);
  const [pinned, setPinned] = useState<ChatMessage | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPaused) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPaused]);

  const pushMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev.slice(-60), msg]);
    if (msg.isSuperchat) {
      setPinned(msg);
      if (pinTimer.current) clearTimeout(pinTimer.current);
      pinTimer.current = setTimeout(() => setPinned(null), 8000);
    }
  };

  // Simulated live chatter: quiet, human, emoji-free. Every third event is a
  // whale trade that lands as a Superchat card.
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const isTrade = Math.random() > 0.65;
      const sender = NAMES[Math.floor(Math.random() * NAMES.length)];
      const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

      if (isTrade) {
        const amount = (Math.floor(Math.random() * 25) + 8) * 1000;
        pushMessage({
          id: `msg-${Date.now()}`,
          sender,
          avatar,
          text: 'Executed a market order on high volume.',
          channel: activeChannel,
          timestamp: language === 'am' ? 'አሁን' : 'now',
          isSuperchat: true,
          superAmount: 100,
          tradeDetails: {
            marketTitle: 'Claude Mythos — Next-Gen Model Release',
            side: 'YES (Oct 31)',
            price: 96,
            amount: `${amount.toLocaleString()} ETB`,
          },
        });
      } else {
        pushMessage({
          id: `msg-${Date.now()}`,
          sender,
          avatar,
          text: CHATTER_POOL[Math.floor(Math.random() * CHATTER_POOL.length)],
          channel: activeChannel,
          timestamp: language === 'am' ? 'አሁን' : 'now',
        });
      }
    }, 9000);
    return () => clearInterval(interval);
  }, [isPaused, activeChannel, language]);

  const answerAi = (prompt: string): string => {
    const p = prompt.toLowerCase();
    if (p.includes('fed') || p.includes('rate') || p.includes('cut')) {
      return 'Fed rates: order flow currently prices 56% for a 25bps cut and 44% for 50bps. Key catalysts: the next CPI print and Jackson Hole remarks.';
    }
    if (p.includes('claude') || p.includes('model') || p.includes('mythos') || p.includes('ai')) {
      return 'AI release market: "October 31" holds a 96% probability with 971K ETB in 24h volume and deep bid-side liquidity.';
    }
    if (p.includes('btc') || p.includes('bitcoin') || p.includes('crypto')) {
      return 'Crypto momentum: order books indicate 78% bullish sentiment on BTC holding above key moving averages into settlement.';
    }
    return `Analysis for "${prompt.slice(0, 40)}": liquidity depth is strong with a balanced 64/36 buy-to-sell ratio across the book.`;
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userText = inputText.trim();
    if (!userText) return;

    const amount = superAmount;
    // Real profile identity: the signed-in user's actual username renders in the
    // chat (with an initials avatar); guests post as Guest.
    pushMessage({
      id: `user-${Date.now()}`,
      sender: user.isLoggedIn ? user.username : S.guest,
      avatar: '',
      text: userText,
      channel: activeChannel,
      timestamp: S.now,
      isSuperchat: amount != null,
      superAmount: amount ?? undefined,
    });
    setInputText('');
    setSuperAmount(null);

    if (activeChannel === 'ai' || userText.toLowerCase().includes('@ai')) {
      setAiThinking(true);
      fetch('/api/ai/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          marketContext: selectedMarket?.title || 'Polymarket prediction events',
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setAiThinking(false);
          pushMessage({
            id: `ai-${Date.now()}`,
            sender: 'AI',
            avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop',
            text: data?.analysis || answerAi(userText),
            channel: activeChannel,
            timestamp: S.now,
            isAi: true,
          });
        })
        .catch(() => {
          setAiThinking(false);
          pushMessage({
            id: `ai-${Date.now()}`,
            sender: 'AI',
            avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop',
            text: answerAi(userText),
            channel: activeChannel,
            timestamp: S.now,
            isAi: true,
          });
        });
    }
  };

  const filtered = messages.filter((m) => m.channel === activeChannel || activeChannel === 'general');

  return (
    <div
      id="polymarket-live-chat"
      className={`w-full bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col overflow-hidden text-neutral-900 ${
        compact ? 'h-[520px]' : 'h-[620px]'
      } ${className}`}
    >
      {/* Header */}
      <div className="border-b border-neutral-100 px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-xs sm:text-sm text-neutral-900">{S.title}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            2,841
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
            title={isPaused ? S.resume : S.pause}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              title={S.close}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Channels */}
      <div className="border-b border-neutral-100 px-3 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
        {CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeChannel === ch.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Pinned Superchat */}
      {pinned && (
        <div
          className={`mx-3 mt-2 rounded-xl border px-3 py-2 flex items-start gap-2.5 shrink-0 ${tierFor(pinned.superAmount || 0).cls}`}
        >
          <Avatar name={pinned.sender} url={pinned.avatar} cls="w-6 h-6" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs">{pinned.sender}</span>
              <span
                className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded-full ${
                  tierFor(pinned.superAmount || 0).badge
                }`}
              >
                {pinned.superAmount ? `${pinned.superAmount} ETB` : S.superchat.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed truncate">{pinned.text}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {filtered.map((msg) =>
          msg.isSuperchat ? (
            /* Superchat: highlighted card */
            <div
              key={msg.id}
              className={`rounded-xl border px-3 py-2.5 ${tierFor(msg.superAmount || 0).cls}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Avatar name={msg.sender} url={msg.avatar} cls="w-5 h-5" />
                <span className="font-bold text-xs">{msg.sender}</span>
                {msg.superAmount ? (
                  <span
                    className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded-full ${
                      tierFor(msg.superAmount).badge
                    }`}
                  >
                    {msg.superAmount} ETB
                  </span>
                ) : null}
                <span className="ml-auto text-[10px] text-neutral-400">{msg.timestamp}</span>
              </div>
              <p className="text-xs text-neutral-800 leading-relaxed">{msg.text}</p>
              {msg.tradeDetails && (
                <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-neutral-900 truncate">
                      {msg.tradeDetails.marketTitle}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-semibold">
                      {msg.tradeDetails.side} · {msg.tradeDetails.price}% ·{' '}
                      <span className="font-mono">{msg.tradeDetails.amount}</span>
                    </div>
                  </div>
                  {onTradeClick && selectedMarket && (
                    <button
                      onClick={() => {
                        onTradeClick({
                          market: selectedMarket,
                          outcome: selectedMarket.outcomes[0],
                          side: 'yes',
                          price: msg.tradeDetails?.price || 50,
                        });
                      }}
                      className="px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-700 text-white text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      {S.trade}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Regular message: clean single row */
            <div key={msg.id} className="group flex items-start gap-2.5 px-1 py-1 rounded-lg hover:bg-neutral-50 transition-colors">
              <Avatar name={msg.sender} url={msg.avatar} cls="w-6 h-6 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-neutral-900">{msg.sender}</span>
                  {msg.isAi && (
                    <span className="text-[9px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-px rounded">
                      AI
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-400">{msg.timestamp}</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed break-words">{msg.text}</p>
              </div>
            </div>
          )
        )}

        {aiThinking && (
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-semibold">{S.aiThinking}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-neutral-100 p-2.5 shrink-0">
        {superAmount != null && (
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mr-1">{S.superchat}</span>
            {[10, 25, 50, 100].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setSuperAmount(a)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-colors cursor-pointer ${
                  superAmount === a
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {a} ETB
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSuperAmount(null)}
              className="ml-auto text-[10px] font-bold text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              {S.cancel}
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => {
              if (isGuest) {
                openAuthModal('login');
              }
            }}
            placeholder={isGuest ? S.loginPlaceholder : S.messagePlaceholder(activeChannel)}
            className="flex-1 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-400 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setSuperAmount(superAmount == null ? 50 : null)}
            title={S.superchat}
            className={`p-2 rounded-xl transition-colors shrink-0 cursor-pointer ${
              superAmount != null
                ? 'bg-amber-500 text-white'
                : 'text-neutral-400 hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
              inputText.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
