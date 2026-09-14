export type Language = 'en' | 'am';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    am: string;
  };
}

export const POLYMARKET_UI_TRANSLATIONS: Record<string, { en: string; am: string }> = {
  // Header
  search_placeholder: {
    en: 'Search polymarkets, events, or profiles...',
    am: 'የትንበያ ገበያዎችን፣ ኩነቶችን ወይም መገለጫዎችን ይፈልጉ...',
  },
  how_it_works: {
    en: 'How it works',
    am: 'እንዴት እንደሚሰራ',
  },
  login: {
    en: 'Log in',
    am: 'ይግቡ',
  },
  signup: {
    en: 'Sign up',
    am: 'ይመዝገቡ',
  },
  logout: {
    en: 'Log out',
    am: 'ውጣ',
  },
  sportsbook_mode: {
    en: 'Sportsbook Mode',
    am: 'የስፖርት ውርርድ',
  },
  markets_tab: {
    en: 'Markets',
    am: 'ገበያዎች',
  },
  profiles_tab: {
    en: 'Profiles',
    am: 'መገለጫዎች',
  },
  see_all_results: {
    en: 'See all results for',
    am: 'ሁሉንም ውጤቶች ይመልከቱ ለ',
  },
  no_matching_markets: {
    en: 'No matching polymarkets found',
    am: 'ተመሳሳይ የትንበያ ገበያ አልተገኘም',
  },

  // Navigation / Categories
  trending: { en: 'Trending', am: 'ወቅታዊ' },
  ethiopia: { en: 'Ethiopia', am: 'ኢትዮጵያ' },
  politics: { en: 'Politics', am: 'ፖለቲካ' },
  crypto: { en: 'Crypto', am: 'ክሪፕቶ' },
  weather: { en: 'Weather', am: 'የአየር ሁኔታ' },
  elections: { en: 'Elections', am: 'ምርጫዎች' },
  mentions: { en: 'Mentions', am: 'መጥቀሶች' },
  combos: { en: 'Combos', am: 'ጥምር' },
  perps: { en: 'Perps', am: 'ዘላቂ ንግድ' },
  breaking: { en: 'Breaking', am: 'ሰበር ዜና' },
  new: { en: 'New', am: 'አዲስ' },
  sports: { en: 'Sports', am: 'ስፖርት' },
  pop_culture: { en: 'Culture', am: 'ባህልና መዝናኛ' },
  art: { en: 'Art', am: 'ጥበብ' },
  business: { en: 'Business', am: 'ቢዝነስና ኢኮኖሚ' },
  science: { en: 'Science', am: 'ሳይንስ' },
  fomc: { en: 'FOMC Rates', am: 'የወለድ ምጣኔ' },

  // Hero Card
  featured_prediction: {
    en: 'Featured Prediction Market',
    am: 'ዋና ተለይቶ የቀረበ የትንበያ ገበያ',
  },
  currency: {
    en: 'Birr',
    am: 'ብር',
  },
  currency_code: {
    en: 'ETB',
    am: 'ብር',
  },
  chance: {
    en: 'Chance',
    am: 'ዕድል',
  },
  volume: {
    en: 'Volume',
    am: 'የገንዘብ ዝውውር',
  },
  vol_short: {
    en: 'Vol.',
    am: 'ዝውውር',
  },
  rules: {
    en: 'Rules & Criteria',
    am: 'መመሪያዎችና መስፈርቶች',
  },
  live_trader_chat: {
    en: 'Live Trader Chat',
    am: 'የቀጥታ ነጋዴዎች ውይይት',
  },
  bet_now: {
    en: 'Trade Shares',
    am: 'አክሲዮን ይገበያዩ',
  },
  resolution_date: {
    en: 'Resolution Date',
    am: 'የውሳኔ ቀን',
  },

  // Outcomes
  yes: { en: 'Yes', am: 'አዎ' },
  no: { en: 'No', am: 'አይ' },
  buy: { en: 'Buy', am: 'ግዛ' },
  sell: { en: 'Sell', am: 'ሽጥ' },
  outcome: { en: 'Outcome', am: 'ውጤት' },
  shares: { en: 'Shares', am: 'አክሲዮን' },
  price: { en: 'Price', am: 'ዋጋ' },
  amount: { en: 'Amount', am: 'መጠን' },
  potential_return: { en: 'Potential Return', am: 'ሊገኝ የሚችል ትርፍ' },
  confirm_trade: { en: 'Confirm Trade', am: 'ግብይቱን ያረጋግጡ' },
  order_book: { en: 'Order Book', am: 'የትዕዛዝ መዝገብ' },
  recent_activity: { en: 'Recent Activity', am: 'የቅርብ ጊዜ እንቅስቃሴ' },
  market_chat: { en: 'Market Chat', am: 'የገበያ ውይይት' },
  top_traders: { en: 'Top Traders', am: 'ከፍተኛ ነጋዴዎች' },
  quick_trade: { en: 'Quick Trade', am: 'ፈጣን ግብይት' },

  // Grid & Filters
  all_prediction_markets: {
    en: 'All Prediction Markets',
    am: 'ሁሉም የትንበያ ገበያዎች',
  },
  real_time_settlement: {
    en: 'Real-time Settlement',
    am: 'የቅጽበት ክፍያ በቴሌብር እና በዋሌት',
  },
  all: { en: 'All', am: 'ሁሉም' },
  filter: { en: 'Filter', am: 'አጣራ' },
  sort_by: { en: 'Sort by', am: 'ደርድር' },
  highest_volume: { en: 'Highest Volume', am: 'ከፍተኛ ዝውውር' },
  newest: { en: 'Newest', am: 'አዳዲስ' },
  ending_soon: { en: 'Ending Soon', am: 'በቅርቡ የሚያበቁ' },
  competitive: { en: 'Competitive', am: 'ተቀራራቢ ዕድል' },
  open: { en: 'Open', am: 'ክፍት' },
  resolved: { en: 'Resolved', am: 'የተጠናቀቁ' },
  bookmarked: { en: 'Bookmarked', am: 'የተመረጡ' },

  // Trade Modal
  trade_modal_title: {
    en: 'Trade Prediction Shares',
    am: 'የትንበያ አክሲዮኖችን ይገበያዩ',
  },
  shares_you_receive: {
    en: 'Estimated shares you receive',
    am: 'የሚደርስዎት የተገመተ አክሲዮን',
  },
  instant_payout: {
    en: 'Settles instantly when official event concludes',
    am: 'ክስተቱ በይፋ ሲጠናቀቅ ወዲያውኑ ሂሳብዎ ይገባል',
  },

  // Detail View
  back_to_markets: {
    en: 'Back to Markets',
    am: 'ወደ ገበያዎች ተመለስ',
  },
  market_rules_desc: {
    en: 'Market Rules & Resolution Criteria',
    am: 'የገበያው መመሪያዎች እና የአፈታት መስፈርቶች',
  },
  liquidity: {
    en: 'Liquidity',
    am: 'ተንቀሳቃሽ ካፒታል',
  },
  ends: {
    en: 'Ends',
    am: 'የሚያበቃበት',
  },
  created: {
    en: 'Created',
    am: 'የተጀመረበት',
  },
};

