import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertTriangle, Eye, EyeOff, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SplashScreen } from './SplashScreen';
import { useBetting } from '../context/BettingContext';

interface VerificationResult {
  verified: boolean;
  status: string;
  message: string;
  age?: number;
  fullName?: string;
  dateOfBirth?: string;
}

type Lang = 'en' | 'am';

const translations = {
  en: {
    title: 'Age Verification',
    description: (
      <>
        Ethiopian law requires all betting users to be 18 years or older.<br />
        Verify your age using Fayda, the national digital ID.
      </>
    ),
    idLabel: 'Fayda ID Number',
    idPlaceholder: 'FIN - Enter your 12-digit Fayda ID',
    idHelper: 'Your Fayda ID is the 12-digit number on your national digital ID card.',
    verifyBtn: 'Verify Age',
    verifyingBtn: 'Verifying with Fayda...',
    successTitle: 'Verification Successful',
    verifiedAge: (age: number) => `Verified age: ${age} years`,
    failedTitle: 'Age Verification Failed',
    failedSub: 'You must be 18 or older to use this platform.',
    errDigits: 'Fayda ID must be exactly 12 digits',
    errConnect: 'Failed to connect to verification service. Please try again.',
    poweredBy: 'Powered by',
    nationalId: 'Fayda National Digital ID',
  },
  am: {
    title: 'የዕድሜ ማረጋገጫ',
    description: (
      <>
        የኢትዮጵያ ሕግ ሁሉም የውርርድ ተጠቃሚዎች ዕድሜያቸው 18 ዓመት ወይም ከዚያ በላይ መሆን እንዳለበት ይደነግጋል።<br />
        ዕድሜዎን በፋይዳ ብሔራዊ ዲጂታል መታወቂያ ያረጋግጡ።
      </>
    ),
    idLabel: 'የፋይዳ መታወቂያ ቁጥር',
    idPlaceholder: 'FIN - የ12 አሃዝ ፋይዳ መታወቂያዎን ያስገቡ',
    idHelper: 'የእርስዎ የፋይዳ መታወቂያ በብሔራዊ ዲጂታል መታወቂያ ካርድዎ ላይ ያለው ባለ 12 አሃዝ ቁጥር ነው።',
    verifyBtn: 'ዕድሜ ያረጋግጡ',
    verifyingBtn: 'በፋይዳ በማረጋገጥ ላይ...',
    successTitle: 'ማረጋገጫው ተሳክቷል',
    verifiedAge: (age: number) => `የተረጋገጠ ዕድሜ፡ ${age} ዓመት`,
    failedTitle: 'የዕድሜ ማረጋገጫ አልተሳካም',
    failedSub: 'ይህንን መድረክ ለመጠቀም 18 ዓመት ወይም ከዚያ በላይ መሆን አለብዎት።',
    errDigits: 'የፋይዳ መታወቂያ በትክክል 12 አሃዝ መሆን አለበት',
    errConnect: 'ከማረጋገጫ አገልግሎት ጋር መገናኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
    poweredBy: 'በፋይዳ የቀረበ',
    nationalId: 'ፋይዳ ብሔራዊ ዲጂታል መታወቂያ',
  },
};

/**
 * Age Verification Gate — styled to match Fayda Partner Portal theme
 * Dark teal/cyan (#1a3a4a) + white + gold accents
 */
interface FaydaLanguageToggleProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
}

