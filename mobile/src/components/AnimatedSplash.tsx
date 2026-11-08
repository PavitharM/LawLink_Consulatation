import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

/**
 * Branded launch animation shown over the app after the native splash:
 * gold scale springs in with a white pulse ring → wordmark rises → gold rule
 * draws out → tagline fades in → the whole card lifts away to reveal the app.
 * It waits for `ready` (fonts + session restored) before exiting.
 */
export default function AnimatedSplash({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [icon] = useState(() => new Animated.Value(0));
  const [ring] = useState(() => new Animated.Value(0));
  const [word] = useState(() => new Animated.Value(0));
  const [rule] = useState(() => new Animated.Value(0));
  const [tag] = useState(() => new Animated.Value(0));
  const [exit] = useState(() => new Animated.Value(0));
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(icon, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 1, duration: 1100, delay: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(word, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(rule, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      Animated.timing(tag, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(450),
    ]).start(() => setIntroDone(true));
  }, [icon, ring, word, rule, tag]);

  useEffect(() => {
    if (!introDone || !ready) return;
    Animated.timing(exit, { toValue: 1, duration: 550, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(onDone);
  }, [introDone, ready, exit, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        {
          opacity: exit.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
          transform: [{ translateY: exit.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }) }],
        },
      ]}
    >
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          {/* white pulse ring */}
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ring.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.7, 0] }),
                transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.1] }) }],
              },
            ]}
          />
          <Animated.View
            style={{
              opacity: icon,
              transform: [
                { scale: icon.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
                { rotate: icon.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '0deg'] }) },
              ],
            }}
          >
            <MaterialCommunityIcons name="scale-balance" size={76} color={colors.gold} />
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            styles.word,
            { opacity: word, transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] },
          ]}
        >
          LawLink<Text style={{ color: colors.gold }}>.</Text>
        </Animated.Text>

        <Animated.View style={[styles.rule, { transform: [{ scaleX: rule }] }]} />

        <Animated.Text style={[styles.tag, { opacity: tag }]}>LEGAL HELP · RIGHT WHEN YOU NEED IT</Animated.Text>
      </View>

      <Animated.Text style={[styles.foot, { opacity: tag }]}>Sri Lanka · Est. 2026</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, zIndex: 100, elevation: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  ring: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 1.5, borderColor: colors.white },
  word: { fontFamily: fonts.light, fontSize: 46, letterSpacing: -1.6, color: colors.white },
  rule: { width: 120, height: 2, backgroundColor: colors.gold, marginTop: 18, borderRadius: 1 },
  tag: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.textMuted, marginTop: 16 },
  foot: { position: 'absolute', bottom: 48, alignSelf: 'center', fontFamily: fonts.regular, fontSize: 11, letterSpacing: 1, color: colors.textDim },
});
