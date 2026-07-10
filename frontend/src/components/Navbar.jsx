import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale, Bell, LogOut, ChevronDown, Settings, Menu,
  User, Briefcase, MessageSquare, CreditCard, Clock, CheckCheck, X
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { AuthContext } from '../App';

const notifRoutes  = { user: '/user/notifications', lawyer: '/lawyer/notifications', admin: '/admin' };

/* icon helper — keeps JSX out of the data store */
const typeIcon = (type) => {
  const cls = 'shrink-0';
  switch (type) {
    case 'lawyer':  return <User        size={16} className={`${cls} text-primary`} />;
    case 'case':    return <Briefcase   size={16} className={`${cls} text-blue-600`} />;
    case 'message': return <MessageSquare size={16} className={`${cls} text-green-600`} />;
    case 'payment': return <CreditCard  size={16} className={`${cls} text-purple-600`} />;
    case 'hearing': return <Clock       size={16} className={`${cls} text-yellow-600`} />;
    default:        return <Bell        size={16} className={`${cls} text-on-surface-variant`} />;
  }
};

const typeBg = {
  lawyer:  'bg-primary/10',
  case:    'bg-blue-50',
  message: 'bg-green-50',
  payment: 'bg-purple-50',
  hearing: 'bg-yellow-50',
};

const Navbar = ({ role, onLogout, onMenuClick }) => {
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);
  const [showMenu,  setShowMenu]  = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  /* shared notification state */
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const closeAll = () => { setShowMenu(false); setShowNotif(false); };

  /* show only latest 5 in the dropdown */
  const preview = notifications.slice(0, 5);

  return (
    <nav className="flex justify-between items-center px-md sm:px-xl py-sm bg-white border-b border-surface-container-high h-[64px] sticky top-0 z-40 shadow-sm">

      {/* ── Left: hamburger + logo ── */}
      <div className="flex items-center gap-sm">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all"
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="flex items-center gap-sm text-primary no-underline group">
          <Scale size={24} className="group-hover:rotate-12 transition-transform duration-200" />
          <span className="text-headline-sm font-bold">LawLink</span>
        </Link>
      </div>

      {/* ── Right: badge + bell + user ── */}
      <div className="flex items-center gap-md">

        {/* Role badge */}
        <span className={`hidden sm:flex text-label-sm px-md py-xs rounded-full font-semibold capitalize
          ${role === 'admin'  ? 'bg-red-100   text-red-700'
          : role === 'lawyer' ? 'bg-blue-100  text-blue-700'
          :                     'bg-green-100 text-green-700'}`}>
          {role}
        </span>

        {/* ── Bell ── */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif((s) => !s); setShowMenu(false); }}
            className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-on-primary text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotif && (
            <div className="absolute right-0 top-full mt-sm w-[340px] bg-white border border-surface-container-high rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* header */}
              <div className="flex items-center justify-between px-lg py-md border-b border-surface-container-high">
                <span className="text-label-md font-semibold text-on-surface">Notifications</span>
                <div className="flex items-center gap-md">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-label-sm text-primary hover:underline flex items-center gap-xs"
                    >
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  )}
                  <span className="text-label-sm text-on-surface-variant">{unreadCount} new</span>
                </div>
              </div>

              {/* list */}
              {preview.length === 0 ? (
                <div className="px-lg py-2xl text-center">
                  <Bell size={36} className="mx-auto text-on-surface-variant opacity-30 mb-sm" />
                  <p className="text-body-sm text-on-surface-variant">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-container-high max-h-[360px] overflow-y-auto">
                  {preview.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.link) { navigate(n.link); closeAll(); }
                      }}
                      className={`group flex items-start gap-sm px-lg py-md cursor-pointer transition-colors
                        ${!n.read ? 'bg-primary/[0.03] hover:bg-primary/[0.06]' : 'hover:bg-surface-container-low'}`}
                    >
                      {/* coloured icon bubble */}
                      <div className={`w-8 h-8 rounded-full ${typeBg[n.type] || 'bg-surface-container'} flex items-center justify-center shrink-0 mt-xs`}>
                        {typeIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-sm">
                          <p className={`text-body-sm leading-snug ${!n.read ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
                            {n.title}
                          </p>
                          <div className="flex items-center gap-xs shrink-0">
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            <button
                              onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                              className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-red-500 transition-all"
                              title="Dismiss"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-body-sm text-on-surface-variant mt-xs">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* footer */}
              <div className="px-lg py-md border-t border-surface-container-high">
                <button
                  onClick={() => { closeAll(); navigate(notifRoutes[role] || '/'); }}
                  className="text-body-sm text-primary font-medium hover:underline w-full text-center"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── User menu ── */}
        <div className="relative">
          <button
            onClick={() => { setShowMenu((s) => !s); setShowNotif(false); }}
            className="flex items-center gap-sm p-xs rounded-xl hover:bg-surface-container transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-label-sm font-bold text-on-primary uppercase">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-label-sm font-semibold text-on-surface">{user?.name || role}</p>
              <p className="text-body-sm text-on-surface-variant capitalize">{role}</p>
            </div>
            <ChevronDown size={14} className={`text-on-surface-variant transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-sm w-52 bg-white border border-surface-container-high rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-lg py-md border-b border-surface-container-high">
                <p className="text-label-md font-semibold text-on-surface">{user?.name || role}</p>
                <p className="text-body-sm text-on-surface-variant capitalize">{role}</p>
              </div>
              <div className="py-xs">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate(role === 'lawyer' ? '/lawyer/profile' : role === 'user' ? '/user/profile' : '/admin');
                  }}
                  className="w-full flex items-center gap-md px-lg py-sm text-body-md text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <Settings size={16} className="text-on-surface-variant" /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-md px-lg py-sm text-body-md text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click-away overlay */}
      {(showMenu || showNotif) && (
        <div className="fixed inset-0 z-30" onClick={closeAll} />
      )}
    </nav>
  );
};

export default Navbar;
