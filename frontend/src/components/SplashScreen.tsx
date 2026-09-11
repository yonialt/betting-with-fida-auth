import React, { useState, useEffect, useCallback } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'animation' | 'fading'>('animation');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('fading'), 3200);
    const doneTimer = setTimeout(() => onComplete(), 3600);
    return () => {
      clearTimeout(timer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      id="app-splash-screen"
      onClick={onComplete}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a1a',
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        cursor: 'pointer',
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
