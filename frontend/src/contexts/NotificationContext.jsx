/**
 * NotificationContext.jsx
 * Centralised notification store shared between Navbar badge and Notification page.
 * Both components consume the same state — marking read in one immediately reflects in the other.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  dismissNotification 
} from '../services/notification.service';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

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
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: d.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
            link: n.type === 'case' || n.type === 'lawyer' ? '/user/complaints' : (n.type === 'message' ? '/user/consultation' : null)
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Optional: setup polling or websockets here for real-time updates
  }, [fetchNotifications]);

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
    setNotifications((prev) => [{...notif, id: Date.now().toString(), read: false, createdAt: new Date().toISOString()}, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, dismiss, fetchNotifications, addNotificationLocally }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
};
