import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getMe, updateLawyerProfile } from '@/api/services';
import { fileUrl } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import EditableField from '@/components/EditableField';
import { AvatarPicker, EditToggle, PasswordForm, ProfileTabs } from '@/components/shared';
import { Badge, Banner, Button, Card, InfoRow, Loader, Meta, PageHeader, Screen, SectionTitle, ToggleRow } from '@/components/ui';
import { colors, space, Tone, type as t } from '@/theme';

type Tab = 'profile' | 'security' | 'notif' | 'documents';
const TABS = [
  { id: 'profile' as Tab, label: 'Profile', icon: 'user' as const },
  { id: 'security' as Tab, label: 'Security', icon: 'shield' as const },
  { id: 'notif' as Tab, label: 'Notifications', icon: 'bell' as const },
  { id: 'documents' as Tab, label: 'Credentials', icon: 'award' as const },
];

const empty = {
  name: '', email: '', phone: '', barCouncilId: '', specialization: 'Civil Law', experience: '' as string | number,
  location: '', state: '', languages: '' as any, education: '', bio: '', consultationFee: '' as string | number,
  availability: '', linkedIn: '', website: '', avatarUrl: null as string | null,
};

export default function LawyerProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(empty);
  const [draft, setDraft] = useState(empty);
  const [notif, setNotif] = useState({
    newCaseAssigned: true, clientMessages: true, hearingReminders: true, paymentReceived: true,
    clientReviews: true, adminAlerts: true, emailDigest: false, smsAlerts: true, promotionalEmails: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getMe();
        if (res.success) {
          const u = res.data;
          const lp = u.lawyerProfile || {};
          const p = {
            name: u.name || '', email: u.email || '', phone: u.phone || '',
            barCouncilId: lp.barCouncilId || '', specialization: lp.specialization || 'Civil Law',
            experience: lp.experience ?? '', location: lp.location || '', state: lp.state || '',
            languages: Array.isArray(lp.languages) ? lp.languages.join(', ') : lp.languages || '',
            education: lp.education || '', bio: lp.bio || '', consultationFee: lp.consultationFee ?? '',
            availability: lp.availability || '', linkedIn: lp.linkedIn || '', website: lp.website || '',
            avatarUrl: fileUrl(u.avatar),
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
      const res = await updateLawyerProfile({
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        lawyerProfile: {
          specialization: draft.specialization,
          experience: draft.experience !== '' ? parseInt(String(draft.experience), 10) : null,
          location: draft.location,
          state: draft.state,
          languages: draft.languages,
          education: draft.education,
          bio: draft.bio,
          consultationFee: draft.consultationFee !== '' ? parseFloat(String(draft.consultationFee)) : null,
          availability: draft.availability,
          linkedIn: draft.linkedIn,
          website: draft.website,
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

  if (loading) return <Loader />;

  const set = (k: keyof typeof empty) => (v: string) => setDraft((p) => ({ ...p, [k]: v }));
  const fp = (k: keyof typeof empty) => ({ value: profile[k] as any, draftValue: draft[k] as any, editing, onChange: set(k) });

  const credentials: { label: string; status: string; tone: Tone; expiry: string }[] = [
    { label: 'Bar Association Certificate', status: 'Verified', tone: 'success', expiry: 'Valid for life' },
    { label: 'Law Degree Certificate', status: 'Verified', tone: 'success', expiry: 'Permanent' },
    { label: 'Practice Certificate 2024', status: 'Pending Renewal', tone: 'warning', expiry: 'Expires Dec 2024' },
    { label: 'Good Standing Certificate', status: 'Not Uploaded', tone: 'danger', expiry: '—' },
  ];

  return (
    <Screen>
      <PageHeader index="005" eyebrow="Settings" title="My Profile" subtitle="Manage your professional profile, security and notification settings." />
      {saved ? <Banner text="Profile updated successfully!" /> : null}

      <Card style={{ alignItems: 'center', paddingVertical: space.xl, marginBottom: space.lg }}>
        <AvatarPicker
          name={profile.name}
          url={profile.avatarUrl}
          onChange={(url) => {
            setProfile((p) => ({ ...p, avatarUrl: url }));
            setDraft((p) => ({ ...p, avatarUrl: url }));
          }}
        />
        <Text style={[t.h2, { marginTop: space.md }]}>{profile.name}</Text>
        <Text style={[t.label, { color: colors.gold }]}>{profile.specialization} Specialist</Text>
        {profile.location || profile.state ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Feather name="map-pin" size={12} color={colors.textDim} />
            <Text style={t.bodySm}>{[profile.location, profile.state].filter(Boolean).join(', ')}</Text>
          </View>
        ) : null}
        <View style={{ marginTop: space.sm, alignItems: 'center', gap: 4 }}>
          <Badge label="✅ Verified Lawyer" tone="success" />
          {profile.barCouncilId ? <Text style={t.meta}>{profile.barCouncilId}</Text> : null}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: space.md, marginBottom: space.lg }}>
        <Card style={{ flex: 1 }}>
          <Meta>Availability</Meta>
          <Text style={[t.label, { marginTop: 4 }]}>{profile.availability || '—'}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Meta>Consultation Fee</Meta>
          <Text style={[t.label, { marginTop: 4 }]}>{profile.consultationFee || '—'} / session</Text>
        </Card>
      </View>

      <Card style={{ marginBottom: space.xl }}>
        <Meta style={{ marginBottom: space.sm }}>Performance</Meta>
        <InfoRow label="Cases Handled" value="48" />
        <InfoRow label="Success Rate" value="87%" />
        <InfoRow label="Rating" value="4.8" />
        <InfoRow label="Reviews" value="36" last />
      </Card>

      <ProfileTabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'profile' && (
        <>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Professional Details" icon="briefcase" />
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
            <EditableField label="Full Name" {...fp('name')} />
            <EditableField label="Specialization" select={['Civil Law', 'Criminal Law', 'Family Law', 'Labour Law', 'Consumer Law', 'Corporate Law', 'Property Law', 'Tax Law']} {...fp('specialization')} />
            <EditableField label="Experience (years)" keyboardType="number-pad" {...fp('experience')} />
            <EditableField label="Languages Known" {...fp('languages')} />
            <EditableField label="City / Location" {...fp('location')} />
            <EditableField label="State" {...fp('state')} />
            <EditableField label="Consultation Fee" keyboardType="numeric" {...fp('consultationFee')} />
            <EditableField label="Availability" {...fp('availability')} />
            <EditableField label="Education / Degree" {...fp('education')} />
            <EditableField label="LinkedIn Profile URL" keyboardType="url" {...fp('linkedIn')} />
            <EditableField label="Professional Bio" multiline {...fp('bio')} />
          </Card>
          <Card>
            <SectionTitle title="Contact Information" icon="mail" />
            <EditableField label="Email" keyboardType="email-address" {...fp('email')} />
            <EditableField label="Phone Number" keyboardType="phone-pad" {...fp('phone')} />
          </Card>
        </>
      )}

      {tab === 'security' && (
        <>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Change Password" icon="shield" />
            <PasswordForm />
          </Card>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Two-Factor Authentication" icon="smartphone" />
            <Text style={[t.bodySm, { marginBottom: space.lg }]}>Add an extra layer of security to your lawyer account.</Text>
            <Button title="Enable 2FA" variant="secondary" />
          </Card>
          <Card variant="danger">
            <SectionTitle title="Danger Zone" icon="alert-circle" />
            <Text style={t.bodySm}>Once you delete your account, all your cases, documents and data will be permanently removed. This cannot be undone.</Text>
          </Card>
        </>
      )}

      {tab === 'notif' && (
        <Card>
          <SectionTitle title="Notification Settings" icon="bell" />
          <Meta style={{ marginTop: space.sm }}>Case Activity</Meta>
          {[
            { key: 'newCaseAssigned', label: 'New Case Assigned', desc: 'When admin assigns a new case to you' },
            { key: 'clientMessages', label: 'Client Messages', desc: 'When a client sends you a new message' },
            { key: 'hearingReminders', label: 'Hearing Reminders', desc: '24-hour reminder before court hearings' },
            { key: 'clientReviews', label: 'Client Reviews', desc: 'When a client rates or reviews your service' },
          ].map((r) => (
            <ToggleRow key={r.key} label={r.label} desc={r.desc} value={(notif as any)[r.key]} onChange={(v) => setNotif((p) => ({ ...p, [r.key]: v }))} />
          ))}
          <Meta style={{ marginTop: space.xl }}>Payments & Admin</Meta>
          {[
            { key: 'paymentReceived', label: 'Payment Received', desc: 'Fee credited to your account for a case' },
            { key: 'adminAlerts', label: 'Admin Alerts', desc: 'Important notices from the LawLink admin team' },
          ].map((r) => (
            <ToggleRow key={r.key} label={r.label} desc={r.desc} value={(notif as any)[r.key]} onChange={(v) => setNotif((p) => ({ ...p, [r.key]: v }))} />
          ))}
          <Meta style={{ marginTop: space.xl }}>External Channels</Meta>
          {[
            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Critical case updates via SMS' },
            { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Summary of all case activities by email' },
            { key: 'promotionalEmails', label: 'Platform Newsletters', desc: 'Updates, tips and news from LawLink' },
          ].map((r) => (
            <ToggleRow key={r.key} label={r.label} desc={r.desc} value={(notif as any)[r.key]} onChange={(v) => setNotif((p) => ({ ...p, [r.key]: v }))} />
          ))}
          <Button title="Save Notification Settings" icon="save" style={{ marginTop: space.xl }} onPress={flashSaved} />
        </Card>
      )}

      {tab === 'documents' && (
        <>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Legal Credentials" icon="award" />
            {credentials.map((d, i) => (
              <View key={d.label} style={[{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md }, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
                <Feather name="file-text" size={18} color={colors.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={t.label}>{d.label}</Text>
                  <Text style={t.meta}>{d.expiry}</Text>
                  <View style={{ marginTop: 4 }}>
                    <Badge label={d.status} tone={d.tone} />
                  </View>
                </View>
                <Button title="Upload" icon="upload" small variant="secondary" />
              </View>
            ))}
          </Card>
          <Card variant="gold">
            <SectionTitle title="Bar Association Registration" icon="shield" />
            <Meta>Registered ID</Meta>
            <Text style={[t.h2, { marginTop: 4 }]}>{profile.barCouncilId || '—'}</Text>
            <Text style={[t.bodySm, { color: colors.success, marginTop: space.sm }]}>✅ Verified by LawLink on June 15, 2024</Text>
          </Card>
        </>
      )}

      <Button
        title="Logout"
        icon="log-out"
        variant="secondary"
        style={{ marginTop: space.xl }}
        onPress={() => {
          logout();
          router.replace('/login');
        }}
      />
    </Screen>
  );
}