const FaydaLanguageToggle: React.FC<FaydaLanguageToggleProps> = ({
  currentLang,
  onSelectLang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearTimer();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 240);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div
      id="fayda-language-switch-bar"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsOpen((prev) => !prev)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'rgba(0, 0, 0, 0.28)',
        padding: '4px 8px',
        borderRadius: 24,
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Previous Globe Icon (on the left, no circular button, no dot) */}
      <div
        id="fayda-lang-globe-icon"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.85)',
          padding: '2px',
        }}
        title={currentLang === 'am' ? 'ቋንቋ: አማርኛ (ቀይር)' : 'Language: English (Change)'}
      >
        <Globe size={14} style={{ color: 'rgba(255, 255, 255, 0.85)', marginLeft: 2, marginRight: 2 }} />
      </div>

      {/* Pop out to the RIGHT side: Amharic and English */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="fayda-lang-side-popout"
            role="group"
            aria-label="Select Language"
            initial={{ opacity: 0, width: 0, scale: 0.95 }}
            animate={{ opacity: 1, width: 'auto', scale: 1 }}
            exit={{ opacity: 0, width: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              marginLeft: 4,
            }}
          >
            {/* Amharic Option */}
            <button
              type="button"
              id="fayda-lang-am-toggle"
              onClick={(e) => {
                e.stopPropagation();
                onSelectLang('am');
              }}
              style={{
                padding: '4px 12px',
                borderRadius: 16,
                border: 'none',
                fontSize: 12,
                fontWeight: currentLang === 'am' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: currentLang === 'am' ? '#00695c' : 'transparent',
                color: currentLang === 'am' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                boxShadow: currentLang === 'am' ? '0 2px 6px rgba(0, 105, 92, 0.5)' : 'none',
              }}
              title="ወደ አማርኛ ይቀይሩ"
            >
              አማርኛ
            </button>

            {/* English Option */}
            <button
              type="button"
              id="fayda-lang-en-toggle"
              onClick={(e) => {
                e.stopPropagation();
                onSelectLang('en');
              }}
              style={{
                padding: '4px 12px',
                borderRadius: 16,
                border: 'none',
                fontSize: 12,
                fontWeight: currentLang === 'en' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: currentLang === 'en' ? '#00695c' : 'transparent',
                color: currentLang === 'en' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                boxShadow: currentLang === 'en' ? '0 2px 6px rgba(0, 105, 92, 0.5)' : 'none',
              }}
              title="Switch to English"
            >
              English
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AgeVerificationGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ageVerified, markAgeVerified, setLanguage } = useBetting();
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fidabet_gate_lang');
      if (saved === 'am' || saved === 'en') return saved;
    }
    return 'en';
  });

  const handleLanguageToggle = (newLang: Lang) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fidabet_gate_lang', newLang);
    }
    if (setLanguage) {
      setLanguage(newLang);
    }
  };

  const t = translations[lang];

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [faydaId, setFaydaId] = useState<string>('');
  const [splashDone, setSplashDone] = useState<boolean>(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);
  const [showFaydaId, setShowFaydaId] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>('');

  // Whenever the gate is showing (first visit or right after logout), reset the
  // splash + form state so it behaves like a fresh gate and the splash replays
  // after the next successful verification.
  useEffect(() => {
    if (!ageVerified) {
      setSplashDone(false);
      setResult(null);
      setError('');
      setFaydaId('');
    }
  }, [ageVerified]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const cleanId = faydaId.replace(/\D/g, '').slice(0, 12);
    if (cleanId.length !== 12) {
      setError(t.errDigits);
      return;
    }

    setIsSubmitting(true);

    try {
      // Guest-first flow: age verification happens before login, so no auth
      // token is sent. The backend does not require one for these endpoints.
      const res = await fetch('/api/age-verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faydaId: cleanId }),
      });

      const data = await res.json();

      const isVerified =
        data.verified === true ||
        data.status === 'VERIFIED' ||
        data.status === 'verified' ||
        data.status === 'ALREADY_VERIFIED';

      if (isVerified) {
        setResult({
          verified: true,
          status: 'VERIFIED',
          message: data.message || 'Age verification successful via Fayda National ID',
          age: data.age || 24,
        });
        // Immediately record verified status
        markAgeVerified();
      } else {
        setResult({
          verified: false,
          status: 'REJECTED',
          message: data.message || t.failedSub,
        });
      }
    } catch (err) {
      console.error('[AgeGate] Verify error:', err);
      setError(t.errConnect);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already verified (this session) — show splash then app
  if (ageVerified) {
    if (!splashDone) {
      return <SplashScreen onComplete={handleSplashComplete} />;
    }
    return <>{children}</>;
  }

  // Gate — Fayda-themed
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a3a4a 0%, #0f2a36 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 440, width: '100%' }}>
        {/* Language Switcher Toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <FaydaLanguageToggle
            currentLang={lang}
            onSelectLang={handleLanguageToggle}
          />
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/fayda-logo.png"
            alt="Fayda National Digital ID"
            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'contain', marginBottom: 16, display: 'block', margin: '0 auto 16px auto' }}
          />
          <h1 style={{ color: '#ffffff', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
            {t.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {t.description}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {/* Success */}
          {result?.status === 'VERIFIED' && (
            <div style={{
              marginBottom: 24,
              padding: '16px 20px',
              background: '#e8f5e9',
              borderRadius: 8,
              border: '1px solid #a5d6a7',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span style={{ color: '#2e7d32', fontWeight: 600, fontSize: 14 }}>{t.successTitle}</span>
              </div>
              <p style={{ color: '#1b5e20', fontSize: 13, margin: 0 }}>{result.message}</p>
              {result.age && (
                <p style={{ color: '#4caf50', fontSize: 12, marginTop: 4 }}>{t.verifiedAge(result.age)}</p>
              )}
            </div>
          )}

          {/* Rejection */}
          {result?.status === 'REJECTED' && (
            <div style={{
              marginBottom: 24,
              padding: '16px 20px',
              background: '#ffebee',
              borderRadius: 8,
              border: '1px solid #ef9a9a',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span style={{ color: '#c62828', fontWeight: 600, fontSize: 14 }}>{t.failedTitle}</span>
              </div>
              <p style={{ color: '#b71c1c', fontSize: 13, margin: 0 }}>{result.message}</p>
              <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                {t.failedSub}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16,
              padding: '12px 16px',
              background: '#ffebee',
              borderRadius: 8,
              border: '1px solid #ef9a9a',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertTriangle style={{ width: 16, height: 16, color: '#c62828', flexShrink: 0 }} />
              <span style={{ color: '#c62828', fontSize: 13 }}>{error}</span>
            </div>
          )}

          {/* Form */}
          {result?.status !== 'VERIFIED' && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  color: '#37474f',
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {t.idLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="fayda-id-input"
                    type={showFaydaId ? 'text' : 'password'}
                    value={faydaId}
                    onChange={(e) => setFaydaId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder={t.idPlaceholder}
                    autoFocus
                    disabled={isSubmitting}
                    maxLength={24}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '14px 48px 14px 16px',
                      border: '1.5px solid #cfd8dc',
                      borderRadius: 8,
                      fontSize: 15,
                      color: '#263238',
                      background: '#f5f7f8',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#00695c'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#cfd8dc'; }}
                  />
                  <button
                    id="toggle-fayda-visibility-btn"
                    type="button"
                    onClick={() => setShowFaydaId(!showFaydaId)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#90a4ae',
                      padding: 4,
                    }}
                  >
                    {showFaydaId ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p style={{ color: '#90a4ae', fontSize: 12, marginTop: 8 }}>
                  {t.idHelper}
                </p>
              </div>

              {/* Submit */}
              <button
                id="verify-age-submit-btn"
                type="submit"
                disabled={isSubmitting || faydaId.length < 12}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: (isSubmitting || faydaId.length < 12) ? '#b0bec5' : '#00695c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: (isSubmitting || faydaId.length < 12) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { if (!isSubmitting && faydaId.length >= 12) e.currentTarget.style.background = '#004d40'; }}
                onMouseLeave={(e) => { if (!isSubmitting && faydaId.length >= 12) e.currentTarget.style.background = '#00695c'; }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    {t.verifyingBtn}
                  </>
                ) : (
                  t.verifyBtn
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            {t.poweredBy}{' '}
            <a
              href="https://id.gov.et"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(128,203,196,0.7)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#80cbc4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(128,203,196,0.7)'; }}
            >
              {t.nationalId}
            </a>
          </p>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
