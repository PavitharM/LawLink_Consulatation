import type { Tone } from '../theme';

export const shortId = (id?: string) => (id ? id.split('-')[0] : '');

export const fmtDate = (d?: string | Date | null, locale?: string) =>
  d ? new Date(d).toLocaleDateString(locale) : '';

export const fmtDateGB = (d?: string | Date | null) => fmtDate(d, 'en-GB');

export const fmtTime = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

/** Intl LKR formatting with a safe fallback (Hermes may lack some locales). */
export const formatLKR = (amount?: number | null) => {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `LKR ${Math.round(n).toLocaleString()}`;
  }
};

export const fmtSize = (b: number) => {
  const MB = 1024 * 1024;
  if (b < 1024) return `${b} B`;
  if (b < MB) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / MB).toFixed(2)} MB`;
};

export const initials = (name?: string, max = 2, fallback = 'U') =>
  name ? name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, max) : fallback;

export const STATUS: Record<string, { label: string; tone: Tone; icon: string }> = {
  OPEN: { label: 'Open', tone: 'info', icon: 'clock' },
  IN_REVIEW: { label: 'In Review', tone: 'warning', icon: 'alert-triangle' },
  RESOLVED: { label: 'Resolved', tone: 'success', icon: 'check-circle' },
  CLOSED: { label: 'Closed', tone: 'neutral', icon: 'x-circle' },
};

export const PRIORITY_TONE: Record<string, Tone> = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'success' };

export const SPECIALIZATIONS = ['Civil Law', 'Criminal Law', 'Family Law', 'Labour Law', 'Property Law', 'Corporate Law', 'Consumer Law'];
