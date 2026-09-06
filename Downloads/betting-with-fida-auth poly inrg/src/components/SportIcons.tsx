import React from 'react';

interface SportIconProps {
  className?: string;
}

export const SoccerIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="12 8 8 11 9.5 15.5 14.5 15.5 16 11 12 8" fill="currentColor" fillOpacity="0.25" />
    <path d="M12 2v6" />
    <path d="M4 8l4 3" />
    <path d="M5.5 17.5l4-2" />
    <path d="M18.5 17.5l-4-2" />
    <path d="M20 8l-4 3" />
  </svg>
);

export const TennisIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2.5 12a9.5 9.5 0 0 1 9.5-9.5" />
    <path d="M21.5 12a9.5 9.5 0 0 1-9.5 9.5" />
    <path d="M2.5 12a9.5 9.5 0 0 0 9.5 9.5" strokeDasharray="1 3" />
    <path d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5" strokeDasharray="1 3" />
  </svg>
);

export const BasketballIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M4.93 4.93a10 10 0 0 1 14.14 14.14" />
    <path d="M4.93 19.07a10 10 0 0 1 14.14-14.14" />
  </svg>
);

export const HockeyIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 20h6a4 4 0 0 0 4-4V3" />
    <ellipse cx="6" cy="19" rx="3" ry="1.5" fill="currentColor" fillOpacity="0.4" />
    <line x1="14" y1="3" x2="18" y2="3" />
  </svg>
);

export const VolleyballIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 0-4 18.5" />
    <path d="M12 12l8.66-5" />
    <path d="M12 12l-8.66-5" />
    <path d="M12 12v10" />
  </svg>
);

export const TableTennisIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="9" r="7" fill="currentColor" fillOpacity="0.15" />
    <path d="M16 14l5 5a2 2 0 0 1-2.83 2.83l-5-5" />
    <circle cx="19" cy="5" r="2" fill="currentColor" />
  </svg>
);

export const CricketIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3l4 4-11 11-4-1 1-4L17 3z" fill="currentColor" fillOpacity="0.2" />
    <circle cx="5" cy="19" r="2" fill="currentColor" />
  </svg>
);

export const EsportsIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <circle cx="15" cy="13" r="1" fill="currentColor" />
    <circle cx="18" cy="11" r="1" fill="currentColor" />
  </svg>
);

export const AthleticsIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="14" cy="4" r="2" fill="currentColor" />
    <path d="M6 18l4-3 3 2 4-6" />
    <path d="M9 11l3-3 4 2 3-2" />
    <path d="M10 15l-3 6" />
  </svg>
);

export const BadmintonIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 6l4 4-8 8-4-4 8-8z" />
    <path d="M10 10l-4 4" />
    <circle cx="18" cy="6" r="2" fill="currentColor" />
    <path d="M6 18l-3 3" />
  </svg>
);

export const BaseballIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M7 3.5a12 12 0 0 1 0 17" strokeDasharray="2 2" />
    <path d="M17 3.5a12 12 0 0 0 0 17" strokeDasharray="2 2" />
  </svg>
);

export const BeachVolleyIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="10" r="7" />
    <path d="M5 19c2.5-1 5 1 7 0s4.5-1 7 0" />
  </svg>
);

export const BoatRacingIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 17l18-2-4 5H7l-4-3z" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 4v9l6-3z" />
  </svg>
);

export const HandballIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 3v5" />
    <path d="M12 16v5" />
    <path d="M3 12h5" />
    <path d="M16 12h5" />
  </svg>
);

export const HorseRacingIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 18l3-6 4-2 3-5 4 1-1 4 4 1-2 4-5 1-2 3H4z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const MartialArtsIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8a4 4 0 0 1 8-2l4 4a3 3 0 0 1-1 5l-3 4-6-2-2-9z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const MotorsportIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="10" width="20" height="7" rx="3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="6" cy="17" r="2.5" />
    <circle cx="18" cy="17" r="2.5" />
    <path d="M7 10l3-5h4l3 5" />
  </svg>
);

export const RugbyIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)" fill="currentColor" fillOpacity="0.2" />
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="10" y1="10" x2="8" y2="12" />
    <line x1="14" y1="14" x2="12" y2="16" />
  </svg>
);

export const SnookerIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="8" r="4" fill="currentColor" fillOpacity="0.3" />
    <circle cx="16" cy="8" r="4" fill="currentColor" fillOpacity="0.3" />
    <circle cx="12" cy="15" r="4" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

export const WaterPoloIcon: React.FC<SportIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="5" fill="currentColor" fillOpacity="0.2" />
    <path d="M2 17c2-1 4 1 6 0s4-1 6 0 4 1 6 0" />
    <path d="M2 20c2-1 4 1 6 0s4-1 6 0 4 1 6 0" />
  </svg>
);
