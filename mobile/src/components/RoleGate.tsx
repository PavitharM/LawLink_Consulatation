import React from 'react';
import { Redirect, Stack } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { homeForRole, Role, useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';

/** Equivalent of the web ProtectedRoute: bounce unauthenticated / wrong-role users. */
export function RoleStack({ allowed }: { allowed: Role }) {
  const { role } = useAuth();
  if (!role) return <Redirect href="/login" />;
  if (role !== allowed) return <Redirect href={homeForRole(role)} />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }} />;
}

export const tabScreenOptions = {
  headerShown: false,
  // White tab bar — black active, grey inactive, gold badges
  tabBarActiveTintColor: colors.onWhite,
  tabBarInactiveTintColor: '#9A9A9A',
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopColor: colors.whiteBorder,
    borderTopWidth: 0.5,
  },
  tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
  tabBarBadgeStyle: { backgroundColor: colors.gold, color: colors.onGold, fontFamily: fonts.bold, fontSize: 10 },
  sceneStyle: { backgroundColor: colors.bg },
};

export const tabIcon = (name: React.ComponentProps<typeof Feather>['name']) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Feather name={name} size={size - 2} color={color as string} />;
  };
