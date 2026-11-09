import { Scale } from 'lucide-react';

/**
 * Branded loading indicator used for the initial session check and
 * while lazily-loaded route chunks download.
 */
const PageLoader = ({ fullScreen = false, label = 'Loading' }) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex flex-col items-center justify-center gap-md ${
      fullScreen ? 'min-h-screen bg-surface-container-low' : 'py-3xl'
    }`}
  >
    <div className="relative w-14 h-14">
      <span className="absolute inset-0 rounded-full border-2 border-primary/10" />
      <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      <span className="absolute inset-0 flex items-center justify-center text-primary">
        <Scale size={22} />
      </span>
    </div>
    <p className="text-label-sm text-on-surface-variant tracking-widest uppercase">{label}…</p>
  </div>
);

export default PageLoader;
