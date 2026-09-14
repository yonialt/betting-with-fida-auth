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
  title: string;    category: 'Politics' | 'Economy' | 'Tech' | 'Culture' | 'Weather' | 'Crypto' | 'Education';
  categoryLabel: string;
  volume: string;
  chance: number;
  endsDate: string;
  isHot?: boolean;
  featured?: boolean;
  /** Emoji glyph shown in the card emblem (falls back to a per-category default). */
  icon?: string;
  /** Accent hex color for the emblem tile, sparkline and chance figure. */
  accent?: string;
  /** Optional official photo/logo URL; when set it replaces the emoji emblem. */
  imageUrl?: string;
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
    volume: '285.8M ETB Vol.',
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
    volume: '67.3M ETB Vol.',
    chance: 89,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    featured: true,
    imageUrl: '/pm-eth-gerd-capacity.jpg',
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
    volume: '42.1M ETB Vol.',
    chance: 74,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    imageUrl: '/pm-eth-redsea .jpg',
    description: 'Resolves to Yes if a ratified sovereign port access or naval leasing treaty is executed by the Ethiopian federal government.',
    outcomes: [
      { name: 'Yes', probability: 74, yesPrice: 74, noPrice: 26 },
      { name: 'No', probability: 26, yesPrice: 26, noPrice: 74 },
    ],
  },

  // 5. Economy: NBE Official Birr Rate
  {
    id: 'pm-eth-birr-fx',
    title: 'National Bank of Ethiopia Official Birr (USD/ETB) exceeds 150 before end of 2026?',
    category: 'Economy',
    categoryLabel: 'Macroeconomics & Forex',
    volume: '24.6M ETB Vol.',
    chance: 64,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    imageUrl: '/pm-eth-birr-fx .jpg',
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
    volume: '19.8M ETB Vol.',
    chance: 78,
    endsDate: 'Nov 30, 2026',
    isHot: true,
    imageUrl: '/pm-eth-bitcoin-minings.png',
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
    volume: '15.2M ETB Vol.',
    chance: 82,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes if Ethio Telecom announces audited Telebirr subscriber numbers exceeding 55,000,000 active accounts.',
    outcomes: [
      { name: 'Yes', probability: 82, yesPrice: 82, noPrice: 18 },
      { name: 'No', probability: 18, yesPrice: 18, noPrice: 82 },
    ],
  },

  // 9. Tech: Fayda Digital ID 50M
  {
    id: 'pm-eth-fayda-50m',
    title: 'Fayda National Digital ID reaches 50 Million registered Ethiopian citizens?',
    category: 'Tech',
    categoryLabel: 'Digital Governance & Identity',
    volume: '11.4M ETB Vol.',
    chance: 76,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes if the National ID Program of Ethiopia (NIDP) confirms 50 Million unique registered Fayda biometric IDs.',
    outcomes: [
      { name: 'Yes', probability: 76, yesPrice: 76, noPrice: 24 },
      { name: 'No', probability: 24, yesPrice: 24, noPrice: 76 },
    ],
  },
  // 10. Culture: Coffee Export Revenue 1.8B ETB
  {
    id: 'pm-eth-coffee-export',
    title: 'Ethiopian coffee export revenue exceeds 1.8 ETB Billion in fiscal year 2025/26?',
    category: 'Culture',
    categoryLabel: 'Agriculture & Exports',
    volume: '14.1M ETB Vol.',
    chance: 72,
    endsDate: 'Jul 30, 2026',
    imageUrl: '/pm-eth-coffee-export .jpg',
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
    volume: '9.7M ETB Vol.',
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
    volume: '6.2M ETB Vol.',
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
    volume: '3.4M ETB Vol.',
    chance: 48,
    endsDate: 'Feb 28, 2027',
    imageUrl: '/pm-eth-weather-addis-temp.jpg',
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
    volume: '4.8M ETB Vol.',
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
    volume: '3.5M ETB Vol.',
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
    volume: '7.2M ETB Vol.',
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
    volume: '4.1M ETB Vol.',
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
    volume: '21.5M ETB Vol.',
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
    volume: '18.3M ETB Vol.',
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
    volume: '16.8M ETB Vol.',
    chance: 79,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    imageUrl: '/pm-eth-esx-ipos .png',
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
    volume: '22.4M ETB Vol.',
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
    volume: '17.1M ETB Vol.',
    chance: 52,
    endsDate: 'Dec 15, 2026',
    description: 'Resolves based on monthly Consumer Price Index (CPI) published by the Ethiopian Statistics Service (ESS).',
    outcomes: [
      { name: 'Yes', probability: 52, yesPrice: 52, noPrice: 48 },
      { name: 'No', probability: 48, yesPrice: 48, noPrice: 52 },
    ],
  },

  // 25. Culture: Ethiopian Airlines 16M Passengers
  {
    id: 'pm-eth-ethiopian-airlines-passengers',
    title: 'Ethiopian Airlines Group carries over 16 Million international passengers in 2026?',
    category: 'Culture',
    categoryLabel: 'Aviation & Global Tourism',
    volume: '18.9M ETB Vol.',
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
    volume: '5.3M ETB Vol.',
    chance: 75,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes if UNESCO World Heritage Committee formally ratifies the completion of phase 1 structural conservation shelters.',
    outcomes: [
      { name: 'Yes', probability: 75, yesPrice: 75, noPrice: 25 },
      { name: 'No', probability: 25, yesPrice: 25, noPrice: 75 },
    ],
  },

  // ===================== Weather · by city (added) =====================
  {
    id: 'pm-eth-weather-addis-enkutatash',
    title: 'Rain falls in Addis Ababa on Enkutatash (Ethiopian New Year) 2026?',
    category: 'Weather',
    categoryLabel: 'Addis Ababa · Rainfall',
    volume: '2.9M ETB Vol.',
    chance: 63,
    endsDate: 'Sep 12, 2026',
    isHot: true,
    icon: '☔',
    accent: '#0ea5e9',
    description: 'Resolves to Yes if Bole International Airport METAR logs measurable precipitation (>=0.2mm) on 1 Meskerem (Sep 11/12), 2026.',
    outcomes: [
      { name: 'Yes', probability: 63, yesPrice: 63, noPrice: 37 },
      { name: 'No', probability: 37, yesPrice: 37, noPrice: 63 },
    ],
  },
  {
    id: 'pm-eth-weather-diredawa-heat',
    title: 'Dire Dawa daily high tops 35C during the 2026 Bega dry season?',
    category: 'Weather',
    categoryLabel: 'Dire Dawa · Temperature',
    volume: '1.8M ETB Vol.',
    chance: 71,
    endsDate: 'Feb 28, 2027',
    icon: '🌡️',
    accent: '#f97316',
    description: 'Resolves to Yes if the Ethiopian Meteorology Institute Dire Dawa station records an official daily maximum at or above 35.0C.',
    outcomes: [
      { name: 'Yes', probability: 71, yesPrice: 71, noPrice: 29 },
      { name: 'No', probability: 29, yesPrice: 29, noPrice: 71 },
    ],
  },
  {
    id: 'pm-eth-weather-bahirdar-storms',
    title: 'Bahir Dar records above-average thunderstorm days in Kiremt 2026?',
    category: 'Weather',
    categoryLabel: 'Bahir Dar · Thunderstorms',
    volume: '1.5M ETB Vol.',
    chance: 55,
    endsDate: 'Sep 30, 2026',
    icon: '⛈️',
    accent: '#6366f1',
    description: 'Resolves based on EMI Bahir Dar station thunderstorm-day count for Jun-Sep 2026 versus the 30-year normal.',
    outcomes: [
      { name: 'Yes', probability: 55, yesPrice: 55, noPrice: 45 },
      { name: 'No', probability: 45, yesPrice: 45, noPrice: 55 },
    ],
  },
  {
    id: 'pm-eth-weather-hawassa-lake',
    title: 'Lake Hawassa stays below its flood-watch level through 2026?',
    category: 'Weather',
    categoryLabel: 'Hawassa · Lake Level',
    volume: '2.1M ETB Vol.',
    chance: 67,
    endsDate: 'Dec 31, 2026',
    icon: '🌊',
    accent: '#06b6d4',
    description: 'Resolves to Yes if Ministry of Water and Energy gauges at Hawassa remain under the declared flood-watch elevation all year.',
    outcomes: [
      { name: 'Yes', probability: 67, yesPrice: 67, noPrice: 33 },
      { name: 'No', probability: 33, yesPrice: 33, noPrice: 67 },
    ],
  },
  {
    id: 'pm-eth-weather-mekelle-belg',
    title: 'Mekelle receives above-average Belg (spring) rainfall in 2026?',
    category: 'Weather',
    categoryLabel: 'Mekelle · Belg Rains',
    volume: '1.6M ETB Vol.',
    chance: 49,
    endsDate: 'May 31, 2026',
    icon: '🌦️',
    accent: '#0ea5e9',
    description: 'Resolves based on the EMI Belg-season review for Tigray comparing Feb-May 2026 totals to the long-term mean.',
    outcomes: [
      { name: 'Yes', probability: 49, yesPrice: 49, noPrice: 51 },
      { name: 'No', probability: 51, yesPrice: 51, noPrice: 49 },
    ],
  },
  {
    id: 'pm-eth-weather-gondar-mild',
    title: 'Gondar daytime highs stay under 30C through Kiremt 2026?',
    category: 'Weather',
    categoryLabel: 'Gondar · Temperature',
    volume: '1.2M ETB Vol.',
    chance: 74,
    endsDate: 'Sep 30, 2026',
    icon: '🌤️',
    accent: '#14b8a6',
    description: 'Resolves to Yes if no EMI Gondar daily maximum reaches 30.0C during Jun-Sep 2026.',
    outcomes: [
      { name: 'Yes', probability: 74, yesPrice: 74, noPrice: 26 },
      { name: 'No', probability: 26, yesPrice: 26, noPrice: 74 },
    ],
  },
  {
    id: 'pm-eth-weather-jimma-wettest',
    title: 'Jimma remains Ethiopia’s wettest major city by 2026 annual rainfall?',
    category: 'Weather',
    categoryLabel: 'Jimma · Annual Rainfall',
    volume: '1.9M ETB Vol.',
    chance: 80,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    icon: '🌧️',
    accent: '#3b82f6',
    description: 'Resolves based on EMI 2026 annual precipitation totals ranking Jimma highest among Ethiopia’s major regional cities.',
    outcomes: [
      { name: 'Yes', probability: 80, yesPrice: 80, noPrice: 20 },
      { name: 'No', probability: 20, yesPrice: 20, noPrice: 80 },
    ],
  },
  {
    id: 'pm-eth-weather-semera-hottest',
    title: 'Semera (Afar) records Ethiopia’s hottest day of 2026 above 45C?',
    category: 'Weather',
    categoryLabel: 'Semera · Extreme Heat',
    volume: '2.4M ETB Vol.',
    chance: 59,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    icon: '🔥',
    accent: '#ef4444',
    description: 'Resolves to Yes if the EMI Semera/Afar station logs a national single-day maximum at or above 45.0C in 2026.',
    outcomes: [
      { name: 'Yes', probability: 59, yesPrice: 59, noPrice: 41 },
      { name: 'No', probability: 41, yesPrice: 41, noPrice: 59 },
    ],
  },

  // ===================== Politics · added =====================
  {
    id: 'pm-eth-addis-mayor-vote',
    title: 'Addis Ababa City Administration holds a mayoral vote in 2026?',
    category: 'Politics',
    categoryLabel: 'Addis Ababa · City Governance',
    volume: '9.3M ETB Vol.',
    chance: 57,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    icon: '🏛️',
    accent: '#4f46e5',
    description: 'Resolves to Yes if the Addis Ababa City Council formally holds a vote electing or confirming a City Mayor during 2026.',
    outcomes: [
      { name: 'Yes', probability: 57, yesPrice: 57, noPrice: 43 },
      { name: 'No', probability: 43, yesPrice: 43, noPrice: 57 },
    ],
  },
  {
    id: 'pm-eth-au-summit-2026',
    title: 'Ethiopia hosts an African Union extraordinary summit in 2026?',
    category: 'Politics',
    categoryLabel: 'Diplomacy · African Union',
    volume: '7.8M ETB Vol.',
    chance: 82,
    endsDate: 'Dec 31, 2026',
    icon: '🌍',
    accent: '#10b981',
    description: 'Resolves to Yes if the African Union convenes an ordinary or extraordinary Assembly session in Addis Ababa during 2026.',
    outcomes: [
      { name: 'Yes', probability: 82, yesPrice: 82, noPrice: 18 },
      { name: 'No', probability: 18, yesPrice: 18, noPrice: 82 },
    ],
  },
  {
    id: 'pm-eth-national-dialogue-report',
    title: 'Ethiopia’s National Dialogue Commission delivers its final report in 2026?',
    category: 'Politics',
    categoryLabel: 'National Dialogue',
    volume: '11.6M ETB Vol.',
    chance: 60,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    icon: '📜',
    accent: '#6366f1',
    description: 'Resolves to Yes if the Ethiopian National Dialogue Commission officially publishes its concluding national report during 2026.',
    outcomes: [
      { name: 'Yes', probability: 60, yesPrice: 60, noPrice: 40 },
      { name: 'No', probability: 40, yesPrice: 40, noPrice: 60 },
    ],
  },
  {
    id: 'pm-eth-eritrea-border',
    title: 'Ethiopia and Eritrea reopen an official land border crossing in 2026?',
    category: 'Politics',
    categoryLabel: 'Regional Diplomacy',
    volume: '13.2M ETB Vol.',
    chance: 45,
    endsDate: 'Dec 31, 2026',
    isHot: true,
    icon: '🤝',
    accent: '#14b8a6',
    description: 'Resolves to Yes if both governments formally reopen at least one designated land border crossing for civilian transit in 2026.',
    outcomes: [
      { name: 'Yes', probability: 45, yesPrice: 45, noPrice: 55 },
      { name: 'No', probability: 55, yesPrice: 55, noPrice: 45 },
    ],
  },
  {
    id: 'pm-eth-constitution-referendum',
    title: 'A constitutional amendment referendum is announced before 2027?',
    category: 'Politics',
    categoryLabel: 'Constitution & Reform',
    volume: '8.7M ETB Vol.',
    chance: 34,
    endsDate: 'Dec 31, 2026',
    icon: '🗳️',
    accent: '#f59e0b',
    description: 'Resolves to Yes if the federal government or Parliament officially schedules a public referendum on constitutional amendments before 2027.',
    outcomes: [
      { name: 'Yes', probability: 34, yesPrice: 34, noPrice: 66 },
      { name: 'No', probability: 66, yesPrice: 66, noPrice: 34 },
    ],
  },
  {
    id: 'pm-eth-ruling-majority-2026',
    title: 'The governing party retains a parliamentary majority in the 2026 election?',
    category: 'Politics',
    categoryLabel: 'Elections · House of Peoples’ Reps',
    volume: '28.4M ETB Vol.',
    chance: 86,
    endsDate: 'Jun 30, 2026',
    isHot: true,
    icon: '🏛️',
    accent: '#4f46e5',
    description: 'Resolves to Yes if the incumbent governing party secures more than half of the seats in the House of Peoples’ Representatives per NEBE certified results.',
    outcomes: [
      { name: 'Yes', probability: 86, yesPrice: 86, noPrice: 14 },
      { name: 'No', probability: 14, yesPrice: 14, noPrice: 86 },
    ],
  },

  // ===================== Requested markets · 2029 horizon =====================
  {
    id: 'pm-eth-q-addis-legal-status',
    title: "Will Addis Ababa's legal administrative status officially change before January 1, 2029?",
    imageUrl: '/pm-eth-q-addis-legal-status .jpg',
    category: 'Politics',
    categoryLabel: 'Addis Ababa · Legal Status',
    volume: '14.7M ETB Vol.',
    chance: 38,
    endsDate: 'Jan 1, 2029',
    icon: '🏙️',
    accent: '#4f46e5',
    description: 'Resolves to Yes if a federal proclamation, constitutional amendment, or court ruling officially alters the legal administrative status of Addis Ababa before January 1, 2029.',
    outcomes: [
      { name: 'Yes', probability: 38, yesPrice: 38, noPrice: 62 },
      { name: 'No', probability: 62, yesPrice: 62, noPrice: 38 },
    ],
  },
  {
    id: 'pm-eth-q-hawassa-federal-city',
    title: 'Will Hawassa officially become a federally administered city before January 1, 2029?',
    category: 'Politics',
    categoryLabel: 'Hawassa · Federal Status',
    volume: '8.4M ETB Vol.',
    chance: 22,
    endsDate: 'Jan 1, 2029',
    icon: '🏙️',
    accent: '#6366f1',
    description: 'Resolves to Yes if federal legislation formally designates Hawassa as a federally administered (chartered) city before January 1, 2029.',
    outcomes: [
      { name: 'Yes', probability: 22, yesPrice: 22, noPrice: 78 },
      { name: 'No', probability: 78, yesPrice: 78, noPrice: 22 },
    ],
  },
  {
    id: 'pm-eth-q-military-service',
    title: 'Will Ethiopia enact mandatory national military service before January 1, 2029?',
    category: 'Politics',
    categoryLabel: 'Defense · National Service',
    volume: '16.1M ETB Vol.',
    chance: 29,
    endsDate: 'Jan 1, 2029',
    icon: '🎖️',
    accent: '#ef4444',
    description: 'Resolves to Yes if the federal government enacts a law introducing compulsory national military service before January 1, 2029.',
    outcomes: [
      { name: 'Yes', probability: 29, yesPrice: 29, noPrice: 71 },
      { name: 'No', probability: 71, yesPrice: 71, noPrice: 29 },
    ],
  },
  {
    id: 'pm-eth-q-constitution-2029',
    title: 'Will Ethiopia officially amend or replace its constitution before January 1, 2029?',
    category: 'Politics',
    categoryLabel: 'Constitution & Reform',
    volume: '21.9M ETB Vol.',
    chance: 41,
    endsDate: 'Jan 1, 2029',
    isHot: true,
    imageUrl: '/offical logos/id  pm-eth-q-constitution-2029 .png',
    icon: '📜',
    accent: '#f59e0b',
    description: 'Resolves to Yes if a constitutional amendment is ratified, or a new constitution is adopted, through the official process before January 1, 2029.',
    outcomes: [
      { name: 'Yes', probability: 41, yesPrice: 41, noPrice: 59 },
      { name: 'No', probability: 59, yesPrice: 59, noPrice: 41 },
    ],
  },
  {
    id: 'pm-eth-q-east-flood-ec2018',
    title: 'Will major flooding hit Eastern Ethiopia (Dire Dawa or the Somali region) before the end of EC 2018?',
    category: 'Weather',
    categoryLabel: 'Eastern Ethiopia · Flooding',
    volume: '6.6M ETB Vol.',
    chance: 47,
    endsDate: 'Sep 10, 2026',
    isHot: true,
    icon: '🌊',
    accent: '#06b6d4',
    description: 'Resolves to Yes if the National Disaster Risk Management Commission declares a major flood emergency in Dire Dawa or the Somali region before the end of Ethiopian calendar year 2018 (about Sep 10, 2026).',
    outcomes: [
      { name: 'Yes', probability: 47, yesPrice: 47, noPrice: 53 },
      { name: 'No', probability: 53, yesPrice: 53, noPrice: 47 },
    ],
  },
  {
    id: 'pm-eth-q-entrance-exam-60',
    title: 'Will more than 60% of students pass the Ethiopian University Entrance Examination in 2029?',
    category: 'Education',
    categoryLabel: 'Education · Entrance Exam',
    volume: '12.8M ETB Vol.',
    chance: 33,
    endsDate: 'Dec 31, 2029',
    isHot: true,
    icon: '🎓',
    accent: '#a855f7',
    description: 'Resolves to Yes if the Ministry of Education / Education Assessment and Examinations Service reports a national pass rate above 60% for the 2029 University Entrance Examination.',
    outcomes: [
      { name: 'Yes', probability: 33, yesPrice: 33, noPrice: 67 },
      { name: 'No', probability: 67, yesPrice: 67, noPrice: 33 },
    ],
  },
  {
    id: 'pm-eth-q-gondar-univ-autonomy',
    title: 'Will the University of Gondar become a self-administered (autonomous) university before January 1, 2029?',
    category: 'Education',
    categoryLabel: 'University of Gondar · Autonomy',
    volume: '5.9M ETB Vol.',
    chance: 54,
    endsDate: 'Jan 1, 2029',
    icon: '🎓',
    accent: '#8b5cf6',
    description: 'Resolves to Yes if the University of Gondar is officially granted autonomous / self-administered status by the federal government before January 1, 2029.',
    outcomes: [
      { name: 'Yes', probability: 54, yesPrice: 54, noPrice: 46 },
      { name: 'No', probability: 46, yesPrice: 46, noPrice: 54 },
    ],
  },
  {
    id: 'pm-eth-q-hawassa-univ-autonomy',
    title: 'Will Hawassa University become a self-administered (autonomous) university before January 1, 2029?',
    category: 'Education',
    categoryLabel: 'Hawassa University · Autonomy',
    volume: '5.4M ETB Vol.',
    chance: 58,
    endsDate: 'Jan 1, 2029',
    icon: '🎓',
    accent: '#8b5cf6',
    description: 'Resolves to Yes if Hawassa University is officially granted autonomous / self-administered status by the federal government before January 1, 2029.',
    outcomes: [
      { name: 'Yes', probability: 58, yesPrice: 58, noPrice: 42 },
      { name: 'No', probability: 42, yesPrice: 42, noPrice: 58 },
    ],
  },
];

