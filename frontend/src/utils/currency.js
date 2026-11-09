/**
 * LawLink prices are in Sri Lankan rupees. One formatter for the whole app
 * (some pages previously used the Indian ₹ sign and en-IN grouping).
 */
const lkr = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 });

/** 15000 → "LKR 15,000" */
export const formatLKR = (amount) => lkr.format(Number(amount) || 0);

/** Compact form for charts and KPI tiles: 1250 → "LKR 1.3K", 2400000 → "LKR 2.4M". */
export const formatLKRCompact = (amount) => {
  const n = Number(amount) || 0;
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(1)}K`;
  return `LKR ${n.toLocaleString('en-LK')}`;
};

/** en-LK number grouping for plain counts. */
export const formatCount = (n) => (Number(n) || 0).toLocaleString('en-LK');
