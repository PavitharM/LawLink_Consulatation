import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Geist_300Light,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { loading } = useAuth();
  const [fontsLoaded] = useFonts({ Geist_300Light, Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold });
  const ready = fontsLoaded && !loading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
      <AuthProvider>
        <NotificationProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
