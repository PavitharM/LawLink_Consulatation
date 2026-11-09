import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getComplaints, getMe, triggerEmergencyAlert } from '@/api/services';
import { useNotifications } from '@/context/NotificationContext';
import { ComplaintRow } from '@/components/shared';
import { Banner, Button, Card, Empty, IconButton, IconName, InfoRow, Loader, PageHeader, Screen, SectionTitle, Sheet, Stat, StatGrid } from '@/components/ui';
import { colors, space, type as t } from '@/theme';

export default function UserDashboard() {
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [meRes, compRes] = await Promise.all([getMe(), getComplaints()]);
      if (meRes.success) setProfile(meRes.data);
      if (compRes.success) setComplaints(compRes.data);
      setError(null);
    } catch (err: any) {
      // Keep whatever we showed last; just tell the user it may be stale.
      setError(err?.message || 'Could not load your dashboard.');
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

  const retry = () => { setLoading(true); load(); };
  if (error && !profile) {
    return (
      <Screen>
        <Empty
          icon="wifi-off"
          title="Can't load your dashboard"
          subtitle={error}
          action={{ label: 'Try again', icon: 'refresh-cw', onPress: retry }}
        />
      </Screen>
    );
  }

  const firstName = profile?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const active = complaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const inReview = complaints.filter((c) => c.status === 'IN_REVIEW').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;

  const quick: { label: string; icon: IconName; to: string; primary?: boolean }[] = [
    { label: 'Submit New Complaint', icon: 'plus-circle', to: '/user/new-complaint', primary: true },
    { label: 'Find a Lawyer', icon: 'user', to: '/user/lawyers' },
    { label: 'My Complaints', icon: 'file-text', to: '/user/complaints' },
    { label: 'Notifications', icon: 'bell', to: '/user/notifications' },
  ];

  const sendEmergency = async () => {
    try {
      setSending(true);
      await triggerEmergencyAlert();
      setShowEmergency(false);
      Alert.alert('Emergency alert sent', 'The admin team has been alerted and will contact you shortly.');
    } catch (err: any) {
      Alert.alert(
        'Could not send alert',
        `${err?.message || 'Please try again.'}\n\nIf you are in immediate danger, call 119.`,
        [{ text: 'Call 119', onPress: () => Linking.openURL('tel:119') }, { text: 'OK', style: 'cancel' }]
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader
        index="001"
        eyebrow={greeting}
        title={`Welcome back,\n${firstName}`}
        subtitle="Here's an overview of your active cases and recent activity."
        right={<IconButton name="plus" label="New complaint" bg={colors.gold} color={colors.onGold} onPress={() => router.push('/user/new-complaint')} />}
      />

      {error ? <Banner tone="warning" icon="wifi-off" text="Showing saved data — pull down to refresh." /> : null}

      <StatGrid>
        <Stat label="Active Cases" value={active} icon="briefcase" hint="Currently open" onPress={() => router.push('/user/complaints')} />
        <Stat label="In Review" value={inReview} icon="clock" tone="warning" hint="With a lawyer" onPress={() => router.push('/user/complaints')} />
        <Stat label="Resolved" value={resolved} icon="check-circle" tone="success" hint="All time" onPress={() => router.push('/user/complaints')} />
        <Stat label="Unread" value={unreadCount} icon="bell" tone="info" hint="Notifications" onPress={() => router.push('/user/notifications')} />
      </StatGrid>

      <SectionTitle title="Recent Complaints" action="View all" onAction={() => router.push('/user/complaints')} />
      {complaints.length === 0 ? (
        <Card>
          <Empty
            icon="file-text"
            title="No complaints yet"
            subtitle="File a complaint and we'll match you with a verified lawyer."
            action={{ label: 'File your first complaint', icon: 'plus', onPress: () => router.push('/user/new-complaint') }}
          />
        </Card>
      ) : (
        complaints.slice(0, 3).map((c) => <ComplaintRow key={c.id} c={c} onPress={() => router.push(`/user/complaint/${c.id}`)} />)
      )}

      <SectionTitle title="Quick Actions" style={{ marginTop: space.xl }} />
      <View style={{ gap: space.sm }}>
        {quick.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => router.push(a.to as any)}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.lg,
                borderRadius: 14,
                backgroundColor: a.primary ? colors.gold : colors.surface,
                borderWidth: 1,
                borderColor: a.primary ? colors.gold : colors.border,
              },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Feather name={a.icon} size={18} color={a.primary ? colors.onGold : colors.gold} />
            <Text style={[t.label, { flex: 1 }, a.primary && { color: colors.onGold }]}>{a.label}</Text>
            <Feather name="chevron-right" size={16} color={a.primary ? colors.onGold : colors.textDim} />
          </Pressable>
        ))}
      </View>

      <Card variant="danger" style={{ marginTop: space.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Feather name="alert-triangle" size={18} color={colors.danger} />
          <Text style={[t.h3, { color: colors.danger }]}>Emergency Help</Text>
        </View>
        <Text style={[t.bodySm, { marginTop: space.sm, marginBottom: space.lg }]}>
          Need immediate legal or police assistance? Contact authorities or alert our admin instantly.
        </Text>
        <View style={{ gap: space.sm }}>
          <Button title="Call Police (119)" icon="phone" variant="white" onPress={() => Linking.openURL('tel:119')} />
          <Button title="Alert Admin Now" icon="bell" variant="danger" onPress={() => setShowEmergency(true)} />
        </View>
      </Card>

      <Sheet
        visible={showEmergency}
        onClose={() => setShowEmergency(false)}
        title="Emergency Alert"
        footer={
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => setShowEmergency(false)} />
            <Button title="Confirm & Send" variant="danger" style={{ flex: 1 }} loading={sending} onPress={sendEmergency} />
          </View>
        }
      >
        <Text style={[t.bodySm, { marginBottom: space.lg }]}>
          The following profile details will be sent immediately to the LawLink Admin for urgent assistance.
        </Text>
        <InfoRow label="Name" value={profile?.name || 'N/A'} />
        <InfoRow label="Email" value={profile?.email || 'N/A'} />
        <InfoRow label="Phone" value={profile?.phone || 'N/A'} />
        <InfoRow label="City" value={profile?.city || 'N/A'} last />
      </Sheet>
    </Screen>
  );
}
