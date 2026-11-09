import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

const ConfirmContext = createContext(null);

/**
 * Promise-based replacement for window.confirm():
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title, message, confirmLabel, danger: true }))) return;
 */
export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolver = useRef(null);
  const confirmBtn = useRef(null);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    resolver.current = resolve;
    setState({ confirmLabel: 'Confirm', cancelLabel: 'Cancel', ...opts });
  }), []);

  const close = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  }, []);

  useEffect(() => {
    if (!state) return undefined;
    confirmBtn.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') close(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state, close]);

  const Icon = state?.danger ? AlertTriangle : HelpCircle;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-md bg-black/40 backdrop-blur-[2px] animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) close(false); }}
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message"
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-xl animate-pop-in">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-md ${state.danger ? 'bg-red-50 text-red-600' : 'bg-primary/5 text-primary'}`}>
              <Icon size={22} />
            </div>
            <h2 id="confirm-title" className="text-headline-sm text-on-surface">{state.title}</h2>
            {state.message && <p id="confirm-message" className="text-body-md text-on-surface-variant mt-xs">{state.message}</p>}
            <div className="flex flex-col-reverse sm:flex-row gap-sm mt-xl">
              <button type="button" onClick={() => close(false)}
                className="flex-1 py-sm rounded-xl border border-outline-variant text-body-md font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
                {state.cancelLabel}
              </button>
              <button type="button" ref={confirmBtn} onClick={() => close(true)}
                className={`flex-1 py-sm rounded-xl text-body-md font-semibold text-white transition-colors ${state.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-container'}`}>
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
};
