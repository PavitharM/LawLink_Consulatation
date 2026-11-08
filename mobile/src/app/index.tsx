import React, { useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { homeForRole, useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { colors, fonts, space, type as t } from '@/theme';

/** Get Started — logo on black, white action panel with Register / Login. */
export default function GetStarted() {
  const { role } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [logo] = useState(() => new Animated.Value(0));
  const [panel] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.stagger(180, [
      Animated.timing(logo, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(panel, { toValue: 1, friction: 9, tension: 45, useNativeDriver: true }),
    ]).start();
  }, [logo, panel]);

  if (role) return <Redirect href={homeForRole(role)} />;

  return (
    <View style={styles.root}>
      {/* Brand */}
      <View style={[styles.top, { paddingTop: insets.top + space.lg }]}>
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.meta}>Legal</Text>
            <Text style={styles.meta}>Consultation</Text>
          </View>
          <Text style={styles.meta}>Sri Lanka</Text>
        </View>

        <Animated.View
          style={[
            styles.brand,
            { opacity: logo, transform: [{ translateY: logo.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] },
          ]}
        >
          <View style={styles.mark}>
            <MaterialCommunityIcons name="scale-balance" size={54} color={colors.gold} />
          </View>
          <Text style={styles.word}>
            LawLink<Text style={{ color: colors.gold }}>.</Text>
          </Text>
          <View style={styles.rule} />
          <Text style={styles.tagline}>Verified lawyers · Secure cases · One app</Text>
        </Animated.View>
      </View>

      {/* White action panel */}
      <Animated.View
        style={[
          styles.panel,
          { paddingBottom: insets.bottom + space.xl },
          {
            opacity: panel,
            transform: [{ translateY: panel.interpolate({ inputRange: [0, 1], outputRange: [320, 0] }) }],
          },
        ]}
      >
        <Text style={styles.panelMeta}>001 — Get Started</Text>
        <Text style={styles.panelTitle}>Legal help,{'\n'}right when you need it.</Text>
        <View style={{ gap: space.md, marginTop: space.xl }}>
          <Button title="Create Account" variant="dark" iconRight="arrow-right" onPress={() => router.push('/register')} />
          <Button title="Login" variant="outlineDark" onPress={() => router.push('/login')} />
        </View>
        <Text style={styles.legal}>
          By continuing you agree to our <Text style={{ color: colors.onWhite }}>Terms</Text> &{' '}
          <Text style={{ color: colors.onWhite }}>Privacy Policy</Text>.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { flex: 1, paddingHorizontal: space.lg },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { ...t.meta, color: colors.textMuted, textTransform: 'uppercase' },
  brand: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: space.xl },
  mark: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xl,
  },
  word: { fontFamily: fonts.light, fontSize: 48, letterSpacing: -1.8, color: colors.white },
  rule: { width: 56, height: 2, borderRadius: 1, backgroundColor: colors.gold, marginTop: space.lg },
  tagline: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: space.lg, letterSpacing: 0.3 },
  panel: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
  },
  panelMeta: { ...t.meta, color: colors.onWhiteMuted, textTransform: 'uppercase' },
  panelTitle: { fontFamily: fonts.light, fontSize: 30, lineHeight: 35, letterSpacing: -0.9, color: colors.onWhite, marginTop: space.sm },
  legal: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.onWhiteMuted, textAlign: 'center', marginTop: space.xl },
});