// Known market title translations from English to Amharic
export const MARKET_TITLE_TRANSLATIONS: Record<string, string> = {
  // Ethiopian Markets
  'Next Prime Minister of Ethiopia?': 'ቀጣዩ የኢትዮጵያ ጠቅላይ ሚኒስትር ማን ይሆናል?',
  'Will GERD fill phase 6 complete in 2026?': 'የታላቁ ህዳሴ ግድብ 6ኛ ዙር ሙሌት በ2026 ይጠናቀቃል?',
  'Ethiopia annual inflation below 15% in 2026?': 'የኢትዮጵያ አመታዊ የዋጋ ግሽበት በ2026 ከ15% በታች ይሆናል?',
  'Ethio Telecom share listing on ESX by Q4?': 'የኢትዮ ቴሌኮም አክሲዮን በኢትዮጵያ ሰነደ መዋዕለ ንዋይ ገበያ (ESX) ይቀርባል?',
  'Addis Ababa light rail expansion complete in 2026?': 'የአዲስ አበባ ቀላል ባቡር ማስፋፊያ በ2026 ይጠናቀቃል?',
  "Ethiopian coffee export revenue exceeds 1.8 ETB Billion in fiscal year 2025/26?": 'የኢትዮጵያ በቤተሰቡ ንግድ ዋጋ 2025/26 በ1.8 ብር ብሊዮኔ አይደለም?', 
  'Which countries will have Ebola case in 2026?': 'በ2026 የኢቦላ በሽታ የሚገኝባቸው ሀገራት የትኞቹ ናቸው?',

  // Macro & World Politics
  'Fed Decision in September?': 'የፌደራል ሪዘርቭ መስከረም የወለድ ምጣኔ ውሳኔ?',
  'Fed interest rate cut in September 2026?': 'የፌደራል ሪዘርቭ በመስከረም ወር የወለድ ምጣኔ ይቀንሳል?',

  'TikTok banned in the US in 2026?': 'ቲክቶክ በአሜሪካ በ2026 ይታገዳል?',
  'US Senate majority in 2026 midterms?': 'የአሜሪካ ሴኔት አብላጫ ድምፅ በ2026?',
  'US House of Representatives majority?': 'የአሜሪካ የተወካዮች ምክር ቤት አብላጫ ድምፅ?',
  'US Presidential Election 2028 Winner?': 'የ2028 የአሜሪካ ፕሬዝዳንታዊ ምርጫ አሸናፊ?',
  'UK General Election called before December?': 'የእንግሊዝ አጠቃላይ ምርጫ ከታህሳስ በፊት ይጠራል?',
  'Will French Prime Minister survive no-confidence vote?': 'የፈረንሳይ ጠቅላይ ሚኒስትር የውድቀት ድምፅን ይተርፋሉ?',

  // Crypto
  '5 Minute Ethereum Polymarkets': 'የ5 ደቂቃ የኢቴሪየም የትንበያ ገበያ',
  '5 Minute Bitcoin Polymarkets': 'የ5 ደቂቃ የቢትኮይን የትንበያ ገበያ',
  'Bitcoin price above 100 ETBk in 2026?': 'የቢትኮይን ዋጋ በ2026 ከ100,000 ETB በላይ ይሆናል?',
  'Ethereum above 4,000 ETB by end of month?': 'ኢቴሪየም በወሩ መጨረሻ ከ4,000 ETB በላይ ይሆናል?',
  'Solana flips Ethereum in 2026 market cap?': 'ሶላና በገበያ ዋጋ ኢቴሪየምን ይበልጣል?',
  'What price will Ethena hit in 2026?': 'ኤቴና (Ethena) በ2026 ምን ያህል ዋጋ ይደርሳል?',
  'What price will Ethena hit in September?': 'ኤቴና በመስከረም ወር ምን ያህል ዋጋ ይደርሳል?',
  'MEGetH airdrop by...?': 'የ MEGetH ነፃ ስጦታ (Airdrop) መቼ ይካሄዳል?',
  'XRP reaches new all-time high in 2026?': 'ኤክስ አር ፒ (XRP) በ2026 አዲስ ከፍተኛ ዋጋ ያስመዘግባል?',

  // Weather & Climate
  'Global average temperature record in 2026?': 'የ2026 የአለም አማካይ ሙቀት አዲስ ክብረወሰን ይሰብራል?',
  'Rain in Addis Ababa tomorrow afternoon?': 'ነገ ከሰዓት በአዲስ አበባ ዝናብ ይዘንባል?',
  'Rain in New York City on Monday?': 'ሰኞ በኒውዮርክ ከተማ ዝናብ ይዘንባል?',
  'Snow in Tokyo during December?': 'በታህሳስ ወር በቶኪዮ በረዶ ይወርዳል?',
  'Category 5 Hurricane in Atlantic in 2026?': 'በአትላንቲክ ውቅያኖስ የደረጃ 5 አውሎ ንፋስ ይከሰታል?',
  'Paris temperature reaches 40°C in summer?': 'በፓሪስ የበጋ ሙቀት 40°C ይደርሳል?',
  'El Niño declared over by NOAA?': 'ኤል ኒኞ መጠናቀቁ በይፋ ይገለጻል?',
  'London rainfall exceeds 100mm this month?': 'የለንደን የዝናብ መጠን በዚህ ወር ከ100ሚሜ ይበልጣል?',
  'Drought state of emergency declared in California?': 'በካሊፎርኒያ የድርቅ አስቸኳይ ጊዜ አዋጅ ይታወጃል?',

  // Sports & Culture
  'Ecuador vs. Ghana': 'ኢኳዶር ከ ጋና',
  'Will Arsenal win the Premier League?': 'አርሰናል የእንግሊዝ ፕሪሚየር ሊግን ያሸንፋል?',
  'Manchester City Premier League champion?': 'ማንቸስተር ሲቲ የፕሪሚየር ሊጉ ሻምፒዮን ይሆናል?',
  'Real Madrid wins Champions League 2026?': 'ሪያል ማድሪድ የ2026 ቻምፒየንስ ሊግን ያሸንፋል?',
  'Ethiopia qualifies for AFCON next edition?': 'ኢትዮጵያ ለቀጣዩ የአፍሪካ ዋንጫ (AFCON) ያልፋል?',
  'OpenAI GPT-5 public release before December?': 'የኦፕን ኤአይ ጂፒቲ-5 (GPT-5) ከታህሳስ በፊት ይለቀቃል?',
  'Apple announces foldable iPhone in 2026?': 'አፕል በ2026 የሚታጠፍ አይፎን ይፋ ያደርጋል?',
  'Will SpaceX Starship successfully catch booster?': 'የስፔስ ኤክስ ስታርሺፕ ሮኬት ማምጠቂያውን በተሳካ ሁኔታ ይይዛል?',
  'Russia-Ukraine ceasefire agreement by December 31, 2027?': 'ሩስያ-ዩካሪን መጋባት ስምምነት ይህሊ 31 2027 ይሰማል?',
};

