import { STATUS, PRIORITY, humanize } from './status';

const base = 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold ring-1 ring-inset whitespace-nowrap';

export const StatusBadge = ({ status, className = '' }) => {
  const cfg = STATUS[status] || { label: humanize(status), className: 'bg-slate-100 text-slate-600 ring-slate-500/15', dot: 'bg-slate-400' };
  return (
    <span className={`${base} ${cfg.className} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
};

export const PriorityBadge = ({ priority, className = '' }) => {
  if (!priority) return null;
  const cfg = PRIORITY[priority] || { label: humanize(priority), className: 'bg-slate-100 text-slate-600 ring-slate-500/15' };
  return <span className={`${base} ${cfg.className} ${className}`}>{cfg.label} priority</span>;
};
