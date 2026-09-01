import React from 'react';
import {
  TrendingUp,
  Sliders,
  Zap,
  Activity,
  Sparkles,
  Vote,
  Trophy,
  Coins,
  Gamepad2,
  Landmark,
  Globe2,
  Cpu,
  Tv,
  BarChart3,
  CloudSun,
  Flame,
  Radio,
  Award,
} from 'lucide-react';
import { POLYMARKET_CATEGORIES } from '../../data/polymarketData';

interface PolymarketCategoriesProps {
  activeCategory: string;
  setActiveCategory: (catId: string) => void;
}

export const PolymarketCategories: React.FC<PolymarketCategoriesProps> = ({
  activeCategory,
  setActiveCategory,
}) => {
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-3.5 h-3.5 text-blue-400" />;
      case 'Radio':
        return <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />;
      case 'Activity':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      case 'Vote':
        return <Vote className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Flame':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'Landmark':
        return <Landmark className="w-3.5 h-3.5 text-sky-400" />;
      case 'Coins':
        return <Coins className="w-3.5 h-3.5 text-amber-400" />;
      case 'Trophy':
        return <Trophy className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'Cpu':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Globe2':
        return <Globe2 className="w-3.5 h-3.5 text-teal-400" />;
      case 'BarChart3':
        return <BarChart3 className="w-3.5 h-3.5 text-slate-400" />;
      case 'Tv':
        return <Tv className="w-3.5 h-3.5 text-pink-400" />;
      case 'CloudSun':
        return <CloudSun className="w-3.5 h-3.5 text-yellow-400" />;
      case 'Award':
        return <Award className="w-3.5 h-3.5 text-violet-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="w-full bg-[#0d121c] border-b border-[#1e2638] sticky top-[95px] z-30 select-none">
      <div className="max-w-[1920px] mx-auto px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {POLYMARKET_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#222d3e] text-white shadow-sm border border-[#3b4b66] font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#161d2b] border border-transparent'
              }`}
            >
              {cat.icon && renderIcon(cat.icon)}
              <span>{cat.name}</span>
              {cat.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase bg-blue-900/60 text-blue-300">
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
