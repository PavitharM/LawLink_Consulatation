import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAdminStats } from '@/api/services';
import { Banner, Button, Card, Empty, IconName, Input, PageHeader, Screen, SectionTitle, ToggleRow } from '@/components/ui';
import { colors, space, Tone, toneColors, type as t } from '@/theme';

type Key = keyof typeof initial;
const initial = {
  newUserRegistered: true, newLawyerRegistered: true, lawyerPendingApproval: true, newComplaintFiled: true,
  complaintUnassigned: true, complaintResolved: false, paymentReceived: true, paymentFailed: true,
  dailyDigest: true, weeklyReport: false, monthlyReport: true,
  systemAlerts: true, securityAlerts: true, maintenanceNotices: false,
  browserPush: false, smsAlerts: true,
  lawyerCaseUpdate: true, lawyerLogin: false, lawyerRatingReceived: true,
  userLogin: false, userProfileUpdate: false, userDocumentUploaded: true,
};

const SECTIONS: { icon: IconName; title: string; subtitle: string; bulk: boolean; rows: { key: Key; label: string; desc: string; badge?: string }[] }[] = [
  { icon: 'bell', title: 'Platform Event Preferences', subtitle: 'Choose which platform events trigger admin notifications', bulk: true, rows: [
    { key: 'newUserRegistered', label: 'New User Registered', desc: 'When a new user creates an account' },
    { key: 'newLawyerRegistered', label: 'New Lawyer Registered', desc: 'When a lawyer submits their registration' },
    { key: 'lawyerPendingApproval', label: 'Lawyer Awaiting Approval', desc: 'When a lawyer registration is pending your review', badge: 'Important' },
    { key: 'newComplaintFiled', label: 'New Complaint Filed', desc: 'When a user submits a new legal complaint' },
    { key: 'complaintUnassigned', label: 'Unassigned Complaint Alert', desc: 'When a complaint remains unassigned for more than 24 hours', badge: 'Urgent' },
    { key: 'complaintResolved', label: 'Complaint Resolved', desc: 'When a lawyer marks a case as resolved' },
    { key: 'paymentReceived', label: 'Payment Received', desc: 'Confirmation when a user completes a package payment' },
    { key: 'paymentFailed', label: 'Payment Failed', desc: 'When a payment attempt fails or is declined' },
  ] },
  { icon: 'mail', title: 'Email Digests & Reports', subtitle: 'Scheduled email summaries delivered to your admin inbox', bulk: true, rows: [
    { key: 'dailyDigest', label: 'Daily Activity Digest', desc: 'Summary of all platform activity from the previous day — sent at 7 AM' },
    { key: 'weeklyReport', label: 'Weekly Performance Report', desc: 'Case stats, revenue, and lawyer activity for the past 7 days' },
    { key: 'monthlyReport', label: 'Monthly Analytics Report', desc: 'Full platform analytics including growth metrics — sent on the 1st' },
  ] },
  { icon: 'briefcase', title: 'Lawyer Activity', subtitle: 'Notifications about lawyers on the platform', bulk: true, rows: [
    { key: 'lawyerCaseUpdate', label: 'Lawyer Updates Case Status', desc: 'When a lawyer changes the status of an assigned case' },
    { key: 'lawyerLogin', label: 'Lawyer Login Activity', desc: 'When a lawyer logs in to their account (security monitoring)' },
    { key: 'lawyerRatingReceived', label: 'New Lawyer Rating / Review', desc: 'When a client rates or reviews an assigned lawyer' },
  ] },
  { icon: 'users', title: 'User Activity', subtitle: 'Track registered user actions across the platform', bulk: true, rows: [
    { key: 'userLogin', label: 'User Login Activity', desc: 'When a registered user logs into the platform' },
    { key: 'userProfileUpdate', label: 'User Profile Updated', desc: 'When a user makes changes to their profile information' },
    { key: 'userDocumentUploaded', label: 'Document Uploaded by User', desc: 'When a user uploads a document to an existing case' },
  ] },
  { icon: 'shield', title: 'System & Security', subtitle: 'Critical infrastructure and security alerts', bulk: true, rows: [
    { key: 'systemAlerts', label: 'System Health Alerts', desc: 'Errors, downtime, or performance issues detected', badge: 'Critical' },
    { key: 'securityAlerts', label: 'Security Alerts', desc: 'Suspicious login attempts or access policy violations', badge: 'Critical' },
    { key: 'maintenanceNotices', label: 'Maintenance Notices', desc: 'Scheduled maintenance windows and system update notifications' },
  ] },
  { icon: 'globe', title: 'Delivery Channels', subtitle: 'Choose how to receive your admin notifications', bulk: false, rows: [
    { key: 'browserPush', label: 'Push Notifications', desc: 'Real-time notifications on this device (requires permission)' },
    { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Critical alerts sent to the registered admin phone number' },
  ] },
];

export default function AdminNotificationSettings() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [settings, setSettings] = useState(initial);
  const [email, setEmail] = useState('admin@lawlink.in');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAdminStats()
      .then((r) => r.success && setStats(r.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const set = (k: Key, v: boolean) => setSettings((p) => ({ ...p, [k]: v }));
  const allOn = (keys: Key[]) => keys.every((k) => settings[k]);
  const setAll = (keys: Key[], v: boolean) => setSettings((p) => ({ ...p, ...Object.fromEntries(keys.map((k) => [k, v])) }));

  const live: { tone: Tone; icon: IconName; text: string; action: string; link: string; time: string }[] = [];
  if (stats) {
    if (stats.unassignedComplaints > 0)
      live.push({ tone: 'danger', icon: 'alert-triangle', text: `${stats.unassignedComplaints} complaint(s) are unassigned and waiting for a lawyer.`, action: 'Assign Now', link: '/admin/complaints', time: 'Right now' });
    if (stats.openComplaints > 0)
      live.push({ tone: 'warning', icon: 'bell', text: `${stats.openComplaints} open complaint(s) need review or assignment.`, action: 'View Complaints', link: '/admin/complaints', time: 'Right now' });
    (stats.recentUsers || []).forEach((u: any) =>
      live.push({
        tone: 'gold', icon: 'user-plus', text: `${u.name} registered as a ${u.role === 'LAWYER' ? 'Lawyer' : 'Client'}.`,
        action: u.role === 'LAWYER' ? 'View Lawyers' : 'View Users', link: u.role === 'LAWYER' ? '/admin/lawyers' : '/admin/users',
        time: new Date(u.createdAt).toLocaleDateString('en-IN'),
      })
    );
    (stats.recentComplaints || []).forEach((c: any) =>
      live.push({ tone: 'info', icon: 'file-text', text: `${c.client?.name || 'A user'} submitted: "${c.title}"`, action: 'View Complaints', link: '/admin/complaints', time: new Date(c.createdAt).toLocaleDateString('en-IN') })
    );
  }

  return (
    <Screen
      footer={
        <Button
          title="Save Notification Settings"
          icon="save"
          onPress={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }}
        />
      }
    >
      <PageHeader back index={live.length ? `${live.length} alerts` : 'Alerts'} eyebrow="Administration" title="Notifications" subtitle="Platform alerts and notification preferences." />
      {saved ? <Banner text="Notification preferences saved!" /> : null}

      <SectionTitle title="Platform Notifications" icon="bell" />
      {loadingStats ? (
        <ActivityIndicator color={colors.gold} style={{ marginVertical: space.xl }} />
      ) : live.length === 0 ? (
        <Card style={{ marginBottom: space.xl }}>
          <Empty icon="check-circle" title="All clear!" subtitle="No pending alerts right now." />
        </Card>
      ) : (
        <View style={{ marginBottom: space.xl }}>
          {live.map((n, i) => (
            <Card key={i} style={{ marginBottom: space.sm, flexDirection: 'row', gap: space.md }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: toneColors[n.tone].bg, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={n.icon} size={16} color={toneColors[n.tone].fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={t.bodySm}>
                  <Text style={{ color: colors.text }}>{n.text}</Text>
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.sm }}>
                  <Text style={t.meta}>🕒 {n.time}</Text>
                  <Text style={[t.label, { color: colors.gold, fontSize: 12 }]} onPress={() => router.push(n.link as any)}>
                    {n.action} →
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {SECTIONS.map((s) => {
        const keys = s.rows.map((r) => r.key);
        return (
          <Card key={s.title} style={{ marginBottom: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md, marginBottom: space.sm }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.goldDim, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={s.icon} size={17} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={t.h3}>{s.title}</Text>
                <Text style={t.bodySm}>{s.subtitle}</Text>
              </View>
            </View>
            {s.bulk ? (
              <Text style={[t.label, { color: colors.gold, alignSelf: 'flex-end', marginBottom: space.sm }]} onPress={() => setAll(keys, !allOn(keys))}>
                {allOn(keys) ? 'Disable All' : 'Enable All'}
              </Text>
            ) : null}
            {s.title === 'Email Digests & Reports' ? (
              <Input label="Admin Email Address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} hint="All digest emails will be sent to this address." />
            ) : null}
            {s.rows.map((r) => (
              <ToggleRow key={r.key} label={r.label} desc={r.desc} badge={r.badge} value={settings[r.key]} onChange={(v) => set(r.key, v)} />
            ))}
          </Card>
        );
      })}
    </Screen>
  );
}
