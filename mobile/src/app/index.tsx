import React from 'react';
import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { homeForRole, useAuth } from '@/context/AuthContext';
import { Avatar, Button, Card, Logo, Meta } from '@/components/ui';
import { colors, fonts, radius, space, type as t } from '@/theme';

const features = [
  { icon: 'shield', title: 'Verified Lawyers', desc: 'Every lawyer on LawLink is Bar Council verified and background-checked for your safety.' },
  { icon: 'scale-balance', mci: true, title: 'Expert Legal Advice', desc: 'Get advice from specialists across Civil, Criminal, Family, Labour, and Corporate law.' },
  { icon: 'book-open', title: 'Legal Knowledge Hub', desc: 'Access free articles and guides written by top legal professionals across Sri Lanka.' },
  { icon: 'users', title: 'Trusted by Thousands', desc: 'Join over 50,000 users who have successfully resolved their legal matters with LawLink.' },
] as const;

const steps = [
  { step: '01', title: 'Register', desc: 'Create your free account in minutes.' },
  { step: '02', title: 'File a Complaint', desc: 'Describe your legal issue clearly.' },
  { step: '03', title: 'Choose a Package', desc: 'Select the plan that suits your needs.' },
  { step: '04', title: 'Get Legal Help', desc: 'A verified lawyer is assigned to your case.' },
];

const lawyers = [
  { name: 'Adv.Pravitharan', spec: 'Civil Law', rating: 4.8, cases: 48, city: 'Colombo' },
  { name: 'Adv. Nishal', spec: 'Family Law', rating: 4.9, cases: 67, city: 'Kandy' },
  { name: 'Adv. Thirushi', spec: 'Criminal Law', rating: 4.5, cases: 31, city: 'Galle' },
];

const testimonials = [
  { name: 'Kavindu Perera', location: 'Colombo', text: 'LawLink helped me resolve a property dispute that had been going on for 5 years. I found the right lawyer within days!', rating: 5 },
  { name: 'Ishani Silva', location: 'Kandy', text: 'The consultation process was seamless and affordable. Highly recommend to anyone facing a family law issue.', rating: 5 },
  { name: 'Sahantha Fernando', location: 'Galle', text: 'Professional, quick, and effective. My labour case was handled with great expertise.', rating: 4 },
];

const stats = [
  { value: '50,000+', label: 'Happy Users' },
  { value: '1,500+', label: 'Verified Lawyers' },
  { value: '98%', label: 'Success Rate' },
  { value: '30+', label: 'Legal Categories' },
];

