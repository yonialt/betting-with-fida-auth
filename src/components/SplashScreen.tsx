import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'animation' | 'fading'>('animation');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('fading'), 2500);
    const doneTimer = setTimeout(() => onComplete(), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#091118', // Matches FidaBet dark theme
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      <div className="flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-20"></div>
          <div className="relative bg-amber-500/10 border border-amber-500/30 w-full h-full rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <ShieldCheck className="w-12 h-12 text-amber-400 animate-pulse" />
          </div>
        </div>
        
        {/* Brand Name */}
        <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase flex items-center gap-1">
          Fida<span className="text-amber-500">Bet</span>
        </h1>
        
        {/* Subtitle / Loading */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs text-neutral-500 font-mono tracking-widest uppercase">
            Securing Connection...
          </p>
        </div>
      </div>
    </div>
  );
};
