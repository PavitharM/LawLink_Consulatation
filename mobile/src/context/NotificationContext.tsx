/**
 * Port of frontend/src/contexts/NotificationContext.jsx — shared store used by
 * the tab-bar badge and the Notifications screens.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  dismissNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/services';
import { useAuth } from './AuthContext';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type?: string | null;
  createdAt: string;
  time: string;
  date: string;
  link: string | null;
};

type Ctx = {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  fetchNotifications: () => Promise<void>;
};

const NotificationContext = createContext<Ctx | null>(null);

const linkFor = (type?: string | null) =>
  type === 'case' || type === 'lawyer' ? '/user/complaints' : type === 'message' ? '/user/consultation' : null;

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { role } = useAuth();
  const [store, setNotifications] = useState<AppNotification[]>([]);
  // Signed out → nothing to show (derived instead of clearing state in an effect)
  const notifications = role ? store : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!role) return;
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(
          res.data.map((n: any) => {
            const d = new Date(n.createdAt);
            return {
              ...n,
              time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: d.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
              link: role === 'user' ? linkFor(n.type) : null,
            };
          })
        );
      }
    } catch (err) {
      console.warn('Failed to fetch notifications', err);
    }
  }, [role]);

  // Poll every 30s while signed in (first fetch fires immediately).
  useEffect(() => {
    if (!role) return;
    const first = setTimeout(fetchNotifications, 0);
    const t = setInterval(fetchNotifications, 30000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [fetchNotifications, role]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    markNotificationRead(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllNotificationsRead().catch(() => {});
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    dismissNotification(id).catch(() => {});
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, dismiss, fetchNotifications }}
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
