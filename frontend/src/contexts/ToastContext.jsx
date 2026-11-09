import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const styles = {
  success: { icon: CheckCircle2, accent: 'text-emerald-600', bar: 'bg-emerald-500' },
  error:   { icon: AlertCircle,  accent: 'text-red-600',     bar: 'bg-red-500' },
  info:    { icon: Info,         accent: 'text-primary',     bar: 'bg-primary' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback((type, message, { title, duration = 4000 } = {}) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-3), { id, type, title, message }]);
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (msg, opts) => show('success', msg, opts),
    error: (msg, opts) => show('error', msg, { duration: 6000, ...opts }),
    info: (msg, opts) => show('info', msg, opts),
    dismiss,
  }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[100] bottom-md right-md left-md sm:left-auto sm:w-[380px] flex flex-col gap-sm pointer-events-none"
      >
        {toasts.map((t) => {
          const s = styles[t.type] || styles.info;
          const Icon = s.icon;
          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto relative overflow-hidden flex items-start gap-md bg-white rounded-xl shadow-xl ring-1 ring-black/5 pl-lg pr-sm py-md animate-slide-up"
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} aria-hidden="true" />
              <Icon size={20} className={`${s.accent} shrink-0 mt-[2px]`} />
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-label-md text-on-surface">{t.title}</p>}
                <p className="text-body-sm text-on-surface-variant break-words">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
