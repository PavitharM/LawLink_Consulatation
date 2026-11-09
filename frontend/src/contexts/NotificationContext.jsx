/**
 * NotificationContext.jsx
 * Centralised notification store shared between Navbar badge and Notification page.
 * Both components consume the same state — marking read in one immediately reflects in the other.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  dismissNotification 
} from '../services/notification.service';
import { relativeTime } from '../utils/time';

const NotificationContext = createContext(null);

/** Fallback destinations when the server did not attach a link. */
const fallbackLinks = {
  user:   { case: '/user/complaints', lawyer: '/user/complaints', payment: '/user/complaints', message: '/user/consultation' },
  lawyer: { case: '/lawyer/assigned-complaints', payment: '/lawyer/assigned-complaints', message: '/lawyer/assigned-complaints' },
  admin:  { case: '/admin/complaints', lawyer: '/admin/lawyers' },
};

const POLL_MS = 60_000;

export const NotificationProvider = ({ children, userId, role }) => {
  const [items, setNotifications] = useState([]);
  // Never surface a previous account's notifications after logout.
  const notifications = userId ? items : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      // Only fetch if a user is logged in
      if (!localStorage.getItem('lawlink_token')) return;
      const res = await getNotifications();
      if (res.success) {
        const mapped = res.data.map(n => {
          const d = new Date(n.createdAt);
          return {
            ...n,
            time: relativeTime(d),
            date: d.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
            link: n.link || fallbackLinks[role]?.[n.type] || null,
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [role]);

  // Refetch whenever the signed-in account changes; clear on logout.
  useEffect(() => {
    if (!userId) return undefined;
    fetchNotifications();
    const tick = () => { if (document.visibilityState === 'visible') fetchNotifications(); };
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [userId, fetchNotifications]);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  }, []);

  const dismiss = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await dismissNotification(id);
    } catch (err) {
      console.error('Failed to dismiss notification', err);
    }
  }, []);

  const addNotificationLocally = useCallback((notif) => {
    setNotifications((prev) => [{ time: 'Just now', ...notif, id: Date.now().toString(), read: false, createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, dismiss, fetchNotifications, addNotificationLocally }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
};