// Per-category emblem fallback (emoji + accent) when a market doesn't set its own.
const CATEGORY_EMBLEM: Record<string, { icon: string; accent: string }> = {
  Politics: { icon: '🏛️', accent: '#4f46e5' },
  Weather: { icon: '☁️', accent: '#0ea5e9' },
  Economy: { icon: '💹', accent: '#10b981' },
  Tech: { icon: '⚡', accent: '#8b5cf6' },
  Culture: { icon: '🌿', accent: '#14b8a6' },
  Crypto: { icon: '₿', accent: '#f7931a' },
  Education: { icon: '🎓', accent: '#8b5cf6' },
};

function emblemFor(item: EthiopianMarketItem): { icon: string; accent: string } {
  const fallback = CATEGORY_EMBLEM[item.category] || { icon: '🇪🇹', accent: '#3b82f6' };
  return { icon: item.icon || fallback.icon, accent: item.accent || fallback.accent };
}

// Deterministic seeded probability walk that ends on `end`, so every card shows a stable trend.
function sparkSeries(seed: string, end: number, points = 20): number[] {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const target = Math.max(2, Math.min(98, end));
  let v = Math.max(2, Math.min(98, target + (rand() * 2 - 1) * 20));
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    v = Math.max(2, Math.min(98, v + (target - v) * 0.08 + (rand() * 2 - 1) * 5));
    out.push(v);
  }
  out[points - 1] = target;
  return out;
}

