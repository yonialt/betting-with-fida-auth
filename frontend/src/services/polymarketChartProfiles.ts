/**
 * Realistic chart profiles and generator for every Polymarket statement, question, and match.
 * Generates distinct, domain-accurate historical series and price curves
 * tailored to politics, sports/esports, tech/AI, geopolitics, and Ethiopian markets.
 */

export interface ChartLine {
  name: string;
  color: string;
  points: number[];
}

export interface RealisticChartData {
  labels: string[];
  yTicks?: string[];
  targetLine?: number;
  lines: ChartLine[];
  change24h?: string;
  isPositive?: boolean;
}

// Deterministic PRNG seeded from a string so every chart is stable and unique
function createSeededRng(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pre-calibrated authentic profiles for featured markets and carousel slides
 */
const MARKET_PROFILES: Record<string, RealisticChartData> = {
  // 1. Addis Ababa becomes a federally administered city before 2029?
  'eth-addis-federal-city': {
    labels: ['Feb', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep'],
    yTicks: ['45%', '40%', '35%', '30%', '25%'],
    change24h: '+2.1%',
    isPositive: true,
    lines: [
      {
        name: 'Yes',
        color: '#10b981',
        points: [28.0, 30.5, 32.0, 34.0, 36.5, 38.0],
      },
    ],
  },

  // 3. Ethiopia enacts mandatory national military service before 2029?
  'eth-military-service': {
    labels: ['Feb', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep'],
    yTicks: ['40%', '32%', '24%', '16%', '8%'],
    change24h: '+2.1%',
    isPositive: true,
    lines: [
      {
        name: 'Yes',
        color: '#10b981',
        points: [18.2, 21.5, 25.4, 23.0, 27.8, 29.0],
      },
    ],
  },

  // 4. Ethiopia secures official Red Sea port access accord before 2027?
  'eth-red-sea-access': {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Aug', 'Sep'],
    yTicks: ['85%', '75%', '65%', '55%', '45%'],
    change24h: '+12.4%',
    isPositive: true,
    lines: [
      {
        name: 'Yes',
        color: '#10b981',
        points: [44.0, 52.5, 59.0, 64.2, 70.8, 74.0],
      },
    ],
  },
  'pm-eth-redsea': {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Aug', 'Sep'],
    yTicks: ['85%', '75%', '65%', '55%', '45%'],
    change24h: '+12.4%',
    isPositive: true,
    lines: [
      {
        name: 'Yes',
        color: '#10b981',
        points: [44.0, 52.5, 59.0, 64.2, 70.8, 74.0],
      },
    ],
  },


  // 6. Bitcoin Up or Down 5m
  'btc-up-down': {
    labels: ['2:10 PM', '2:11 PM', '2:12 PM', '2:13 PM', '2:14 PM', '2:15 PM'],
    yTicks: ['79,840 ETB', '79,835 ETB', '79,830 ETB', '79,825 ETB', '79,820 ETB'],
    targetLine: 79829,
    change24h: '+0.1%',
    isPositive: true,
    lines: [
      {
        name: 'BTC',
        color: '#f59e0b',
        points: [79818, 79824, 79835, 79827, 79833, 79829],
      },
    ],
  },
  'pm-btc-5m': {
    labels: ['2:10 PM', '2:11 PM', '2:12 PM', '2:13 PM', '2:14 PM', '2:15 PM'],
    yTicks: ['79,840 ETB', '79,835 ETB', '79,830 ETB', '79,825 ETB', '79,820 ETB'],
    targetLine: 79829,
    change24h: '+0.1%',
    isPositive: true,
    lines: [
      {
        name: 'BTC',
        color: '#f59e0b',
        points: [79818, 79824, 79835, 79827, 79833, 79829],
      },
    ],
  },

  // 7. Balance of Power: 2026 Midterms
  'midterms-balance-power': {
    labels: ['Nov 2024', 'May 2025', 'Nov 2025', 'May 2026', 'Sep 2026'],
    yTicks: ['60%', '45%', '30%', '15%', '0%'],
    change24h: '+5.0%',
    isPositive: true,
    lines: [
      { name: 'Democrats Sweep', color: '#3b82f6', points: [35, 39, 44, 48, 51] },
      { name: 'R Senate, D House', color: '#06b6d4', points: [25, 28, 31, 35, 36] },
      { name: 'Republicans Sweep', color: '#ef4444', points: [35, 29, 21, 15, 12] },
      { name: 'D Senate, R House', color: '#a855f7', points: [5, 4, 4, 2, 1] },
    ],
  },

  // 8. Which company has the best AI model end of the year?
  'best-ai-september': {
    labels: ['Jul 1', 'Aug 1', 'Sep 1', 'Oct 1', 'Nov 1', 'Dec 1'],
    yTicks: ['90%', '70%', '50%', '30%', '10%'],
    change24h: '+16.5%',
    isPositive: true,
    lines: [
      { name: 'Anthropic', color: '#38bdf8', points: [38, 49, 62, 73, 81, 84] },
      { name: 'OpenAI', color: '#10b981', points: [48, 41, 30, 21, 16, 14] },
      { name: 'Google', color: '#f59e0b', points: [11, 8, 6, 5, 2.5, 2] },
    ],
  },

  // 11. Will China invade Taiwan by end of 2026?
  'china-taiwan-2026': {
    labels: ['Jan 2025', 'Jun 2025', 'Nov 2025', 'Apr 2026', 'Sep 2026'],
    yTicks: ['10%', '8%', '6%', '4%', '2%', '0%'],
    change24h: '-0.8%',
    isPositive: false,
    lines: [
      {
        name: 'Yes',
        color: '#10b981',
        points: [6.1, 4.8, 3.5, 8.4, 5.2, 4.0],
      },
    ],
  },

  // 12. Russia-Ukraine ceasefire agreement by Dec 31, 2027
  'russia-ukraine-ceasefire': {
    labels: ['Jan 2026', 'Mar 2026', 'May 2026', 'Jul 2026', 'Sep 2026', 'Oct 2026'],
    yTicks: ['40%', '35%', '30%', '25%', '20%'],
    change24h: '+5.2%',
    isPositive: true,
    lines: [
      {
        name: 'Yes',
        color: '#10b981',
        points: [22.0, 24.5, 27.0, 30.0, 33.0, 35.0],
      },
    ],
  },

  // 13. Ethiopian coffee export revenue exceeds 1.8B ETB
  'pm-eth-coffee-export': {
    labels: ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'],
    yTicks: ['80%', '70%', '60%', '50%', '40%'],
    change24h: '+3.8%',
    isPositive: true,
    lines: [
      {
        name: 'Yes',
        color: '#10b981',
        points: [58.0, 62.0, 66.0, 69.0, 71.0, 72.0],
      },
    ],
  },



  // 13. GERD generation hits 100% capacity in 2026?
  'pm-eth-gerd-capacity': {
    labels: ['Oct 2025', 'Jan 2026', 'Mar 2026', 'May 2026', 'Jul 2026', 'Sep 2026'],
    yTicks: ['95%', '85%', '75%', '65%', '55%'],
    change24h: '+4.0%',
    isPositive: true,
    lines: [
      {
        name: 'Yes',
        color: '#10b981',
        points: [64, 70, 77, 82, 86, 89],
      },
    ],
  },

  // 14. National Bank of Ethiopia Official Birr (USD/ETB) exceeds 150 before end of 2026?
  'pm-eth-birr-fx': {
    labels: ['Jan 2026', 'Mar 2026', 'May 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'],
    yTicks: ['70%', '60%', '50%', '40%', '30%'],
    change24h: '+11.5%',
    isPositive: true,
    lines: [
      {
        name: 'Yes',
        color: '#10b981',
        points: [29, 36, 44, 55, 61, 64],
      },
    ],
  },

  // 15. Next Prime Minister of Ethiopia?
  'pm-ethiopia-pm': {
    labels: ['2024', '2025', 'Early 2026', 'Mid 2026', 'Sep 2026'],
    yTicks: ['100%', '95%', '90%', '85%'],
    change24h: '+1.0%',
    isPositive: true,
    lines: [
      {
        name: 'Abiy Ahmed',
        color: '#10b981',
        points: [92, 94, 95.5, 96.5, 97],
      },
    ],
  },









  // 20. Ethiopia Bitcoin Mining Hashrate
  'pm-eth-bitcoin-mining': {
    labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Sep 2026'],
    yTicks: ['60%', '45%', '30%', '15%'],
    change24h: '+14.2%',
    isPositive: true,
    lines: [      { name: 'Yes',
        color: '#10b981',
        points: [16, 22, 29, 36, 41],
      },
    ],
  },
};

/**
 * Intelligent deterministic generator for ANY statement, question, or match.
 * Generates an authentic trajectory matching the question's domain and target probabilities.
 */
export function getRealisticChartForMarket(
  marketId: string,
  title = '',
  outcomes: { name: string; probability?: number; color?: string }[] = [],
  category = ''
): RealisticChartData {
  // 1. Direct profile lookup by market ID
  if (MARKET_PROFILES[marketId]) {
    return MARKET_PROFILES[marketId];
  }

  // 2. Will Addis Ababa's legal administrative status change before 2029?Keyword profile matching in title
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('addis ababa') && lowerTitle.includes('city')) {
    return MARKET_PROFILES['eth-addis-federal-city'];
  }
  if (lowerTitle.includes('military') || lowerTitle.includes('service')) {
    return MARKET_PROFILES['eth-military-service'];
  }
  if (lowerTitle.includes('red sea') || lowerTitle.includes('port')) {
    return MARKET_PROFILES['eth-red-sea-access'];
  }

  if (lowerTitle.includes('taiwan') || lowerTitle.includes('china')) {
    return MARKET_PROFILES['china-taiwan-2026'];
  }
  if (lowerTitle.includes('russia') && lowerTitle.includes('ukraine') && lowerTitle.includes('ceasefire')) {
    return MARKET_PROFILES['russia-ukraine-ceasefire'];
  }
  if (lowerTitle.includes('coffee') && lowerTitle.includes('export')) {
    return MARKET_PROFILES['pm-eth-coffee-export'];
  }
  if (lowerTitle.includes('gerd')) {
    return MARKET_PROFILES['pm-eth-gerd-capacity'];
  }
  if (lowerTitle.includes('birr') || lowerTitle.includes('nbe')) {
    return MARKET_PROFILES['pm-eth-birr-fx'];
  }
  if (lowerTitle.includes('abiy') || lowerTitle.includes('prime minister')) {
    return MARKET_PROFILES['pm-ethiopia-pm'];
  }

  // 3. Dynamic synthesis based on actual market outcomes and category
  const rng = createSeededRng(marketId + title);
  const POINTS = 6;
  const isMatch =
    outcomes.length === 2 &&
    outcomes[0].name.toLowerCase() !== 'yes' &&
    outcomes[0].name.toLowerCase() !== 'no';

  // Opposing Versus Match (Sports / Esports: e.g. Team A vs Team B)
  if (isMatch) {
    const p1 = Math.max(5, Math.min(95, outcomes[0].probability ?? 50));
    const p2 = Math.max(5, Math.min(95, outcomes[1]?.probability ?? 100 - p1));
    const pts1: number[] = [];
    const pts2: number[] = [];

    // Match started around 50-50, then swung over time to the final score
    let current1 = 50 + (rng() * 2 - 1) * 4;
    for (let i = 0; i < POINTS - 1; i++) {
      const step = (p1 - current1) * (0.35 + rng() * 0.2);
      current1 = Math.max(5, Math.min(95, current1 + step));
      pts1.push(+current1.toFixed(1));
      pts2.push(+(100 - current1).toFixed(1));
    }
    pts1.push(p1);
    pts2.push(p2);

    const labels = ['Start', 'Early', 'Mid Game', 'Late Game', 'Penultimate', 'Live'];
    const maxVal = Math.max(p1, p2);
    const minVal = Math.min(p1, p2);
    const yTicks = [
      `${Math.min(95, Math.ceil(maxVal + 8))}%`,
      `${Math.round((maxVal + 50) / 2)}%`,
      '50%',
      `${Math.round((minVal + 50) / 2)}%`,
      `${Math.max(5, Math.floor(minVal - 8))}%`,
    ];

    return {
      labels,
      yTicks,
      change24h: p1 >= 50 ? `+${(p1 - 50).toFixed(0)}%` : `-${(50 - p1).toFixed(0)}%`,
      isPositive: p1 >= 50,
      lines: [
        { name: outcomes[0].name, color: outcomes[0].color || '#38bdf8', points: pts1 },
        { name: outcomes[1].name, color: outcomes[1].color || '#ef4444', points: pts2 },
      ],
    };
  }

  // Multi-outcome selection (>2 options)
  if (outcomes.length > 2) {
    const colors = ['#38bdf8', '#eab308', '#ef4444', '#10b981', '#a855f7', '#94a3b8'];
    const lines: ChartLine[] = outcomes.slice(0, 4).map((o, idx) => {
      const target = Math.max(1, Math.min(98, o.probability ?? 25));
      const pts: number[] = [];
      let cur = Math.max(1, target + (rng() * 2 - 1) * 14);
      for (let i = 0; i < POINTS - 1; i++) {
        cur += (target - cur) * 0.3 + (rng() * 2 - 1) * 3;
        pts.push(+Math.max(0.5, Math.min(99, cur)).toFixed(1));
      }
      pts.push(target);
      return {
        name: o.name,
        color: o.color || colors[idx % colors.length],
        points: pts,
      };
    });

    return {
      labels: ['Aug 15', 'Aug 23', 'Aug 30', 'Sep 6', 'Sep 11', 'Latest'],
      yTicks: ['80%', '60%', '40%', '20%', '0%'],
      change24h: '+5.0%',
      isPositive: true,
      lines,
    };
  }

  // Standard Binary Yes / No statement
  const targetProb = Math.max(1, Math.min(99, outcomes[0]?.probability ?? 50));
  const pts: number[] = [];

  // Low probability event (<15%)
  if (targetProb <= 15) {
    let cur = Math.max(1, targetProb + (rng() * 2 - 1) * 3);
    for (let i = 0; i < POINTS - 1; i++) {
      cur += (targetProb - cur) * 0.35 + (rng() * 2 - 1) * 2;
      pts.push(+Math.max(1, Math.min(25, cur)).toFixed(1));
    }
    pts.push(targetProb);
    const topTick = Math.ceil(Math.max(...pts) + 4);
    return {
      labels: ['Jan', 'Mar', 'May', 'Jul', 'Aug', 'Sep'],
      yTicks: [`${topTick}%`, `${Math.round(topTick * 0.75)}%`, `${Math.round(topTick * 0.5)}%`, `${Math.round(topTick * 0.25)}%`, '0%'],
      change24h: `${(rng() > 0.5 ? '+' : '-')}${(rng() * 3 + 0.5).toFixed(1)}%`,
      isPositive: rng() > 0.5,
      lines: [{ name: 'Yes', color: '#10b981', points: pts }],
    };
  }

  // High probability event (>75%)
  if (targetProb >= 75) {
    let cur = Math.max(45, targetProb - (rng() * 15 + 10));
    for (let i = 0; i < POINTS - 1; i++) {
      cur += (targetProb - cur) * 0.4 + (rng() * 2 - 1) * 2.5;
      pts.push(+Math.max(50, Math.min(99, cur)).toFixed(1));
    }
    pts.push(targetProb);
    return {
      labels: ['Jan', 'Mar', 'May', 'Jul', 'Aug', 'Sep'],
      yTicks: ['100%', '85%', '70%', '55%', '40%'],
      change24h: `+${(rng() * 8 + 3).toFixed(1)}%`,
      isPositive: true,
      lines: [{ name: 'Yes', color: '#10b981', points: pts }],
    };
  }

  // Mid-range probability event (16% - 74%)
  let cur = Math.max(10, targetProb + (rng() * 2 - 1) * 18);
  for (let i = 0; i < POINTS - 1; i++) {
    cur += (targetProb - cur) * 0.32 + (rng() * 2 - 1) * 4;
    pts.push(+Math.max(5, Math.min(95, cur)).toFixed(1));
  }
  pts.push(targetProb);

  const minV = Math.min(...pts);
  const maxV = Math.max(...pts);
  const pad = Math.max(6, (maxV - minV) * 0.25);
  const tickTop = Math.min(100, Math.ceil(maxV + pad));
  const tickBottom = Math.max(0, Math.floor(minV - pad));
  const span = tickTop - tickBottom || 10;

  return {
    labels: ['1M Ago', '3W Ago', '2W Ago', '1W Ago', '2D Ago', 'Latest'],
    yTicks: [
      `${tickTop}%`,
      `${Math.round(tickTop - span * 0.25)}%`,
      `${Math.round(tickTop - span * 0.5)}%`,
      `${Math.round(tickTop - span * 0.75)}%`,
      `${tickBottom}%`,
    ],
    change24h: targetProb >= pts[0] ? `+${(targetProb - pts[0]).toFixed(1)}%` : `-${(pts[0] - targetProb).toFixed(1)}%`,
    isPositive: targetProb >= pts[0],
    lines: [{ name: 'Yes', color: '#10b981', points: pts }],
  };
}
