import React from 'react';
import { Trophy, Gamepad2, CreditCard } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

interface Partner {
  id: string;
  name: string;
  type: 'sports' | 'esports' | 'payment';
  renderLogo: () => React.ReactNode;
}

const PARTNERS: Partner[] = [
  {
    id: 'barcelona',
    name: 'FC Barcelona',
    type: 'sports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        {/* FC Barcelona Crest Vector */}
        <div className="w-12 h-12 relative flex items-center justify-center drop-shadow-md">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer Shield */}
            <path
              d="M10,20 Q50,10 90,20 Q95,65 50,95 Q5,65 10,20 Z"
              fill="#c8102e"
              stroke="#fdba12"
              strokeWidth="4"
            />
            {/* Blue and Claret Stripes */}
            <path
              d="M10,48 Q50,48 90,48 Q95,65 50,95 Q5,65 10,48 Z"
              fill="#004d98"
            />
            <path
              d="M25,48 L25,85 Q50,95 50,95 Q50,48 50,48 Z"
              fill="#c8102e"
            />
            <path
              d="M75,48 L75,85 Q50,95 50,95 Q50,48 50,48 Z"
              fill="#c8102e"
            />
            {/* Upper Top Cross & Catalan Stripes */}
            <rect x="15" y="20" width="32" height="24" fill="#ffffff" />
            <rect x="29" y="20" width="4" height="24" fill="#c8102e" />
            <rect x="15" y="30" width="32" height="4" fill="#c8102e" />
            
            <rect x="53" y="20" width="32" height="24" fill="#fdba12" />
            <rect x="58" y="20" width="3" height="24" fill="#c8102e" />
            <rect x="65" y="20" width="3" height="24" fill="#c8102e" />
            <rect x="72" y="20" width="3" height="24" fill="#c8102e" />
            <rect x="79" y="20" width="3" height="24" fill="#c8102e" />

            {/* FCB Center Ribbon */}
            <rect x="10" y="44" width="80" height="8" fill="#fdba12" />
            <text x="50" y="50" fontSize="7" fontWeight="900" textAnchor="middle" fill="#000000" fontFamily="sans-serif">
              FCB
            </text>

            {/* Ball in lower half */}
            <circle cx="50" cy="72" r="7" fill="#fdba12" stroke="#684a00" strokeWidth="1" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    type: 'sports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        {/* PSG Round Crest Vector */}
        <div className="w-12 h-12 relative flex items-center justify-center drop-shadow-md">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="46" fill="#001c44" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="34" fill="#ffffff" />
            <circle cx="50" cy="50" r="32" fill="#001c44" />
            {/* Eiffel Tower Silhouette */}
            <path
              d="M50,22 L55,48 L58,74 L52,74 L52,65 Q50,62 48,65 L48,74 L42,74 L45,48 Z"
              fill="#da291c"
            />
            {/* Fleur de lis in gold */}
            <path
              d="M50,67 Q47,69 46,72 Q50,71 50,75 Q50,71 54,72 Q53,69 50,67 Z"
              fill="#c5a967"
            />
            <text x="50" y="16" fontSize="7.5" fontWeight="900" textAnchor="middle" fill="#ffffff" letterSpacing="1">
              PARIS
            </text>
            <text x="50" y="90" fontSize="5.5" fontWeight="700" textAnchor="middle" fill="#ffffff" letterSpacing="0.5">
              SAINT-GERMAIN
            </text>
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    type: 'sports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        {/* Serie A Official Badge Box */}
        <div className="w-10 h-13 bg-white rounded-md p-1 shadow-md flex flex-col items-center justify-between border border-neutral-200">
          <div className="w-full h-7 flex items-center justify-center">
            <svg viewBox="0 0 60 70" className="w-6 h-7">
              <polygon
                points="30,5 55,20 55,55 30,68 5,55 5,20"
                fill="url(#serieAPartnerGrad)"
              />
              <text x="30" y="48" fontSize="30" fontWeight="900" fill="#ffffff" textAnchor="middle" className="italic font-sans">
                A
              </text>
              <defs>
                <linearGradient id="serieAPartnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00c6ff" />
                  <stop offset="100%" stopColor="#003882" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="w-full flex flex-col items-center">
            <div className="flex w-6 h-0.5 rounded-full overflow-hidden mb-0.5">
              <span className="w-1/3 bg-green-600 h-full"></span>
              <span className="w-1/3 bg-white h-full"></span>
              <span className="w-1/3 bg-red-600 h-full"></span>
            </div>
            <span className="text-[7.5px] font-black text-[#003882] tracking-tighter leading-none">
              SERIE A
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'caf',
    name: 'CAF',
    type: 'sports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        {/* CAF African Football Crest */}
        <div className="w-12 h-12 relative flex items-center justify-center drop-shadow-md">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="42" r="34" fill="#009639" stroke="#fdba12" strokeWidth="2.5" />
            {/* Africa continent silhouette in gold */}
            <path
              d="M42,20 Q56,20 62,26 Q66,35 56,44 Q54,52 50,60 Q45,55 42,48 Q36,40 38,30 Z"
              fill="#fdba12"
            />
            {/* CAF Text */}
            <text x="50" y="88" fontSize="16" fontWeight="900" textAnchor="middle" fill="#ffffff" fontFamily="sans-serif" letterSpacing="1.5">
              CAF
            </text>
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: 'volleyball-world',
    name: 'Volleyball World',
    type: 'sports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center text-center">
        {/* Volleyball World Stylized 'V' Logo */}
        <svg viewBox="0 0 100 80" className="w-11 h-9 drop-shadow-md">
          <path
            d="M20,10 L38,60 L50,60 L68,10 L54,10 L44,44 L34,10 Z"
            fill="#ffffff"
          />
          <path
            d="M36,10 L44,36 L52,10 Z"
            fill="#0091ff"
          />
        </svg>
        <span className="text-[9px] font-black text-white tracking-tight uppercase mt-0.5 leading-none">
          Volleyball
        </span>
        <span className="text-[7.5px] font-medium text-neutral-300 tracking-wider">
          World™
        </span>
      </div>
    ),
  },
  {
    id: 'fiba',
    name: 'FIBA',
    type: 'sports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        {/* FIBA Basketball Ribbon Box */}
        <div className="w-10 h-13 bg-black rounded p-1 flex flex-col items-center justify-between border border-neutral-700 shadow-md">
          {/* FIBA Basketball Sphere Graphic */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 relative overflow-hidden flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 30 30" className="w-full h-full opacity-70">
              <path d="M0,15 H30 M15,0 V30 M4,4 Q15,15 26,26 M26,4 Q15,15 4,26" stroke="#000000" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <div className="text-center">
            <span className="text-white font-black text-xs tracking-wider">FIBA</span>
            <p className="text-[5px] text-neutral-400 tracking-tight leading-none">We Are Basketball</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'billie-jean-king-cup',
    name: 'Billie Jean King Cup',
    type: 'sports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        {/* Billie Jean King Cup Box */}
        <div className="w-12 h-12 bg-gradient-to-br from-[#00c2cb] to-[#007ba7] rounded-md p-1 flex flex-col items-center justify-center text-center shadow-md border border-cyan-300/40">
          <span className="text-[5px] font-bold text-white uppercase tracking-tighter leading-none mb-0.5">
            The World Cup of Tennis
          </span>
          <span className="text-[8px] font-black text-white uppercase tracking-tighter leading-tight font-sans">
            BILLIE JEAN
          </span>
          <span className="text-[10px] font-black text-[#e8f800] uppercase tracking-tighter italic leading-none font-serif">
            KING
          </span>
          <span className="text-[5px] font-bold text-white tracking-widest leading-none mt-0.5">
            CUP
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'nexo-dallas-open',
    name: 'Nexo Dallas Open',
    type: 'sports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center text-center">
        {/* NEXO Dallas Open Logo */}
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 30 30" className="w-4 h-4 text-white">
            <polygon points="5,5 15,25 25,5 20,5 15,17 10,5" fill="#ffffff" />
          </svg>
          <span className="text-white font-black text-xs tracking-widest uppercase">
            NEXO
          </span>
        </div>
        <div className="flex items-center gap-1 text-[7px] text-neutral-300 font-bold uppercase tracking-wider mt-0.5">
          <span>DALLAS</span>
          <span className="text-amber-400">🎾</span>
          <span>OPEN</span>
        </div>
      </div>
    ),
  },
  {
    id: 'pgl',
    name: 'PGL Esports',
    type: 'esports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        {/* PGL Bold Geometric Esports Logo */}
        <span className="text-white font-black text-2xl tracking-tighter font-mono italic drop-shadow-md">
          PGL
        </span>
      </div>
    ),
  },
  {
    id: 'mongolz',
    name: 'The MongolZ',
    type: 'esports',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        {/* Warrior / MongolZ Esports Emblem */}
        <div className="w-11 h-11 relative flex items-center justify-center drop-shadow-md">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            {/* Warrior Helmet Feather Top */}
            <path
              d="M50,5 Q54,12 50,22 Q46,12 50,5 Z"
              fill="#ffffff"
            />
            {/* Warrior Helmet Spire & Dome */}
            <path
              d="M50,18 L68,36 L65,58 L50,52 L35,58 L32,36 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Mask & Fierce Mustache / Beard */}
            <circle cx="42" cy="44" r="3" fill="#ffffff" />
            <circle cx="58" cy="44" r="3" fill="#ffffff" />
            <path
              d="M32,60 Q50,72 68,60 Q50,88 32,60 Z"
              fill="#ffffff"
            />
            {/* Chin Guard */}
            <path
              d="M44,80 L50,92 L56,80 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: 'telebirr',
    name: 'Telebirr',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M30,75 Q25,50 40,35 Q50,25 55,30 Q60,35 50,50 Q55,40 65,35 Q75,30 80,40 Q85,50 75,60 Q70,65 65,60 Q60,55 55,60 Q50,65 45,75 Q40,85 30,75 Z" fill="#0B6EFF" />
          </svg>
        </div>
        <span className="text-[8px] font-bold text-white tracking-wide mt-1">telebirr</span>
      </div>
    ),
  },
  {
    id: 'national-id',
    name: 'Ethiopian National ID',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center border-2 border-teal-700 shadow-md">
          <svg viewBox="0 0 60 60" className="w-8 h-8">
            <circle cx="30" cy="30" r="28" fill="#006652" />
            <path d="M20,22 Q30,18 40,22 Q42,35 38,42 Q34,48 30,50 Q26,48 22,42 Q18,35 20,22 Z" fill="#ffffff" />
            <circle cx="26" cy="30" r="3" fill="#006652" />
            <circle cx="34" cy="30" r="3" fill="#006652" />
            <path d="M25,38 Q30,42 35,38" fill="none" stroke="#006652" strokeWidth="1.5" />
          </svg>
        </div>
        <span className="text-[7px] font-bold text-white tracking-wide mt-1 text-center leading-tight">National ID</span>
      </div>
    ),
  },
  {
    id: 'santim-pay',
    name: 'Santim Pay',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <span className="text-white font-black text-base tracking-tighter leading-none">SANTIM</span>
        <span className="text-amber-400 font-black text-xl tracking-tighter leading-none">PAY</span>
      </div>
    ),
  },
  {
    id: 'arifpay',
    name: 'Arifpay',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-0.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500 fill-current">
            <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="6" y="8" width="12" height="2" fill="currentColor" opacity="0.5" />
            <rect x="6" y="12" width="8" height="2" fill="currentColor" opacity="0.3" />
          </svg>
          <span className="text-white font-black text-sm">Arif</span>
          <span className="text-green-400 font-black text-sm">pay</span>
        </div>
      </div>
    ),
  },
  {
    id: 'dashen-bank',
    name: 'Dashen Bank',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-[#001a6e] rounded flex items-center justify-center shadow-md">
          <svg viewBox="0 0 60 60" className="w-10 h-10">
            <path d="M30,8 L20,25 L15,25 L30,8 L45,25 L40,25 Z" fill="#ffffff" />
            <circle cx="22" cy="28" r="4" fill="none" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="38" cy="28" r="4" fill="none" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M15,35 L45,35 L45,50 L15,50 Z" fill="#001a6e" />
            <text x="30" y="46" fontSize="6" fontWeight="900" textAnchor="middle" fill="#ffffff" fontFamily="sans-serif">
              Dashen
            </text>
          </svg>
        </div>
        <span className="text-[7px] font-bold text-white tracking-wide mt-1">Dashen Bank</span>
      </div>
    ),
  },
];

