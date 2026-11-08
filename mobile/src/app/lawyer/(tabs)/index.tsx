import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getComplaints } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import { Badge, Card, Empty, IconName, Loader, Meta, MonoTag, PageHeader, Screen, SectionTitle, Stat, StatGrid } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { fmtDateGB, PRIORITY_TONE, shortId } from '@/utils/format';

export default function LawyerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) setAll(res.data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) return <Loader />;

  const active = all.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').slice(0, 5);
  const resolved = all.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = all
    .filter((c) => c.hearingDate && new Date(c.hearingDate).setHours(0, 0, 0, 0) >= today.getTime())
    .sort((a, b) => +new Date(a.hearingDate) - +new Date(b.hearingDate))
    .slice(0, 3);
  const recent = [...all].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5);
  const earnings = resolved * (user?.lawyerProfile?.consultationFee || 1500);

  const quick: { label: string; icon: IconName; to: string }[] = [
    { label: 'Assigned Cases', icon: 'briefcase', to: '/lawyer/cases' },
    { label: 'Notifications', icon: 'bell', to: '/lawyer/notifications' },
    { label: 'Package Rates', icon: 'trending-up', to: '/lawyer/packages' },
    { label: 'My Profile', icon: 'users', to: '/lawyer/profile' },
  ];

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader index="001" eyebrow="Lawyer Portal" title={`Welcome,\n${user?.name || 'Advocate'}`} subtitle="Here's your current caseload and upcoming schedule." />

      <StatGrid>
        <Stat label="Active Cases" value={active.length} icon="briefcase" />
        <Stat label="Resolved Cases" value={resolved} icon="check-circle" tone="success" />
        <Stat label="Avg Rating" value="4.8 ★" icon="star" tone="warning" />
        <Stat label="Total Earnings" value={`₹${earnings.toLocaleString()}`} icon="trending-up" tone="info" />
      </StatGrid>

      {/* Upcoming hearings — white panel */}
      <Card variant="white" style={{ marginBottom: space.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.md }}>
          <Feather name="calendar" size={18} color={colors.onGold} />
          <Text style={[t.h3, { color: colors.onGold }]}>Upcoming Court Hearings</Text>
        </View>
        {upcoming.length ? (
          upcoming.map((h, i) => (
            <View key={h.id} style={[{ paddingVertical: space.sm }, i > 0 && { borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.15)' }]}>
              <Text style={[t.h2, { color: colors.onGold }]}>{fmtDateGB(h.hearingDate)}</Text>
              <Text style={[t.bodySm, { color: colors.onWhiteMuted }]}>
                {new Date(h.hearingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {h.location || 'TBD'}
              </Text>
              <Text style={[t.bodySm, { color: colors.onWhiteMuted }]}>
                {shortId(h.id)} — {h.client?.name || 'Unknown'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[t.bodySm, { color: colors.onWhiteMuted }]}>No upcoming hearings scheduled.</Text>
        )}
      </Card>

      <SectionTitle title="Active Cases" action="All cases" onAction={() => router.push('/lawyer/cases')} />
      {active.length === 0 ? (
        <Card>
          <Empty icon="briefcase" title="No active cases assigned to you." />
        </Card>
      ) : (
        active.map((c) => (
          <Card key={c.id} onPress={() => router.push(`/lawyer/complaint/${c.id}`)} style={{ marginBottom: space.md }}>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: space.sm }}>
              <MonoTag label={shortId(c.id)} />
              <Badge label={c.status === 'OPEN' ? 'NEW REQUEST' : c.status} tone={c.status === 'OPEN' ? 'gold' : 'warning'} />
              <Badge label={c.priority} tone={PRIORITY_TONE[c.priority]} />
            </View>
            <Text style={t.h3}>{c.title}</Text>
            <Text style={[t.bodySm, { marginTop: 4 }]}>
              👤 {c.client?.name || 'Unknown'} · 📂 {c.category} · 📅 {c.hearingDate ? fmtDateGB(c.hearingDate) : 'TBD'}
            </Text>
          </Card>
        ))
      )}

      <SectionTitle title="Quick Actions" style={{ marginTop: space.xl }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginBottom: space.xl }}>
        {quick.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => router.push(a.to as any)}
            style={({ pressed }) => [
              { width: '47.5%', padding: space.lg, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: space.md },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name={a.icon} size={20} color={colors.gold} />
            <Text style={t.label}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="Recent Activity" />
      <Card>
        {recent.length ? (
          recent.map((c, i) => (
            <Pressable key={c.id} onPress={() => router.push(`/lawyer/complaint/${c.id}`)} style={[{ flexDirection: 'row', gap: space.md, paddingVertical: space.md }, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
              <Text>📋</Text>
              <View style={{ flex: 1 }}>
                <Text style={t.bodySm}>
                  Case <Text style={{ color: colors.text }}>{shortId(c.id)}</Text> was updated to <Text style={{ color: colors.gold }}>{c.status}</Text>
                </Text>
                <Meta>{fmtDateGB(c.updatedAt)}</Meta>
              </View>
            </Pressable>
          ))
        ) : (
          <Text style={t.bodySm}>No recent case activity.</Text>
        )}
      </Card>
    </Screen>
  );
}
