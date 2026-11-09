import { Link } from 'react-router-dom';

/**
 * Friendly empty state with an optional call to action.
 * Pass `action={{ label, to }}` for a link or `{ label, onClick }` for a button.
 */
const EmptyState = ({ icon: Icon, title, description, action, compact = false, className = '' }) => {
  const actionCls =
    'inline-flex items-center gap-sm mt-lg px-lg py-sm rounded-xl bg-primary text-on-primary text-body-sm font-semibold no-underline hover:bg-primary-container transition-colors';
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'py-xl px-lg' : 'py-3xl px-xl'} ${className}`}>
      {Icon && (
        <div className="relative mb-lg">
          <div className="absolute inset-0 rounded-full bg-primary/5 scale-150" aria-hidden="true" />
          <div className="relative w-14 h-14 rounded-2xl bg-white ring-1 ring-surface-container-high shadow-card flex items-center justify-center text-primary">
            <Icon size={26} strokeWidth={1.75} />
          </div>
        </div>
      )}
      <p className="text-headline-sm text-on-surface">{title}</p>
      {description && <p className="text-body-md text-on-surface-variant mt-xs max-w-sm">{description}</p>}
      {action && (action.to
        ? <Link to={action.to} className={actionCls}>{action.icon}{action.label}</Link>
        : <button type="button" onClick={action.onClick} className={actionCls}>{action.icon}{action.label}</button>)}
    </div>
  );
};

export default EmptyState;
