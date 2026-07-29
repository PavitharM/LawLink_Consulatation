import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      {/* Nav */}
      <nav className="flex items-center px-lg py-md bg-white border-b border-surface-container-high">
        <Link to="/" className="flex items-center gap-sm text-primary no-underline">
          <Scale size={24} />
          <span className="text-headline-sm font-bold">LawLink</span>
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-xl text-center">
        {/* Big 404 */}
        <div className="relative mb-xl">
          <p className="text-[120px] sm:text-[180px] font-black text-surface-container-high leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-surface-container-high flex items-center justify-center shadow-lg">
              <Scale size={36} className="text-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-headline-lg text-on-surface mb-md">Page Not Found</h1>
        <p className="text-body-lg text-on-surface-variant max-w-md mb-2xl leading-relaxed">
          The page you're looking for doesn't exist, has been moved, or is temporarily unavailable. Don't worry — we'll help you get back on track.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-2xl w-full max-w-lg">
          {[
            { label: 'Go Home', icon: <Home size={18} />, to: '/', primary: true },
            { label: 'Login', icon: <ArrowLeft size={18} />, to: '/login', primary: false },
            { label: 'Register', icon: <Search size={18} />, to: '/register', primary: false },
          ].map((btn, i) => (
            <Link key={i} to={btn.to} className="no-underline">
              <button className={`w-full flex items-center justify-center gap-sm py-md rounded-xl text-body-md font-semibold transition-all
                ${btn.primary ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-white border border-surface-container-high text-on-surface hover:bg-surface-container-low hover:border-primary/30'}`}>
                {btn.icon} {btn.label}
              </button>
            </Link>
          ))}
        </div>

        {/* Help Text */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-lg max-w-md shadow-card">
          <p className="text-label-md text-on-surface-variant mb-sm">Need Help?</p>
          <p className="text-body-md text-on-surface-variant">
            If you believe this is a mistake, please contact us at{' '}
            <span className="text-primary font-medium">help@lawlink.lk</span> or call{' '}
            <span className="text-primary font-medium">+94-11-4567-890</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
