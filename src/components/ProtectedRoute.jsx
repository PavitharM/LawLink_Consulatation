import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const ProtectedRoute = ({ role, allowedRoles, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // In a real app, this would check actual auth state
  const isAuthenticated = !!role;
  const isAuthorized = isAuthenticated && allowedRoles.includes(role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
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
        <div className="flex-1 p-md sm:p-xl overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute;
