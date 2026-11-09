import { useState, useEffect, useRef, Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PageLoader from './PageLoader';

const ProtectedRoute = ({ role, allowedRoles, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const contentRef = useRef(null);

  // The content pane scrolls, not the window — reset it on navigation.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // Close the mobile drawer with Escape and lock background scroll while open.
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const isAuthenticated = !!role;
  const isAuthorized = isAuthenticated && allowedRoles.includes(role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  if (!isAuthorized) {
    // Redirect to their respective dashboard if they try to access unauthorized routes
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'lawyer') return <Navigate to="/lawyer" replace />;
    if (role === 'user') return <Navigate to="/user" replace />;
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-container-low">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden animate-fade-in"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on lg+, slide-in on mobile */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar role={role} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        <Navbar
          role={role}
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div ref={contentRef} id="main-content" className="flex-1 p-md sm:p-xl overflow-y-auto">
          <div className="max-w-container-max mx-auto page-enter" key={pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute;