export const PartnersPanel: React.FC = () => {
  const { setBonusesModalOpen } = useBetting();

  return (
    <div
      id="partners-panel"
      className="w-full bg-[#13355a] border-t border-[#0e2743] px-3 sm:px-4 lg:px-8 py-5 select-none text-white"
    >
      <div className="max-w-[1920px] mx-auto">
        {/* Title */}
        <h3 className="text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase mb-3">
          PARTNERS
        </h3>

        {/* Partners Horizontal Rail Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2 sm:gap-2.5 overflow-x-auto pb-1">
          {PARTNERS.map((partner) => (
            <div
              key={partner.id}
              onClick={() => setBonusesModalOpen(true)}
              title={`${partner.name} - Official Partner`}
              className="group relative bg-[#183d66]/80 hover:bg-[#1f4a7a] rounded-lg p-2.5 h-24 flex flex-col items-center justify-center border border-[#214a79] hover:border-[#3874b7] transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Type Badge Icon on Top Right */}
              <div className="absolute top-1.5 right-1.5 text-neutral-400 group-hover:text-amber-400 transition-colors">
                {partner.type === 'sports' ? (
                  <Trophy className="w-3 h-3" />
                ) : partner.type === 'esports' ? (
                  <Gamepad2 className="w-3 h-3" />
                ) : (
                  <CreditCard className="w-3 h-3" />
                )}
              </div>

              {/* Logo Graphic */}
              <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform">
                {partner.renderLogo()}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Accent Track Line */}
        <div className="w-full h-1 bg-[#1a426e] rounded-full mt-3 overflow-hidden">
          <div className="w-32 h-full bg-[#4174a8] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
