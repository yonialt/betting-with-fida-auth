import React, { useState } from 'react';
import { PolymarketMarket, PolymarketTradeState } from '../../../types/polymarket';
import {
  Search,
  Filter,
  Bookmark,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe2,
} from 'lucide-react';

interface PolymarketEthiopiaViewProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  onOpenDetail?: (market: PolymarketMarket) => void;
  isDarkMode?: boolean;
}

export interface EthiopianMarketItem {
  id: string;
  title: string;
  category: 'Politics' | 'Sports' | 'Economy' | 'Tech' | 'Culture' | 'Weather' | 'Crypto';
  categoryLabel: string;
  volume: string;
  chance: number;
  endsDate: string;
  isHot?: boolean;
  featured?: boolean;
  outcomes: {
    name: string;
    probability: number;
    yesPrice: number;
    noPrice: number;
  }[];
  description: string;
}

export const ETHIOPIAN_MARKETS_DATA: EthiopianMarketItem[] = [
  // 1. Politics: Next PM
  {
    id: 'pm-ethiopia-pm',
    title: 'Next Prime Minister of Ethiopia?',
    category: 'Politics',
    categoryLabel: 'Politics & Governance',
    volume: '$285.8M Vol.',
    chance: 97,
    endsDate: 'May 31, 2026',
    isHot: true,
    featured: true,
    description: 'Resolves to the next individual officially sworn in as Prime Minister of Ethiopia following the 2026 General elections.',
    outcomes: [
      { name: 'Abiy Ahmed', probability: 97, yesPrice: 97.1, noPrice: 4.1 },
      { name: 'Gedion Timothewos', probability: 1.3, yesPrice: 1.3, noPrice: 98.7 },
      { name: 'Belete Molla', probability: 0.8, yesPrice: 0.8, noPrice: 99.2 },
      { name: 'Berhanu Nega', probability: 0.4, yesPrice: 0.4, noPrice: 99.6 },
    ],
  },
  // 2. Tech / Energy: GERD Full Capacity
  {
    id: 'pm-eth-gerd-capacity',
    title: 'Grand Ethiopian Renaissance Dam (GERD) generation hits 100% capacity in 2026?',
    category: 'Tech',
    categoryLabel: 'Energy & Infrastructure',
    volume: '$67.3M Vol.',
    chance: 89,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    featured: true,
    description: 'Resolves to Yes if Ethiopian Electric Power certifies all 13 turbines are operational and reaching full 5,150 MW capacity.',
    outcomes: [
      { name: 'Yes', probability: 89, yesPrice: 89, noPrice: 11 },
      { name: 'No', probability: 11, yesPrice: 11, noPrice: 89 },
    ],
  },
  // 3. Geopolitics: Red Sea Port Access
  {
    id: 'pm-eth-redsea',
    title: 'Ethiopia secures official Red Sea port access accord before 2027?',
    category: 'Politics',
    categoryLabel: 'Diplomacy & Maritime',
    volume: '$42.1M Vol.',
    chance: 74,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    description: 'Resolves to Yes if a ratified sovereign port access or naval leasing treaty is executed by the Ethiopian federal government.',
    outcomes: [
      { name: 'Yes', probability: 74, yesPrice: 74, noPrice: 26 },
      { name: 'No', probability: 26, yesPrice: 26, noPrice: 74 },
    ],
  },
  // 4. Sports: Ethiopian Premier League Champion
  {
    id: 'pm-eth-premier-league',
    title: 'Ethiopian Premier League Champion 2025/2026?',
    category: 'Sports',
    categoryLabel: 'Football / Soccer',
    volume: '$12.5M Vol.',
    chance: 46,
    endsDate: 'Jun 20, 2026',
    isHot: true,
    description: 'Resolves to the official champion of the Ethiopian Premier League (BetKing EPL) crowned by the Ethiopian Football Federation.',
    outcomes: [
      { name: 'CBE SA (ኢትዮጵያ ንግድ ባንክ)', probability: 46, yesPrice: 46, noPrice: 54 },
      { name: 'Saint George SC (ቅዱስ ጊዮርጊስ)', probability: 32, yesPrice: 32, noPrice: 68 },
      { name: 'Fasil Kenema (ፋሲል ከነማ)', probability: 14, yesPrice: 14, noPrice: 86 },
      { name: 'Defense Force SC (መከላከያ)', probability: 8, yesPrice: 8, noPrice: 92 },
    ],
  },
  // 5. Economy: NBE Official Birr Rate
  {
    id: 'pm-eth-birr-fx',
    title: 'National Bank of Ethiopia Official Birr (USD/ETB) exceeds 150 before end of 2026?',
    category: 'Economy',
    categoryLabel: 'Macroeconomics & Forex',
    volume: '$24.6M Vol.',
    chance: 64,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    description: 'Resolves to Yes if the official indicative selling rate published by the National Bank of Ethiopia reaches 150.00 ETB/USD.',
    outcomes: [
      { name: 'Yes', probability: 64, yesPrice: 64, noPrice: 36 },
      { name: 'No', probability: 36, yesPrice: 36, noPrice: 64 },
    ],
  },
  // 6. Crypto: Bitcoin Mining Hub
  {
    id: 'pm-eth-bitcoin-mining',
    title: 'Ethiopia becomes top 3 Bitcoin mining hash-rate hub in Africa by Q4 2026?',
    category: 'Crypto',
    categoryLabel: 'Crypto & Green Energy',
    volume: '$19.8M Vol.',
    chance: 78,
    endsDate: 'Nov 30, 2026',
    isHot: true,
    description: 'Based on Cambridge Centre for Alternative Finance and Hashrate Index reports verifying contracted mining capacity with Ethiopian Electric Power.',
    outcomes: [
      { name: 'Yes', probability: 78, yesPrice: 78, noPrice: 22 },
      { name: 'No', probability: 22, yesPrice: 22, noPrice: 78 },
    ],
  },
  // 7. Finance: Telebirr 55M Users
  {
    id: 'pm-eth-telebirr-55m',
    title: 'Telebirr monthly active users surpass 55 Million in 2026?',
    category: 'Economy',
    categoryLabel: 'Digital Banking & Fintech',
    volume: '$15.2M Vol.',
    chance: 82,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes if Ethio Telecom announces audited Telebirr subscriber numbers exceeding 55,000,000 active accounts.',
    outcomes: [
      { name: 'Yes', probability: 82, yesPrice: 82, noPrice: 18 },
      { name: 'No', probability: 18, yesPrice: 18, noPrice: 82 },
    ],
  },
  // 8. Sports: World Athletics Marathon Gold
  {
    id: 'pm-eth-marathon-gold',
    title: 'Ethiopian athlete wins Gold in 2026 World Athletics Championships Marathon?',
    category: 'Sports',
    categoryLabel: 'Athletics & Track',
    volume: '$8.9M Vol.',
    chance: 88,
    endsDate: 'Sep 21, 2026',
    description: 'Resolves to Yes if any athlete competing under the Ethiopian flag wins either Men or Women Marathon gold medal.',
    outcomes: [
      { name: 'Yes', probability: 88, yesPrice: 88, noPrice: 12 },
      { name: 'No', probability: 12, yesPrice: 12, noPrice: 88 },
    ],
  },
  // 9. Tech: Fayda Digital ID 50M
  {
    id: 'pm-eth-fayda-50m',
    title: 'Fayda National Digital ID reaches 50 Million registered Ethiopian citizens?',
    category: 'Tech',
    categoryLabel: 'Digital Governance & Identity',
    volume: '$11.4M Vol.',
    chance: 76,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes if the National ID Program of Ethiopia (NIDP) confirms 50 Million unique registered Fayda biometric IDs.',
    outcomes: [
      { name: 'Yes', probability: 76, yesPrice: 76, noPrice: 24 },
      { name: 'No', probability: 24, yesPrice: 24, noPrice: 76 },
    ],
  },
  // 10. Culture: Coffee Export Revenue $1.8B
  {
    id: 'pm-eth-coffee-export',
    title: 'Ethiopian coffee export revenue exceeds $1.8 Billion in fiscal year 2025/26?',
    category: 'Culture',
    categoryLabel: 'Agriculture & Exports',
    volume: '$14.1M Vol.',
    chance: 72,
    endsDate: 'Jul 30, 2026',
    description: 'Resolves to Yes if the Ethiopian Coffee and Tea Authority reports total export receipts above USD 1.80 Billion.',
    outcomes: [
      { name: 'Yes', probability: 72, yesPrice: 72, noPrice: 28 },
      { name: 'No', probability: 28, yesPrice: 28, noPrice: 72 },
    ],
  },
  // 11. Tech: Bishoftu Mega-Hub Airport
  {
    id: 'pm-eth-megahub-airport',
    title: 'Bishoftu Mega-Hub International Airport first runway operational before 2028?',
    category: 'Tech',
    categoryLabel: 'Aviation & Megaprojects',
    volume: '$9.7M Vol.',
    chance: 61,
    endsDate: 'Dec 31, 2027',
    description: 'Resolves to Yes if Ethiopian Airlines Group conducts the inaugural test flight landing at the new Bishoftu Airport facility.',
    outcomes: [
      { name: 'Yes', probability: 61, yesPrice: 61, noPrice: 39 },
      { name: 'No', probability: 39, yesPrice: 39, noPrice: 61 },
    ],
  },
  // 12. Weather: Highland Kiremt Rainfall
  {
    id: 'pm-eth-kiremt-rainfall',
    title: 'National Kiremt monsoon rainfall in Ethiopian highlands above normal average in 2026?',
    category: 'Weather',
    categoryLabel: 'Climate & Monsoon',
    volume: '$6.2M Vol.',
    chance: 58,
    endsDate: 'Oct 15, 2026',
    isHot: true,
    description: 'Resolves based on the Ethiopian Meteorology Institute (EMI) post-season review comparing cumulative rainfall to the 30-year climatological baseline.',
    outcomes: [
      { name: 'Yes', probability: 58, yesPrice: 58, noPrice: 42 },
      { name: 'No', probability: 42, yesPrice: 42, noPrice: 58 },
    ],
  },
  // 13. Weather: Addis Ababa Dry Season Temperature
  {
    id: 'pm-eth-weather-addis-temp',
    title: 'Addis Ababa daily maximum temperature exceeds 28.5°C during Bega dry season?',
    category: 'Weather',
    categoryLabel: 'Meteorology & Temperature',
    volume: '$3.4M Vol.',
    chance: 48,
    endsDate: 'Feb 28, 2027',
    description: 'Resolves to Yes if Bole International Airport METAR meteorological station logs an official peak temperature equal to or exceeding 28.5°C.',
    outcomes: [
      { name: 'Yes', probability: 48, yesPrice: 48, noPrice: 52 },
      { name: 'No', probability: 52, yesPrice: 52, noPrice: 48 },
    ],
  },
  // 14. Weather: Lake Tana Water Elevation
  {
    id: 'pm-eth-weather-tana-surplus',
    title: 'Lake Tana water reservoir level remains in surplus zone through Q4 2026?',
    category: 'Weather',
    categoryLabel: 'Hydrology & Reservoirs',
    volume: '$4.8M Vol.',
    chance: 81,
    endsDate: 'Nov 30, 2026',
    description: 'Resolves based on Ministry of Water and Energy gauge readings at Bahir Dar confirming Lake Tana elevation stays above 1,786.0 meters.',
    outcomes: [
      { name: 'Yes', probability: 81, yesPrice: 81, noPrice: 19 },
      { name: 'No', probability: 19, yesPrice: 19, noPrice: 81 },
    ],
  },
  // 15. Weather: Awash River Flood Stage
  {
    id: 'pm-eth-weather-awash-river',
    title: 'Awash River Basin reaches red flood warning stage in 2026?',
    category: 'Weather',
    categoryLabel: 'Flood Warning & Runoff',
    volume: '$3.5M Vol.',
    chance: 44,
    endsDate: 'Sep 30, 2026',
    description: 'Resolves to Yes if the National Disaster Risk Management Commission issues an active Red Level flood stage warning for the Middle/Lower Awash basin.',
    outcomes: [
      { name: 'Yes', probability: 44, yesPrice: 44, noPrice: 56 },
      { name: 'No', probability: 56, yesPrice: 56, noPrice: 44 },
    ],
  },
  // 16. Weather: Green Legacy Trees
  {
    id: 'pm-eth-green-legacy-trees',
    title: 'Green Legacy Initiative national campaign plants over 7.5 Billion tree seedlings in 2026?',
    category: 'Weather',
    categoryLabel: 'Afforestation & Climate Action',
    volume: '$7.2M Vol.',
    chance: 84,
    endsDate: 'Aug 31, 2026',
    isHot: true,
    description: 'Resolves to Yes if the Ministry of Agriculture and Ethiopian Forestry Development certify over 7,500,000,000 seedlings planted in the 2026 campaign.',
    outcomes: [
      { name: 'Yes', probability: 84, yesPrice: 84, noPrice: 16 },
      { name: 'No', probability: 16, yesPrice: 16, noPrice: 84 },
    ],
  },
  // 17. Weather: Drought Alert in Afar / Somali
  {
    id: 'pm-eth-drought-somali-afar',
    title: 'Regional drought emergency declared in Afar or Somali regions in 2026?',
    category: 'Weather',
    categoryLabel: 'Drought & Climate Risk',
    volume: '$4.1M Vol.',
    chance: 38,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves based on IGAD Climate Prediction and Applications Centre (ICPAC) classifying Eastern Ethiopia in severe dry deficit.',
    outcomes: [
      { name: 'Yes', probability: 38, yesPrice: 38, noPrice: 62 },
      { name: 'No', probability: 62, yesPrice: 62, noPrice: 38 },
    ],
  },
  // 18. Politics: Election Voter Turnout 40M
  {
    id: 'pm-eth-election-turnout',
    title: '2026 Ethiopian General Election voter turnout exceeds 40 Million registered voters?',
    category: 'Politics',
    categoryLabel: 'Elections & Democracy',
    volume: '$21.5M Vol.',
    chance: 68,
    endsDate: 'Jun 30, 2026',
    isHot: true,
    description: 'Resolves to Yes if National Election Board of Ethiopia (NEBE) confirms total cast ballots exceed 40,000,000 voters.',
    outcomes: [
      { name: 'Yes', probability: 68, yesPrice: 68, noPrice: 32 },
      { name: 'No', probability: 32, yesPrice: 32, noPrice: 68 },
    ],
  },
  // 19. Politics: Tigray Interim Administration Final Accord
  {
    id: 'pm-eth-tigray-accord',
    title: 'Federal government and Tigray Interim Administration sign permanent constitutional accord in 2026?',
    category: 'Politics',
    categoryLabel: 'Peace & Governance',
    volume: '$18.3M Vol.',
    chance: 71,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes upon official execution of permanent regional institutional integration accord under the Pretoria Framework.',
    outcomes: [
      { name: 'Yes', probability: 71, yesPrice: 71, noPrice: 29 },
      { name: 'No', probability: 29, yesPrice: 29, noPrice: 71 },
    ],
  },
  // 20. Economy: ESX First 5 IPOs
  {
    id: 'pm-eth-esx-ipos',
    title: 'Ethiopian Securities Exchange (ESX) lists at least 5 public corporate IPOs in 2026?',
    category: 'Economy',
    categoryLabel: 'Capital Markets & IPOs',
    volume: '$16.8M Vol.',
    chance: 79,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    description: 'Resolves to Yes if ESX officially commences secondary trading for at least 5 distinct equity issues before end of 2026.',
    outcomes: [
      { name: 'Yes', probability: 79, yesPrice: 79, noPrice: 21 },
      { name: 'No', probability: 21, yesPrice: 21, noPrice: 79 },
    ],
  },
  // 21. Economy: Ethio Telecom IPO Oversubscription
  {
    id: 'pm-eth-ethiotelecom-ipo',
    title: 'Ethio Telecom 10% public share offering oversubscribed by over 200%?',
    category: 'Economy',
    categoryLabel: 'Equities & State Enterprise',
    volume: '$22.4M Vol.',
    chance: 77,
    endsDate: 'Nov 30, 2026',
    description: 'Resolves based on Ethiopian Investment Holdings audited subscription figures showing total bids exceed 2.0x available shares.',
    outcomes: [
      { name: 'Yes', probability: 77, yesPrice: 77, noPrice: 23 },
      { name: 'No', probability: 23, yesPrice: 23, noPrice: 77 },
    ],
  },
  // 22. Economy: Inflation below 16%
  {
    id: 'pm-eth-inflation-16',
    title: 'Ethiopia annual headline inflation rate drops below 16.0% before December 2026?',
    category: 'Economy',
    categoryLabel: 'Macroeconomics & CPI',
    volume: '$17.1M Vol.',
    chance: 52,
    endsDate: 'Dec 15, 2026',
    description: 'Resolves based on monthly Consumer Price Index (CPI) published by the Ethiopian Statistics Service (ESS).',
    outcomes: [
      { name: 'Yes', probability: 52, yesPrice: 52, noPrice: 48 },
      { name: 'No', probability: 48, yesPrice: 48, noPrice: 52 },
    ],
  },
  // 23. Sports: World Athletics Medal Table Top 5
  {
    id: 'pm-eth-world-athletics-top5',
    title: 'Ethiopia finishes in Top 5 of overall medal table at 2026 World Athletics Championships?',
    category: 'Sports',
    categoryLabel: 'World Athletics & Medals',
    volume: '$14.6M Vol.',
    chance: 82,
    endsDate: 'Sep 21, 2026',
    isHot: true,
    description: 'Resolves based on official World Athletics final medal standings (ranked by Gold medals won).',
    outcomes: [
      { name: 'Yes', probability: 82, yesPrice: 82, noPrice: 18 },
      { name: 'No', probability: 18, yesPrice: 18, noPrice: 82 },
    ],
  },
  // 24. Sports: World Half Marathon Record
  {
    id: 'pm-eth-half-marathon-wr',
    title: 'Ethiopian runner breaks Men or Women World Half Marathon record in 2026?',
    category: 'Sports',
    categoryLabel: 'World Records & Distance Running',
    volume: '$6.7M Vol.',
    chance: 64,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes if World Athletics ratifies any new half marathon world record set by a runner competing for Ethiopia.',
    outcomes: [
      { name: 'Yes', probability: 64, yesPrice: 64, noPrice: 36 },
      { name: 'No', probability: 36, yesPrice: 36, noPrice: 64 },
    ],
  },
  // 25. Culture: Ethiopian Airlines 16M Passengers
  {
    id: 'pm-eth-ethiopian-airlines-passengers',
    title: 'Ethiopian Airlines Group carries over 16 Million international passengers in 2026?',
    category: 'Culture',
    categoryLabel: 'Aviation & Global Tourism',
    volume: '$18.9M Vol.',
    chance: 88,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    description: 'Resolves based on Ethiopian Airlines audited annual commercial passenger traffic statistics.',
    outcomes: [
      { name: 'Yes', probability: 88, yesPrice: 88, noPrice: 12 },
      { name: 'No', probability: 12, yesPrice: 12, noPrice: 88 },
    ],
  },
  // 26. Culture: Lalibela Rock-Hewn Churches UNESCO
  {
    id: 'pm-eth-lalibela-unesco',
    title: 'Lalibela Rock-Hewn Churches restoration phase 1 receives final UNESCO sign-off in 2026?',
    category: 'Culture',
    categoryLabel: 'Heritage & UNESCO',
    volume: '$5.3M Vol.',
    chance: 75,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes if UNESCO World Heritage Committee formally ratifies the completion of phase 1 structural conservation shelters.',
    outcomes: [
      { name: 'Yes', probability: 75, yesPrice: 75, noPrice: 25 },
      { name: 'No', probability: 25, yesPrice: 25, noPrice: 75 },
    ],
  },
];