// Tiny inline sparkline chart for the market cards.
const Sparkline: React.FC<{ data: number[]; color: string; width?: number; height?: number }> = ({
  data,
  color,
  width = 150,
  height = 36,
}) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((d, i): [number, number] => [
    i * stepX,
    height - ((d - min) / range) * (height - 5) - 2.5,
  ]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const gid = `eth-spark-${color.replace('#', '')}`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-9 overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={color} />
    </svg>
  );
};

export const PolymarketEthiopiaView: React.FC<PolymarketEthiopiaViewProps> = ({
  onSelectOutcome,
  onOpenDetail,
  isDarkMode = true,
}) => {
  const [selectedSubcat, setSelectedSubcat] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
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
    { id: 'Economy', label: 'Economy & Finance', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Economy').length },
    { id: 'Crypto', label: 'Crypto & Mining', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Crypto').length },
    { id: 'Tech', label: 'Energy & Infrastructure', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Tech').length },
    { id: 'Culture', label: 'Culture & Agriculture', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Culture').length },
    { id: 'Weather', label: 'Climate & Rain', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Weather').length },
    { id: 'Education', label: 'Education & Universities', count: ETHIOPIAN_MARKETS_DATA.filter((m) => m.category === 'Education').length },
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
  });

  const handleCardClick = (market: EthiopianMarketItem) => {
    if (onOpenDetail) {
      onOpenDetail({
        id: market.id,
        title: market.title,
        category: market.category,
        subcategory: 'Ethiopia',
        countryFlag: '🇪🇹',
        imageUrl: market.imageUrl,
        volume: market.volume,
        displayType: market.outcomes.length > 2 ? 'multi_outcome' : 'binary_buttons',
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

      </div>

      {/* 3. Search Bar within Ethiopia Category */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search Ethiopian elections, GERD, Birr exchange..."
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
          const emblem = emblemFor(market);

          return (
            <div
              key={market.id}
              onClick={() => handleCardClick(market)}
              className="rounded-xl bg-[#0f141f] border border-[#1e2738] hover:border-[#2f3d56] p-4.5 transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Flag + Category + Bookmark */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {market.imageUrl ? (
                      <img
                        src={market.imageUrl}
                        alt=""
                        className="w-7 h-7 rounded-lg object-cover shrink-0 border border-white/10"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[15px] shrink-0 shadow-inner ring-1 ring-white/10"
                        style={{ background: `linear-gradient(135deg, ${emblem.accent}, ${emblem.accent}22)` }}
                        aria-hidden="true"
                      >
                        {emblem.icon}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
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
                <h3 className="font-bold text-[14.5px] text-white group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-2">
                  {market.title}
                </h3>

                {/* Live probability sparkline chart */}
                <div className="flex items-end justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <Sparkline data={sparkSeries(market.id, market.chance)} color={emblem.accent} />
                  </div>
                  <div className="text-right shrink-0 leading-none">
                    <div className="font-mono font-extrabold text-[15px]" style={{ color: emblem.accent }}>
                      {market.chance}%
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-neutral-500 mt-0.5">chance</div>
                  </div>
                </div>

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
                          Buy {(outcome.yesPrice / 100).toFixed(2)} ETB
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