// Outcome name translations
export const OUTCOME_NAME_TRANSLATIONS: Record<string, string> = {
  'Yes': 'አዎ',
  'No': 'አይ',
  '50+ bps decrease': '50+ bps ቅናሽ',
  '25 bps decrease': '25 bps ቅናሽ',
  'No change': 'ለውጥ የለም',
  '25 bps increase': '25 bps ጭማሪ',
  '50+ bps increase': '50+ bps ጭማሪ',
  'Abiy Ahmed': 'ዐቢይ አሕመድ',
  'Democrats': 'ዴሞክራቶች',
  'Republicans': 'ሪፐብሊካኖች',
  'Over 100k': 'ከ100ሺህ በላይ',
  'Under 100k': 'ከ100ሺህ በታች',
  'Up': 'ከፍ',
  'Down': 'ዝቅ',
  'Arsenal': 'አርሰናል',
  'Man City': 'ማን ሲቲ',
  'Liverpool': 'ሊቨርፑል',
};

/**
 * Translates a UI key based on language
 */
export const t = (key: string, lang: Language, fallback?: string): string => {
  const item = POLYMARKET_UI_TRANSLATIONS[key];
  if (!item) return fallback || key;
  return item[lang] || fallback || key;
};

/**
 * Translates a prediction market title
 */