export const PolymarketEthiopiaView: React.FC<PolymarketEthiopiaViewProps> = ({
  onSelectOutcome,
  onOpenDetail,
  isDarkMode = true,
}) => {
  const [selectedSubcat, setSelectedSubcat] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'volume' | 'chance' | 'hot'>('hot');

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(bookmarkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBookmarkedIds(next);
  };

  const subcategories = [
    { id: 'All', label: 'All 🇪🇹', count: ETHIOPIAN_MARKETS_DATA.length },
    { id: 'Politics', label: 'Politics & Diplomacy', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Politics').length },
    { id: 'Sports', label: 'Sports & Athletics', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Sports').length },
    { id: 'Economy', label: 'Economy & Finance', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Economy').length },
    { id: 'Crypto', label: 'Crypto & Mining', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Crypto').length },
    { id: 'Tech', label: 'Energy & Infrastructure', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Tech').length },
    { id: 'Culture', label: 'Culture & Agriculture', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Culture').length },
    { id: 'Weather', label: 'Climate & Rain', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Weather').length },
  ];

  const filteredMarkets = ETHIOPIAN_MARKETS_DATA.filter((item) => {
    if (selectedSubcat !== 'All' && item.category !== selectedSubcat) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.outcomes.some((o) => o.name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'volume') {
      const vA = parseFloat(a.volume.replace(/[^0-9.]/g, '')) || 0;
      const vB = parseFloat(b.volume.replace(/[^0-9.]/g, '')) || 0;
      return vB - vA;
    }
    if (sortBy === 'chance') {
      return b.chance - a.chance;
    }
    // 'hot'
    return (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0);
  });

  const handleCardClick = (market: EthiopianMarketItem) => {
    if (onOpenDetail) {
      onOpenDetail({
        id: market.id,
        title: market.title,
        category: market.category,
        subcategory: 'Ethiopia',
        countryFlag: '🇪🇹',
        volume: market.volume,
        displayType: 'multi_outcome',
        rulesText: market.description,
        outcomes: market.outcomes.map((o) => ({
          name: o.name,
          probability: o.probability,
          yesPrice: o.yesPrice,
          noPrice: o.noPrice,
        })),
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Hero Spotlight: Ethiopia Prediction Markets Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d1726] via-[#101b2b] to-[#0a121e] border border-[#1d2b3f] p-6 sm:p-8 relative overflow-hidden shadow-xl">
        {/* Decorative Flag Accents in Background */}
        <div className="absolute top-0 right-0 w-96 h-full opacity-10 pointer-events-none flex">
          <div className="w-1/3 bg-emerald-500 h-full blur-2xl" />
          <div className="w-1/3 bg-yellow-400 h-full blur-2xl" />
          <div className="w-1/3 bg-red-500 h-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🇪🇹</span>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-xs font-bold font-mono tracking-wide">
              ETHIOPIA PREDICTION MARKETS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
              ● REAL-TIME ODDS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Trade on Ethiopia's Defining Moments
          </h1>
          <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
            Live oracle prediction markets spanning Ethiopian politics, the national elections, Premier League football, GERD megaproject milestones, Birr foreign exchange, and green Bitcoin energy.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>
                Total Volume:{' '}
                <strong className="text-white font-mono">$480M+</strong>
              </span>
            </div>
            <div className="h-3.5 w-px bg-neutral-700" />
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>
                Active Markets:{' '}
                <strong className="text-white font-mono">{ETHIOPIAN_MARKETS_DATA.length} Events</strong>
              </span>
            </div>
            <div className="h-3.5 w-px bg-neutral-700" />
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Globe2 className="w-4 h-4 text-blue-400" />
              <span>Settlement: Smart Contract & UMA Oracle</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Subcategory Filter Chips Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 shrink-0">
          {subcategories.map((sub) => {
            const isActive = selectedSubcat === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcat(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-[#121722] hover:bg-[#1b2333] text-neutral-300 border border-[#20293a]'
                }`}
              >
                <span>{sub.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-[#1a2130] text-neutral-400'
                  }`}
                >
                  {sub.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="text-xs text-neutral-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#121722] border border-[#20293a] text-xs text-neutral-200 rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer"
          >
            <option value="hot">🔥 Trending & Hot</option>
            <option value="volume">💰 Volume (High to Low)</option>
            <option value="chance">🎯 Highest Probability</option>
          </select>
        </div>
      </div>

      {/* 3. Search Bar within Ethiopia Category */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search Ethiopian elections, Premier League clubs, GERD, Birr exchange, marathon..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#101520] border border-[#1d2738] text-white placeholder:text-neutral-500 text-sm focus:border-blue-500 outline-hidden transition-colors"
        />
        {searchFilter && (
          <button
            onClick={() => setSearchFilter('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded-md bg-[#1a2130]"
          >
            Clear
          </button>
        )}
      </div>

      {/* 4. Grid of Ethiopian Prediction Market Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMarkets.map((market) => {
          const isBookmarked = bookmarkedIds.has(market.id);
          const topOutcome = market.outcomes[0];
          const secondOutcome = market.outcomes[1];

          return (
            <div
              key={market.id}
              onClick={() => handleCardClick(market)}
              className="rounded-xl bg-[#0f141f] border border-[#1e2738] hover:border-[#2f3d56] p-4.5 transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Flag + Category + Bookmark */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇪🇹</span>
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      {market.categoryLabel}
                    </span>
                    {market.isHot && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        HOT
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => toggleBookmark(market.id, e)}
                    className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
                    title="Bookmark market"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isBookmarked ? 'fill-blue-500 text-blue-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Market Title */}
                <h3 className="font-bold text-[14.5px] text-white group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-3">
                  {market.title}
                </h3>

                {/* Outcomes Breakdown */}
                {market.outcomes.length <= 2 ? (
                  // Binary Yes / No Layout
                  <div className="grid grid-cols-2 gap-2 my-2">
                    {market.outcomes.map((outcome) => (
                      <div
                        key={outcome.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOutcome({
                            market: {
                              id: market.id,
                              title: market.title,
                              category: market.category,
                              subcategory: 'Ethiopia',
                              countryFlag: '🇪🇹',
                              volume: market.volume,
                              outcomes: market.outcomes,
                            },
                            outcomeName: outcome.name,
                            selectedSide: outcome.name.toLowerCase() === 'no' ? 'no' : 'yes',
                            price: outcome.yesPrice / 100,
                          });
                        }}
                        className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          outcome.name === 'Yes'
                            ? 'bg-emerald-950/20 hover:bg-emerald-900/30 border-emerald-800/40 text-emerald-400'
                            : 'bg-red-950/20 hover:bg-red-900/30 border-red-800/40 text-red-400'
                        }`}
                      >
                        <span className="text-[11px] font-semibold uppercase">{outcome.name}</span>
                        <span className="text-base font-extrabold font-mono mt-0.5">
                          {outcome.probability}%
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          Buy ${(outcome.yesPrice / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Multi-Outcome list (e.g. Next PM, Premier League)
                  <div className="space-y-1.5 my-2">
                    {market.outcomes.slice(0, 3).map((outcome) => (
                      <div
                        key={outcome.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOutcome({
                            market: {
                              id: market.id,
                              title: market.title,
                              category: market.category,
                              subcategory: 'Ethiopia',
                              countryFlag: '🇪🇹',
                              volume: market.volume,
                              outcomes: market.outcomes,
                            },
                            outcomeName: outcome.name,
                            selectedSide: 'yes',
                            price: outcome.yesPrice / 100,
                          });
                        }}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#141a27] hover:bg-[#1a2233] border border-[#212b3d] text-xs transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-neutral-200 truncate pr-2">
                          {outcome.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-emerald-400">
                            {outcome.probability}%
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors">
                            Bet
                          </span>
                        </div>
                      </div>
                    ))}
                    {market.outcomes.length > 3 && (
                      <div className="text-[11px] text-neutral-500 text-center pt-0.5">
                        +{market.outcomes.length - 3} more candidates / teams
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Volume + End Date */}
              <div className="pt-3 border-t border-[#1a2233] flex items-center justify-between text-xs text-neutral-400 mt-2">
                <span className="font-mono font-medium">{market.volume}</span>
                <span className="text-[11px] text-neutral-500">Closes {market.endsDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMarkets.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-[#0e131d] border border-[#1b2332] p-8">
          <p className="text-neutral-300 font-semibold text-base mb-1">
            No markets match your filter
          </p>
          <p className="text-neutral-500 text-xs mb-4">
            Try searching for "Abiy", "GERD", "Premier League", or choose "All 🇪🇹".
          </p>
          <button
            onClick={() => {
              setSelectedSubcat('All');
              setSearchFilter('');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
