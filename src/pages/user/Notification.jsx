import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Clock, Briefcase, MessageSquare,
  CreditCard, User, X, Trash2
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

/* ── icon & colour helpers (kept outside state) ────────────── */
const typeIcon = (type) => {
  switch (type) {
    case 'lawyer':  return <User          size={18} className="text-primary" />;
    case 'case':    return <Briefcase     size={18} className="text-blue-600" />;
    case 'message': return <MessageSquare size={18} className="text-green-600" />;
    case 'payment': return <CreditCard    size={18} className="text-purple-600" />;
    case 'hearing': return <Clock         size={18} className="text-yellow-600" />;
    default:        return <Bell          size={18} className="text-on-surface-variant" />;
  }
};

const typeBg = {
  lawyer:  'bg-primary/10',
  case:    'bg-blue-50',
  message: 'bg-green-50',
  payment: 'bg-purple-50',
  hearing: 'bg-yellow-50',
};

const typeLabel = {
  lawyer:  'Assignment',
  case:    'Case Update',
  message: 'Message',
  payment: 'Payment',
  hearing: 'Hearing',
};

/* ── component ──────────────────────────────────────────────── */
const Notification = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  /* apply filters */
  let items = notifications;
  if (filter === 'Unread') items = items.filter((n) => !n.read);
  if (filter === 'Read')   items = items.filter((n) => n.read);
  if (typeFilter !== 'All') items = items.filter((n) => n.type === typeFilter);

  /* group by date */
  const grouped = items.reduce((acc, n) => {
    acc[n.date] = acc[n.date] ? [...acc[n.date], n] : [n];
    return acc;
  }, {});

  const handleClick = (n) => {
    markRead(n.id);
    if (n.link) navigate(n.link);
  };

  const types = ['All', ...Array.from(new Set(notifications.map((n) => n.type)))];

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-xl flex-wrap gap-md">
        <div>
          <h1 className="text-headline-lg text-on-surface flex items-center gap-md">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-on-primary text-label-sm w-7 h-7 rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Stay updated on your cases, lawyer assignments and payments.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-xs text-body-sm text-primary border border-primary/30 hover:bg-primary/5 px-md py-sm rounded-lg transition-colors"
          >
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {/* ── Read / Unread filter ── */}
      <div className="flex gap-sm mb-md flex-wrap">
        {['All', 'Unread', 'Read'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-lg py-sm rounded-lg text-label-sm font-semibold transition-colors
              ${filter === f
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-white border border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span className="ml-xs bg-on-primary/20 text-on-primary px-xs rounded-full text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Type filter ── */}
      <div className="flex gap-sm mb-xl flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-md py-xs rounded-full text-label-sm capitalize transition-colors
              ${typeFilter === t
                ? 'bg-surface-container-high text-on-surface font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {t === 'All' ? 'All types' : typeLabel[t] || t}
          </button>
        ))}
      </div>

      {/* ── Notification list ── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white border border-surface-container-high rounded-2xl py-3xl px-xl text-center shadow-card">
          <Bell size={48} className="mx-auto text-on-surface-variant mb-lg opacity-20" />
          <p className="text-headline-sm text-on-surface-variant">No notifications</p>
          <p className="text-body-md text-on-surface-variant mt-sm opacity-60">
            {filter === 'Unread' ? "You're all caught up!" : 'Nothing here yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-xl">
          {Object.entries(grouped).map(([date, notifs]) => (
            <div key={date}>
              <p className="text-label-md text-on-surface-variant mb-md uppercase tracking-wider text-xs">{date}</p>
              <div className="space-y-sm">
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`group relative flex items-start gap-lg p-lg rounded-2xl border cursor-pointer transition-all duration-200
                      ${!n.read
                        ? 'bg-white border-primary/25 shadow-card hover:shadow-md hover:border-primary/40'
                        : 'bg-white border-surface-container-high hover:bg-surface-container-low opacity-75 hover:opacity-100'}`}
                  >
                    {/* coloured icon */}
                    <div className={`w-11 h-11 rounded-full ${typeBg[n.type] || 'bg-surface-container'} flex items-center justify-center shrink-0`}>
                      {typeIcon(n.type)}
                    </div>

                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-md">
                        <h4 className={`text-body-md leading-snug ${!n.read ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                          {n.title}
                        </h4>
                        <div className="flex items-center gap-sm shrink-0">
                          {!n.read && (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                          <span className="text-body-sm text-on-surface-variant whitespace-nowrap">
                            {n.time}
                          </span>
                        </div>
                      </div>

                      <p className="text-body-sm text-on-surface-variant mt-xs leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-md mt-sm">
                        <span className={`text-label-sm px-sm py-xs rounded-full ${typeBg[n.type] || 'bg-surface-container'} text-on-surface-variant capitalize`}>
                          {typeLabel[n.type] || n.type}
                        </span>
                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                            className="text-label-sm text-primary hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                        {n.link && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(n.id); navigate(n.link); }}
                            className="text-label-sm text-primary hover:underline"
                          >
                            View →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* dismiss × */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="opacity-0 group-hover:opacity-100 absolute top-md right-md p-xs rounded-lg text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Dismiss"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;
