import React, { useState } from 'react';
import {
  Bell, CheckCheck, Clock, User, Briefcase,
  Calendar, MessageSquare, CreditCard, Star, X
} from 'lucide-react';

/* ── icon / colour helpers (no JSX in state) ───────────────── */
const typeIcon = (type) => {
  switch (type) {
    case 'case':    return <Briefcase     size={18} className="text-primary" />;
    case 'message': return <MessageSquare size={18} className="text-green-600" />;
    case 'hearing': return <Calendar      size={18} className="text-blue-600" />;
    case 'payment': return <CreditCard    size={18} className="text-purple-600" />;
    case 'review':  return <Star          size={18} className="text-yellow-500" />;
    default:        return <Bell          size={18} className="text-on-surface-variant" />;
  }
};

const typeBg = {
  case:    'bg-primary/10',
  message: 'bg-green-50',
  hearing: 'bg-blue-50',
  payment: 'bg-purple-50',
  review:  'bg-yellow-50',
};

const typeLabel = {
  case:    'Case',
  message: 'Message',
  hearing: 'Hearing',
  payment: 'Payment',
  review:  'Review',
};

import { getNotifications, markNotificationRead, markAllNotificationsRead, dismissNotification } from '../../services/notification.service';
import { useNavigate } from 'react-router-dom';

/* ── component ──────────────────────────────────────────────── */
const LawyerNotifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications();
      if (res.success) {
        setItems(res.data.map(n => ({
          ...n,
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(n.createdAt).toLocaleDateString('en-GB')
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifs();
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const dismiss = async (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await dismissNotification(id);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered =
    filter === 'Unread' ? items.filter((n) => !n.read)
    : filter === 'Read'  ? items.filter((n) => n.read)
    : items;

  const grouped = filtered.reduce((acc, n) => {
    acc[n.date] = acc[n.date] ? [...acc[n.date], n] : [n];
    return acc;
  }, {});

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-xl flex-wrap gap-md">
        <div>
          <h1 className="text-headline-lg text-on-surface flex items-center gap-md">
            Notifications
            {unread > 0 && (
              <span className="bg-primary text-on-primary text-label-sm w-7 h-7 rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Stay on top of case assignments, client messages and hearings.
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-xs text-body-sm text-primary border border-primary/30 hover:bg-primary/5 px-md py-sm rounded-lg transition-colors"
          >
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-sm mb-xl flex-wrap">
        {['All', 'Unread', 'Read'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-lg py-sm rounded-lg text-label-sm font-semibold transition-colors
              ${filter === f
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-white border border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            {f}{f === 'Unread' && unread > 0 ? ` (${unread})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white border border-surface-container-high rounded-2xl py-3xl px-xl text-center shadow-card">
          <Bell size={48} className="mx-auto text-on-surface-variant mb-lg opacity-20" />
          <p className="text-headline-sm text-on-surface-variant">No notifications</p>
          <p className="text-body-sm text-on-surface-variant mt-sm opacity-60">
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
                    onClick={() => markRead(n.id)}
                    className={`group relative flex items-start gap-lg p-lg rounded-2xl border cursor-pointer transition-all duration-200
                      ${!n.read
                        ? 'bg-white border-primary/25 shadow-card hover:shadow-md'
                        : 'bg-white border-surface-container-high opacity-75 hover:opacity-100 hover:bg-surface-container-low'}`}
                  >
                    <div className={`w-11 h-11 rounded-full ${typeBg[n.type] || 'bg-surface-container'} flex items-center justify-center shrink-0`}>
                      {typeIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-md">
                        <h4 className={`text-body-md leading-snug ${!n.read ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                          {n.title}
                        </h4>
                        <div className="flex items-center gap-sm shrink-0">
                          {!n.read && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                          <span className="text-body-sm text-on-surface-variant whitespace-nowrap">{n.time}</span>
                        </div>
                      </div>

                      <p className="text-body-sm text-on-surface-variant mt-xs leading-relaxed">{n.message}</p>

                      <div className="flex items-center gap-md mt-sm">
                        <span className={`text-label-sm px-sm py-xs rounded-full ${typeBg[n.type]} text-on-surface-variant capitalize`}>
                          {typeLabel[n.type] || n.type}
                        </span>
                        {n.type === 'message' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(n.link || '/lawyer/assigned-complaints'); }}
                            className="text-label-sm text-green-600 font-semibold hover:underline"
                          >
                            Reply to Message
                          </button>
                        )}
                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                            className="text-label-sm text-primary hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* dismiss */}
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

export default LawyerNotifications;