export default function Home() {
  const { role } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (role) return <Redirect href={homeForRole(role)} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + space.lg }]}>
        <View style={styles.heroTop}>
          <View>
            <Meta style={{ color: colors.textMuted }}>Legal</Meta>
            <Meta style={{ color: colors.textMuted }}>Consultation</Meta>
          </View>
          <Meta style={{ color: colors.textMuted }}>Sri Lanka</Meta>
        </View>

        <Text style={styles.heroTitle}>
          Get Expert{'\n'}Legal Help,{'\n'}
          <Text style={{ color: colors.goldLight }}>Right When{'\n'}You Need It</Text>
        </Text>
        <Text style={[t.body, { color: colors.textMuted, marginTop: space.lg }]}>
          Connect with verified lawyers, file complaints, and resolve your legal matters — all in one secure, easy-to-use platform built for every Srilankan citizen.
        </Text>

        <View style={{ gap: space.md, marginTop: space.xl }}>
          <Button title="Get Started Free" iconRight="arrow-right" onPress={() => router.push('/register')} />
          <Button title="Login" variant="secondary" onPress={() => router.push('/login')} />
        </View>

        <View style={styles.heroFoot}>
          <Logo size={18} />
          <Meta>2026©LawLink</Meta>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {stats.map((s, i) => (
          <View key={i} style={[styles.statCell, i % 2 === 0 && { borderRightWidth: StyleSheet.hairlineWidth }, i < 2 && { borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={t.bodySm}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHead index="001" title="Why Choose LawLink?" desc="We combine technology and legal expertise to make justice accessible for everyone in Sri Lanka." />
        {features.map((f, i) => (
          <Card key={i} style={{ marginBottom: space.md, flexDirection: 'row', gap: space.lg }}>
            <View style={styles.featIcon}>
              {'mci' in f ? (
                <MaterialCommunityIcons name="scale-balance" size={22} color={colors.gold} />
              ) : (
                <Feather name={f.icon as any} size={20} color={colors.gold} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={t.h3}>{f.title}</Text>
              <Text style={[t.bodySm, { marginTop: 4 }]}>{f.desc}</Text>
            </View>
          </Card>
        ))}
      </View>

      {/* How it works — champagne panel */}
      <View style={[styles.section, styles.champagne]}>
        <Meta style={{ color: '#5A4A2A' }}>002 · How LawLink Works</Meta>
        <Text style={[t.h1, { color: colors.onGold, marginTop: space.sm, marginBottom: space.xl }]}>Get legal help in 4 simple steps</Text>
        {steps.map((s, i) => (
          <View key={i} style={[styles.stepRow, i === steps.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={styles.stepNum}>{s.step}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[t.h3, { color: colors.onGold }]}>{s.title}</Text>
              <Text style={[t.bodySm, { color: '#4A4033' }]}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHead index="003" title="Featured Lawyers" desc="Top-rated legal professionals ready to help you" />
        {lawyers.map((l, i) => (
          <Card key={i} style={{ marginBottom: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
              <Avatar name={l.name.replace('Adv.', '').trim()} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={t.h3}>{l.name}</Text>
                <Text style={t.bodySm}>{l.spec}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Feather name="map-pin" size={11} color={colors.textDim} />
                  <Text style={t.meta}>{l.city}</Text>
                </View>
              </View>
            </View>
            <View style={styles.lawyerFoot}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="star" size={14} color={colors.gold} />
                <Text style={t.label}>{l.rating}</Text>
                <Text style={t.bodySm}>/ 5.0</Text>
              </View>
              <Text style={t.bodySm}>{l.cases} cases</Text>
            </View>
          </Card>
        ))}
        <Button title="Find Your Lawyer" onPress={() => router.push('/register')} style={{ marginTop: space.sm }} />
      </View>

      <View style={styles.section}>
        <SectionHead index="004" title="What Our Users Say" />
        {testimonials.map((tm, i) => (
          <Card key={i} variant="outline" style={{ marginBottom: space.md }}>
            <View style={{ flexDirection: 'row', gap: 2, marginBottom: space.md }}>
              {Array.from({ length: tm.rating }).map((_, j) => (
                <Feather key={j} name="star" size={14} color={colors.gold} />
              ))}
            </View>
            <Text style={[t.body, { fontFamily: fonts.light, fontSize: 17, lineHeight: 25 }]}>“{tm.text}”</Text>
            <Text style={[t.label, { marginTop: space.lg }]}>{tm.name}</Text>
            <Text style={t.bodySm}>{tm.location}</Text>
          </Card>
        ))}
      </View>

      {/* CTA */}
      <View style={[styles.section, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
        <Text style={[t.h1, { marginBottom: space.md }]}>
          Ready to Get <Text style={{ color: colors.gold }}>Legal Help?</Text>
        </Text>
        <Text style={[t.bodySm, { marginBottom: space.xl }]}>
          Join thousands of Srilankans who've found justice through LawLink. Start for free today.
        </Text>
        <Button title="Create Free Account" variant="white" onPress={() => router.push('/register')} />
      </View>

      {/* Footer */}
      <View style={[styles.section, { paddingTop: space.lg }]}>
        <Logo size={18} />
        <Text style={[t.bodySm, { marginTop: space.sm }]}>Sri Lanka's most trusted platform for accessible legal services.</Text>
        <View style={{ marginTop: space.lg, gap: 4 }}>
          <Text style={t.bodySm}>help@lawlink.in</Text>
          <Text style={t.bodySm}>+91-80-4567-8901</Text>
          <Text style={t.bodySm}>colombo, Sri Lanka</Text>
        </View>
        <Text style={[t.meta, { marginTop: space.xl }]}>© 2026 LawLink. All rights reserved. Making justice accessible for every Sri Lankan.</Text>
      </View>
    </ScrollView>
  );
}

function SectionHead({ index, title, desc }: { index: string; title: string; desc?: string }) {
  return (
    <View style={{ marginBottom: space.xl }}>
      <Meta>{index}</Meta>
      <Text style={[t.h1, { marginTop: space.sm }]}>{title}</Text>
      {desc ? <Text style={[t.bodySm, { marginTop: space.sm }]}>{desc}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.xxxl },
  heroTitle: { fontFamily: fonts.light, fontSize: 48, lineHeight: 50, letterSpacing: -1.8, color: colors.text },
  heroFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.xxxl },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  statCell: { width: '50%', padding: space.lg, borderColor: colors.border },
  statValue: { fontFamily: fonts.light, fontSize: 28, letterSpacing: -0.8, color: colors.goldLight },
  section: { paddingHorizontal: space.lg, paddingVertical: space.xxl },
  featIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.goldDim, alignItems: 'center', justifyContent: 'center' },
  champagne: { backgroundColor: colors.goldLight, marginHorizontal: space.lg, borderRadius: radius.xl, marginTop: space.md },
  stepRow: {
    flexDirection: 'row',
    gap: space.lg,
    paddingVertical: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
  },
  stepNum: { fontFamily: fonts.light, fontSize: 30, color: colors.onGold, width: 44 },
  lawyerFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
