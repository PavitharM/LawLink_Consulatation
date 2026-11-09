import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAdminStats, getNotifications, markNotificationRead } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import { Badge, Button, Card, IconName, Loader, PageHeader, Screen, SectionTitle, Stat, StatGrid } from '@/components/ui';
import { colors, space, Tone, type as t } from '@/theme';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, n] = await Promise.all([getAdminStats(), getNotifications().catch(() => ({ data: [] as any[] }) as any)]);
      if (s.success) setStats(s.data);
      if (n.data) setEmergencies(n.data.filter((x: any) => x.type === 'EMERGENCY' && !x.read));
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

  const unassigned = stats?.unassignedComplaints ?? 0;
  const open = stats?.openComplaints ?? 0;
  const activity = [
    ...(stats?.recentComplaints || []).map((c: any) => ({
      icon: '📋', user: c.client?.name || 'Unknown', action: `Submitted complaint: "${c.title}"`,
      time: new Date(c.createdAt).toLocaleDateString('en-IN'), link: '/admin/complaints',
    })),
    ...(stats?.recentUsers || []).map((u: any) => ({
      icon: u.role === 'LAWYER' ? '⚖️' : '👤', user: u.name, action: `Registered as ${u.role === 'LAWYER' ? 'a Lawyer' : 'a User'}`,
      time: new Date(u.createdAt).toLocaleDateString('en-IN'), link: u.role === 'LAWYER' ? '/admin/lawyers' : '/admin/users',
    })),
  ].slice(0, 8);

  const quick: { label: string; icon: IconName; to: string; badge: string; tone?: Tone }[] = [
    { label: 'Manage Clients', icon: 'users', to: '/admin/users', badge: String(stats?.totalUsers ?? '…') },
    { label: 'Manage Lawyers', icon: 'award', to: '/admin/lawyers', badge: String(stats?.totalLawyers ?? '…') },
    {
      label: 'Complaints', icon: 'briefcase', to: '/admin/complaints',
      badge: unassigned > 0 ? `${unassigned} unassigned` : `${stats?.totalComplaints ?? 0} total`, tone: unassigned > 0 ? 'danger' : undefined,
    },
    { label: 'Articles', icon: 'file-text', to: '/admin/articles', badge: String(stats?.totalArticles ?? '…') },
  ];

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader
        index="001"
        eyebrow={new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' } as any)}
        title="Admin Dashboard"
        subtitle={`Welcome, ${user?.name || 'Admin'} — LawLink management console.`}
      />

      {emergencies.map((em) => (
        <Card key={em.id} variant="danger" style={{ marginBottom: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="alert-triangle" size={16} color={colors.danger} />
            <Text style={[t.label, { color: colors.danger }]}>EMERGENCY ALERT</Text>
          </View>
          <Text style={[t.bodySm, { color: colors.text, marginVertical: space.sm }]}>{em.message}</Text>
          <Button
            title="Acknowledge"
            small
            variant="danger"
            style={{ alignSelf: 'flex-start' }}
            onPress={async () => {
              await markNotificationRead(em.id).catch(() => {});
              setEmergencies((p) => p.filter((e) => e.id !== em.id));
            }}
          />
        </Card>
      ))}

      <StatGrid>
        <Stat label="Registered Clients" value={stats?.totalUsers ?? '—'} icon="users" hint="Total user accounts" onPress={() => router.push('/admin/users')} />
        <Stat label="Registered Lawyers" value={stats?.totalLawyers ?? '—'} icon="award" tone="success" hint="Total lawyer accounts" onPress={() => router.push('/admin/lawyers')} />
        <Stat label="Open Complaints" value={stats?.openComplaints ?? '—'} icon="alert-triangle" tone="warning" hint={`${unassigned} unassigned`} onPress={() => router.push('/admin/complaints')} />
        <Stat label="Total Complaints" value={stats?.totalComplaints ?? '—'} icon="briefcase" tone="info" hint={`${stats?.resolvedComplaints ?? 0} resolved`} onPress={() => router.push('/admin/complaints')} />
      </StatGrid>

      <Card style={{ marginBottom: space.xl, flexDirection: 'row', flexWrap: 'wrap', rowGap: space.lg }}>
        {[
          { label: 'Cases In Review', value: stats?.inReviewComplaints ?? '—', color: colors.warning },
          { label: 'Cases Resolved', value: stats?.resolvedComplaints ?? '—', color: colors.success },
          { label: 'Unassigned Cases', value: stats?.unassignedComplaints ?? '—', color: colors.danger },
          { label: 'Articles Published', value: stats?.totalArticles ?? '—', color: colors.info },
        ].map((s) => (
          <View key={s.label} style={{ width: '50%' }}>
            <Text style={[t.h1, { color: s.color }]}>{s.value}</Text>
            <Text style={t.bodySm}>{s.label}</Text>
          </View>
        ))}
      </Card>

      <SectionTitle title="Alerts" icon="bell" />
      <View style={{ gap: space.sm, marginBottom: space.xl }}>
        {unassigned > 0 ? (
          <AlertCard tone="danger" title={`🔴 ${unassigned} Complaints Unassigned`} desc="Cases waiting for a lawyer to be assigned." action="Assign Now →" onPress={() => router.push('/admin/complaints')} />
        ) : (
          <AlertCard tone="success" title="All complaints assigned" desc="No unassigned cases right now." />
        )}
        {open > 0 ? (
          <AlertCard tone="warning" title={`⚠️ ${open} Open Complaints`} desc="These are awaiting review or assignment." action="Review Now →" onPress={() => router.push('/admin/complaints')} />
        ) : null}
        {unassigned === 0 && open === 0 ? <AlertCard tone="success" title="No alerts" desc="Platform is running smoothly." /> : null}
      </View>

      <SectionTitle title="Quick Manage" />
      <Card style={{ marginBottom: space.xl, paddingVertical: space.sm }}>
        {quick.map((q, i) => (
          <Pressable
            key={q.label}
            onPress={() => router.push(q.to as any)}
            style={[{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md }, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border }]}
          >
            <Feather name={q.icon} size={18} color={colors.gold} />
            <Text style={[t.label, { flex: 1 }]}>{q.label}</Text>
            <Badge label={q.badge} tone={q.tone || 'neutral'} />
            <Feather name="chevron-right" size={16} color={colors.textDim} />
          </Pressable>
        ))}
      </Card>

      <SectionTitle title="Recent Activity" action="View all complaints" onAction={() => router.push('/admin/complaints')} />
      <Card style={{ marginBottom: space.xl, paddingVertical: space.sm }}>
        {activity.length === 0 ? (
          <Text style={[t.bodySm, { paddingVertical: space.md }]}>No recent activity yet.</Text>
        ) : (
          activity.map((a, i) => (
            <Pressable
              key={i}
              onPress={() => router.push(a.link as any)}
              style={[{ flexDirection: 'row', gap: space.md, paddingVertical: space.md, alignItems: 'center' }, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border }]}
            >
              <Text style={{ fontSize: 18 }}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={t.bodySm}>
                  <Text style={{ color: colors.text }}>{a.user}</Text> — {a.action}
                </Text>
                <Text style={t.meta}>{a.time}</Text>
              </View>
              <Feather name="arrow-right" size={14} color={colors.textDim} />
            </Pressable>
          ))
        )}
      </Card>

      <Card variant="white" onPress={() => router.push('/admin/report')}>
        <Feather name="trending-up" size={28} color={colors.onGold} />
        <Text style={[t.h2, { color: colors.onGold, marginTop: space.md }]}>Reports</Text>
        <Text style={[t.bodySm, { color: colors.onWhiteMuted }]}>View full analytics and platform metrics.</Text>
        <Text style={[t.label, { color: colors.onGold, marginTop: space.md }]}>View Report →</Text>
      </Card>
    </Screen>
  );
}

function AlertCard({ tone, title, desc, action, onPress }: { tone: Tone; title: string; desc: string; action?: string; onPress?: () => void }) {
  return (
    <Card variant={tone === 'danger' ? 'danger' : 'default'} onPress={onPress}>
      <Text style={t.label}>{title}</Text>
      <Text style={[t.bodySm, { marginTop: 2 }]}>{desc}</Text>
      {action ? <Text style={[t.label, { color: colors.gold, marginTop: space.sm }]}>{action}</Text> : null}
    </Card>
  );
}
