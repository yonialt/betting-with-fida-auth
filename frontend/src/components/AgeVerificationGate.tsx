import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { SplashScreen } from './SplashScreen';

interface VerificationResult {
  verified: boolean;
  status: string;
  message: string;
  age?: number;
  fullName?: string;
  dateOfBirth?: string;
}

/**
 * Age Verification Gate — styled to match Fayda Partner Portal theme
 * Dark teal/cyan (#1a3a4a) + white + gold accents
 */
export const AgeVerificationGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [faydaId, setFaydaId] = useState<string>('');
  const [splashDone, setSplashDone] = useState<boolean>(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);
  const [showFaydaId, setShowFaydaId] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        let token = localStorage.getItem('fidabet_token');
        if (!token) {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Player_8831', password: 'password123' }),
          });
          if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.token;
            if (token) {
              localStorage.setItem('fidabet_token', token);
              if (data.refreshToken) localStorage.setItem('fidabet_refresh_token', data.refreshToken);
            }
          }
        }

        if (cancelled) return;

        if (token) {
          const statusRes = await fetch('/api/age-verification/status', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (statusRes.ok) {
            const data = await statusRes.json();
            if (!cancelled) {
              setIsVerified(data.verified);
              if (data.verified) {
                setResult({
                  verified: true,
                  status: 'VERIFIED',
                  message: data.latestVerification?.reason || 'Age verified',
                  age: data.latestVerification?.age,
                });
              }
            }
          } else {
            if (!cancelled) setIsVerified(false);
          }
        } else {
          if (!cancelled) setIsVerified(false);
        }
      } catch (err) {
        console.error('[AgeGate] Init error:', err);
        if (!cancelled) setIsVerified(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const cleanId = faydaId.replace(/\s/g, '');
    if (!/^\d{12}$/.test(cleanId)) {
      setError('Fayda ID must be exactly 12 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      let token = localStorage.getItem('fidabet_token');
      if (!token) {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'Player_8831', password: 'password123' }),
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          token = loginData.token;
          if (token) {
            localStorage.setItem('fidabet_token', token);
            if (loginData.refreshToken) localStorage.setItem('fidabet_refresh_token', loginData.refreshToken);
          }
        }
      }

      if (!token) {
        setError('Authentication failed. Please refresh and try again.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/age-verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ faydaId: cleanId }),
      });

      const data = await res.json();
      setResult(data);

      if (data.status === 'VERIFIED' || data.status === 'ALREADY_VERIFIED') {
        setIsVerified(true);
      }
    } catch (err) {
      console.error('[AgeGate] Verify error:', err);
      setError('Failed to connect to verification service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipDemo = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      let token = localStorage.getItem('fidabet_token');
      if (!token) {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'Player_8831', password: 'password123' }),
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          token = loginData.token;
          if (token) {
            localStorage.setItem('fidabet_token', token);
            if (loginData.refreshToken) localStorage.setItem('fidabet_refresh_token', loginData.refreshToken);
          }
        }
      }

      if (!token) {
        setError('Authentication failed.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/age-verification/skip-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setResult(data);
      if (data.status === 'VERIFIED') {
        setIsVerified(true);
      }
    } catch (err) {
      console.error('[AgeGate] Skip error:', err);
      setError('Failed to skip verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isVerified === null) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a3a4a 0%, #0f2a36 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ width: 48, height: 48, color: '#80cbc4', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Checking verification status...</p>
        </div>
      </div>
    );
  }

  // Already verified — show splash then app
  if (isVerified) {
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/fayda-logo.png"
            alt="Fayda National Digital ID"
            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'contain', marginBottom: 16, display: 'block', margin: '0 auto 16px auto' }}
          />
          <h1 style={{ color: '#ffffff', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
            Age Verification
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Ethiopian law requires all betting users to be 18 years or older.<br />
            Verify your identity using Fayda, the national digital ID.
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
                <span style={{ color: '#2e7d32', fontWeight: 600, fontSize: 14 }}>Verification Successful</span>
              </div>
              <p style={{ color: '#1b5e20', fontSize: 13, margin: 0 }}>{result.message}</p>
              {result.age && (
                <p style={{ color: '#4caf50', fontSize: 12, marginTop: 4 }}>Verified age: {result.age} years</p>
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
                <span style={{ color: '#c62828', fontWeight: 600, fontSize: 14 }}>Age Verification Failed</span>
              </div>
              <p style={{ color: '#b71c1c', fontSize: 13, margin: 0 }}>{result.message}</p>
              <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                You must be 18 or older to use this platform.
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
                  Fayda ID Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showFaydaId ? 'text' : 'password'}
                    value={faydaId}
                    onChange={(e) => setFaydaId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Enter your 12-digit Fayda ID"
                    autoFocus
                    disabled={isSubmitting}
                    maxLength={12}
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
                  Your Fayda ID is the 12-digit number on your national digital ID card.
                </p>
              </div>

              {/* Submit */}
              <button
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
                    Verifying with Fayda...
                  </>
                ) : (
                  'Verify Age'
                )}
              </button>
            </form>
          )}

          {/* Demo Skip */}
          {result?.status !== 'VERIFIED' && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eceff1' }}>
              <button
                onClick={handleSkipDemo}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'transparent',
                  color: '#78909c',
                  border: '1px solid #eceff1',
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#546e7a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78909c'; }}
              >
                Demo: Skip verification (development only)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            Powered by{' '}
            <a
              href="https://id.gov.et"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(128,203,196,0.6)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#80cbc4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(128,203,196,0.6)'; }}
            >
              Fayda National Digital ID
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
