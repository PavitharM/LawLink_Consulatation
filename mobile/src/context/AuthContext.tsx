import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { getMe, logout as logoutApi } from '../api/services';

export type Role = 'user' | 'lawyer' | 'admin';

type AuthState = {
  user: any | null;
  role: Role | null;
  loading: boolean;
  /** Same signature as the web app's handleAuthChange(newUser, newRole, token). */
  setAuth: (user: any | null, role: string | null, token?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const TOKEN_KEY = 'lawlink_token';
const ROLE_KEY = 'lawlink_role';

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const clear = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setRole(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(ROLE_KEY).catch(() => {});
  }, []);

  // Session bootstrap — mirrors fetchSession() in App.jsx
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clear();
    });
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) return;
        setAuthToken(token);
        const res = await getMe();
        if (res.success && res.data) {
          setUser(res.data);
          setRole(res.data.role.toLowerCase());
        } else {
          throw new Error('Invalid session');
        }
      } catch {
        await clear();
      } finally {
        setLoading(false);
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, [clear]);

  const setAuth = useCallback(
    async (newUser: any | null, newRole: string | null, token?: string | null) => {
      if (token) {
        setAuthToken(token);
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        if (newRole) await SecureStore.setItemAsync(ROLE_KEY, newRole.toLowerCase());
      } else if (!newUser) {
        await clear();
        return;
      }
      setUser(newUser);
      setRole(newRole ? (newRole.toLowerCase() as Role) : null);
    },
    [clear]
  );

  const logout = useCallback(async () => {
    logoutApi().catch(() => {});
    await clear();
  }, [clear]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();
      if (res.success) setUser(res.data);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, setAuth, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const homeForRole = (role: Role | null) =>
  role === 'admin' ? '/admin' : role === 'lawyer' ? '/lawyer' : role === 'user' ? '/user' : '/';
