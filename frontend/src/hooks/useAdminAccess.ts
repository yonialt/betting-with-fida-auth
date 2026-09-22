import { useSyncExternalStore } from 'react';

/**
 * Admin visibility helpers.
 *
 * There is no real role system yet, so "admin" means: the visitor has unlocked
 * the console via the AdminGate passphrase in this browser session. Admin
 * Console links across the UI (footer, settings) render only when this is true;
 * everyone else never sees them. The /admin route itself is additionally
 * guarded by AdminGate, so the flag alone grants nothing.
 */

const ADMIN_FLAG_KEY = 'fidabet_admin_unlocked';
const UNLOCK_EVENT = 'fidabet:admin-unlock';

export function isAdminUnlocked(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist the unlock for this session and notify live subscribers. */
export function unlockAdmin(): void {
  try {
    sessionStorage.setItem(ADMIN_FLAG_KEY, '1');
  } catch {
    /* storage unavailable — flag is best-effort only */
  }
  window.dispatchEvent(new Event(UNLOCK_EVENT));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(UNLOCK_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(UNLOCK_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/** Reactive flag: true only after the admin console has been unlocked this session. */
export function useAdminAccess(): boolean {
  return useSyncExternalStore(subscribe, isAdminUnlocked, () => false);
}
