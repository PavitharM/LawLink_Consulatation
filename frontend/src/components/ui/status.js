/** Single source of truth for complaint status/priority presentation. */
export const STATUS = {
  OPEN:      { label: 'Open',      className: 'bg-blue-50 text-blue-700 ring-blue-600/15',     dot: 'bg-blue-500' },
  IN_REVIEW: { label: 'In Review', className: 'bg-amber-50 text-amber-800 ring-amber-600/20',  dot: 'bg-amber-500' },
  RESOLVED:  { label: 'Resolved',  className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  CLOSED:    { label: 'Closed',    className: 'bg-slate-100 text-slate-600 ring-slate-500/15', dot: 'bg-slate-400' },
};

export const PRIORITY = {
  HIGH:   { label: 'High',   className: 'bg-red-50 text-red-700 ring-red-600/15' },
  MEDIUM: { label: 'Medium', className: 'bg-amber-50 text-amber-800 ring-amber-600/15' },
  LOW:    { label: 'Low',    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' },
};

/** Human label for any enum-ish value: "IN_REVIEW" → "In Review". */
export const humanize = (value = '') =>
  String(value).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Short, readable case reference from a UUID. */
export const caseRef = (id = '') => `#${String(id).split('-')[0].toUpperCase()}`;
