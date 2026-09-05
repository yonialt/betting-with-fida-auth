import React, { useState, useEffect, useCallback } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'animation' | 'fading'>('animation');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('fading'), 5000);
    const doneTimer = setTimeout(() => onComplete(), 5800);
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
        background: '#0a0a1a',
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 0.6s ease-in-out',
      }}
    >
      <iframe
        src="/splash.html"
        title="Splash"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
        }}
      />
    </div>
  );
};
