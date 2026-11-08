import React from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, PageHeader, Screen } from '@/components/ui';
import { colors, fonts, space, type as t } from '@/theme';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <PageHeader index="404" title="Page Not Found" />
      <Text style={{ fontFamily: fonts.light, fontSize: 120, letterSpacing: -6, color: colors.goldLight, lineHeight: 124 }}>404</Text>
      <Text style={[t.bodySm, { marginVertical: space.xl }]}>
        The page you're looking for doesn't exist, has been moved, or is temporarily unavailable. Don't worry — we'll help you get back on track.
      </Text>
      <View style={{ gap: space.md }}>
        <Button title="Go Home" icon="home" onPress={() => router.replace('/')} />
        <Button title="Login" icon="arrow-left" variant="secondary" onPress={() => router.replace('/login')} />
        <Button title="Register" icon="search" variant="secondary" onPress={() => router.replace('/register')} />
      </View>
      <Text style={[t.bodySm, { marginTop: space.xl }]}>
        If you believe this is a mistake, please contact us at <Text style={{ color: colors.gold }}>help@lawlink.lk</Text> or call{' '}
        <Text style={{ color: colors.gold }}>+94-11-4567-890</Text>.
      </Text>
    </Screen>
  );
}