export const translateMarketTitle = (title: string, lang: Language): string => {
  if (lang === 'en') return title;
  return MARKET_TITLE_TRANSLATIONS[title] || title;
};

/**
 * Translates an outcome name
 */
export const translateOutcomeName = (outcomeName: string, lang: Language): string => {
  if (lang === 'en') return outcomeName;
  return OUTCOME_NAME_TRANSLATIONS[outcomeName] || outcomeName;
};

/**
 * Format currency in Birr (ETB or ብር)
 */
export const formatBirr = (amount: number | string, lang: Language = 'en'): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return lang === 'am' ? `${formatted} ብር` : `${formatted} ETB`;
};

/**
 * Format a volume string into Birr / ETB
 * e.g., "99,274,089 ETB Vol." -> "99,274,089 ብር ዝውውር" or "99,274,089 ETB Vol."
 * e.g., "87.4 ETBm" -> "87.4M ብር" or "87.4M ETB"
 */
export const formatBirrVolume = (volumeStr: string | undefined, lang: Language = 'en'): string => {
  if (!volumeStr) return '';
  let str = volumeStr.replace(/\$/g, '').trim();
  if (lang === 'am') {
    str = str.replace(/Vol\./gi, 'ዝውውር').replace(/Vol/gi, 'ዝውውር').replace(/today/gi, 'ዛሬ');
    if (!str.includes('ብር')) {
      if (str.includes('ዝውውር')) {
        str = str.replace('ዝውውር', 'ብር ዝውውር');
      } else {
        str = `${str} ብር`;
      }
    }
    return str;
  } else {
    if (!str.includes('ETB') && !str.includes('Birr')) {
      if (str.includes('Vol.')) {
        str = str.replace('Vol.', 'ETB Vol.');
      } else if (str.includes('Vol')) {
        str = str.replace('Vol', 'ETB Vol');
      } else if (str.includes('today')) {
        str = str.replace('today', 'ETB today');
      } else {
        str = `${str} ETB`;
      }
    }
    return str;
  }
};

