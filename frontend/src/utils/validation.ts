/**
 * Shared client-side validation for signup/login — mirrors the backend rules in
 * UserAccountService (username/phone/email/password) so users get instant
 * feedback while the server remains the authority.
 */

export interface FieldErrors {
  username?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const USERNAME_RE = /^[A-Za-z0-9._@-]{3,40}$/;
const PHONE_RE = /^\+?[0-9\s()-]{7,20}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+(\.[^@\s]{2,})+$/;

export const validateUsername = (v: string): string | undefined => {
  const u = v.trim();
  if (!u) return 'Username is required';
  if (u.length < 3 || u.length > 40) return 'Username must be 3-40 characters';
  if (!USERNAME_RE.test(u)) return 'Username may only contain letters, numbers, dots, dashes and underscores';
  return undefined;
};

export const validatePhone = (v: string): string | undefined => {
  const p = v.trim();
  if (!p) return 'Phone number is required';
  if (!PHONE_RE.test(p)) return 'Enter a valid phone number (e.g. +251911000000)';
  if (p.replace(/[\s()-]/g, '').length < 9) return 'Phone number is too short';
  return undefined;
};

export const validateEmail = (v: string): string | undefined => {
  const e = v.trim();
  if (!e) return undefined; // optional field
  if (!EMAIL_RE.test(e)) return 'Enter a valid email address';
  return undefined;
};

export const validatePassword = (v: string): string | undefined => {
  if (!v) return 'Password is required';
  if (v.length < 8) return 'Password must be at least 8 characters';
  if (v.length > 72) return 'Password must be at most 72 characters';
  if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return 'Password must contain both letters and numbers';
  return undefined;
};

export const validateConfirm = (v: string, password: string): string | undefined => {
  if (!v) return 'Please confirm your password';
  if (v !== password) return 'Passwords do not match';
  return undefined;
};
