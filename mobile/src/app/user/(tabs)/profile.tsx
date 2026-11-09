import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getMe, updateMe } from '@/api/services';
import { fileUrl } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import EditableField from '@/components/EditableField';
import { AvatarPicker, EditToggle, PasswordForm, ProfileTabs } from '@/components/shared';
import { Badge, Banner, Button, Card, InfoRow, Loader, Meta, PageHeader, Screen, SectionTitle, ToggleRow } from '@/components/ui';
import { colors, space, type as t } from '@/theme';

type Tab = 'profile' | 'security' | 'notif' | 'account';
const TABS = [
  { id: 'profile' as Tab, label: 'Personal Info', icon: 'user' as const },
  { id: 'security' as Tab, label: 'Security', icon: 'shield' as const },
  { id: 'notif' as Tab, label: 'Notifications', icon: 'bell' as const },
  { id: 'account' as Tab, label: 'Account', icon: 'settings' as const },
];

const empty = {
  name: '', email: '', phone: '', city: '', state: '', pincode: '', dob: '',
  gender: 'Prefer not to say', language: '', address: '', bio: '', avatarUrl: null as string | null,
};

export default function UserProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(empty);
  const [draft, setDraft] = useState(empty);
  const [notif, setNotif] = useState({
    caseUpdates: true, lawyerMessages: true, hearingReminders: true, paymentAlerts: true,
    newsAndTips: false, smsAlerts: true, emailDigest: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getMe();
        if (res.success) {
          const u = res.data;
          const cp = u.clientProfile || {};
          const p = {
            name: u.name || '', email: u.email || '', phone: u.phone || '', city: u.city || '',
            state: cp.state || '', pincode: cp.pincode || '', dob: cp.dob || '',
            gender: cp.gender || 'Prefer not to say', language: cp.preferredLanguage || '',
            address: cp.address || '', bio: cp.bio || '', avatarUrl: fileUrl(u.avatar),
          };
          setProfile(p);
          setDraft(p);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSave = async () => {
    try {
      const res = await updateMe({
        name: draft.name,
        phone: draft.phone,
        city: draft.city,
        clientProfile: {
          state: draft.state, pincode: draft.pincode, dob: draft.dob, gender: draft.gender,
          preferredLanguage: draft.language, address: draft.address, bio: draft.bio,
        },
      });
      if (res.success) {
        setProfile(draft);
        setEditing(false);
        flashSaved();
      }
    } catch (e: any) {
      Alert.alert('Could not save', e?.message || 'Please try again.');
    }
  };

  const doLogout = () => {
    logout();
    router.replace('/login');
  };

  if (loading) return <Loader />;

  const set = (k: keyof typeof empty) => (v: string) => setDraft((p) => ({ ...p, [k]: v }));
  const fieldProps = (k: keyof typeof empty) => ({ value: profile[k] as string, draftValue: draft[k] as string, editing, onChange: set(k) });

  return (
    <Screen>
      <PageHeader index="005" eyebrow="Settings" title="My Profile" subtitle="Manage your personal info, security and notification preferences." />

      {saved ? <Banner text="Profile updated successfully!" /> : null}

      {/* Identity */}
      <Card style={{ alignItems: 'center', marginBottom: space.lg, paddingVertical: space.xl }}>
        <AvatarPicker
          name={profile.name}
          url={profile.avatarUrl}
          onChange={(url) => {
            setProfile((p) => ({ ...p, avatarUrl: url }));
            setDraft((p) => ({ ...p, avatarUrl: url }));
          }}
        />
        <Text style={[t.h2, { marginTop: space.md }]}>{profile.name}</Text>
        <Badge label="Registered User" tone="gold" />
        {profile.city || profile.state ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.sm }}>
            <Feather name="map-pin" size={12} color={colors.textDim} />
            <Text style={t.bodySm}>{[profile.city, profile.state].filter(Boolean).join(', ')}</Text>
          </View>
        ) : null}
        {profile.bio ? <Text style={[t.bodySm, { fontStyle: 'italic', textAlign: 'center', marginTop: space.sm }]}>“{profile.bio}”</Text> : null}
      </Card>

      {/* Case summary — same static values as the web page */}
      <Card style={{ marginBottom: space.xl }}>
        <Meta style={{ marginBottom: space.sm }}>Case Summary</Meta>
        <InfoRow label="Cases Filed" value="3" />
        <InfoRow label="Active Cases" value="2" />
        <InfoRow label="Resolved" value="1" last />
      </Card>

      <ProfileTabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'profile' && (
        <>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle
              title="Personal Information"
              icon="user"
            />
            <View style={{ alignItems: 'flex-end', marginBottom: space.md }}>
              <EditToggle
                editing={editing}
                onEdit={() => {
                  setDraft(profile);
                  setEditing(true);
                }}
                onCancel={() => setEditing(false)}
                onSave={handleSave}
              />
            </View>
            <EditableField label="Full Name" {...fieldProps('name')} />
            <EditableField label="Date of Birth" date {...fieldProps('dob')} />
            <EditableField label="Gender" select={['Male', 'Female', 'Other', 'Prefer not to say']} {...fieldProps('gender')} />
            <EditableField label="Preferred Language" {...fieldProps('language')} />
            <EditableField label="City" {...fieldProps('city')} />
            <EditableField label="State" {...fieldProps('state')} />
            <EditableField label="PIN Code" keyboardType="number-pad" {...fieldProps('pincode')} />
            <EditableField label="Bio / About" multiline {...fieldProps('bio')} />
            <EditableField label="Full Address" multiline {...fieldProps('address')} />
          </Card>
          <Card>
            <SectionTitle title="Contact Information" icon="mail" />
            <EditableField label="Email Address" {...fieldProps('email')} disabled />
            <EditableField label="Phone Number" keyboardType="phone-pad" {...fieldProps('phone')} />
          </Card>
        </>
      )}

      {tab === 'security' && (
        <>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Change Password" icon="shield" />
            <PasswordForm />
          </Card>
          <Card>
            <SectionTitle title="Active Sessions" />
            {[
              { device: 'Chrome on Windows', location: 'Colombo, Sri Lanka', time: 'Now — current session', current: true },
              { device: 'Safari on iPhone', location: 'Colombo, Sri Lanka', time: '2 hours ago', current: false },
            ].map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, gap: space.md }}>
                <Feather name={s.current ? 'monitor' : 'smartphone'} size={18} color={colors.gold} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Text style={t.label}>{s.device}</Text>
                    {s.current ? <Badge label="Current" tone="success" /> : null}
                  </View>
                  <Text style={t.bodySm}>
                    {s.location} · {s.time}
                  </Text>
                </View>
                {!s.current ? <Button title="Revoke" icon="log-out" small variant="danger" /> : null}
              </View>
            ))}
          </Card>
        </>
      )}

      {tab === 'notif' && (
        <Card>
          <SectionTitle title="Notification Preferences" icon="bell" />
          <Meta style={{ marginTop: space.sm }}>In-App Notifications</Meta>
          {[
            { key: 'caseUpdates', label: 'Case Status Updates', desc: 'When your case status changes' },
            { key: 'lawyerMessages', label: 'Lawyer Messages', desc: 'New messages from your assigned lawyer' },
            { key: 'hearingReminders', label: 'Hearing Reminders', desc: 'Reminders before court hearings' },
            { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Payment confirmations and receipts' },
          ].map(({ key, label, desc }) => (
            <ToggleRow key={key} label={label} desc={desc} value={(notif as any)[key]} onChange={(v) => setNotif((p) => ({ ...p, [key]: v }))} />
          ))}
          <Meta style={{ marginTop: space.xl }}>External Channels</Meta>
          {[
            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Critical updates via SMS to your phone' },
            { key: 'emailDigest', label: 'Email Digest', desc: 'Weekly summary of all case activities' },
            { key: 'newsAndTips', label: 'News & Legal Tips', desc: 'Helpful legal articles and platform news' },
          ].map(({ key, label, desc }) => (
            <ToggleRow key={key} label={label} desc={desc} value={(notif as any)[key]} onChange={(v) => setNotif((p) => ({ ...p, [key]: v }))} />
          ))}
          <Button
            title="Save Preferences"
            icon="save"
            style={{ marginTop: space.xl }}
            onPress={() => {
              flashSaved();
              setTab('profile');
            }}
          />
        </Card>
      )}

      {tab === 'account' && (
        <>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Account Details" />
            <InfoRow label="Account Type" value="Registered User" />
            <InfoRow label="Member Since" value="January 12, 2024" />
            <InfoRow label="Account Status" value="Active" />
            <InfoRow label="User ID" value="USR-00847" last />
          </Card>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Your Data" />
            <Text style={[t.bodySm, { marginBottom: space.lg }]}>Download a copy of all your case data, documents and account information.</Text>
            <Button title="Export My Data" variant="secondary" />
          </Card>
          <Card variant="danger" style={{ marginBottom: space.lg }}>
            <SectionTitle title="Danger Zone" icon="alert-circle" />
            <Text style={[t.bodySm, { marginBottom: space.lg }]}>
              Once you delete your account, all your cases, documents and data will be permanently removed. This cannot be undone.
            </Text>
            <Button title="Delete My Account" icon="trash-2" variant="danger" />
          </Card>
        </>
      )}

      <Button title="Logout" icon="log-out" variant="secondary" onPress={doLogout} style={{ marginTop: space.xl }} />
    </Screen>
  );
}
