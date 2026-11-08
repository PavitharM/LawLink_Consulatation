import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { getMe, updateMe } from '@/api/services';
import { fileUrl } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import EditableField from '@/components/EditableField';
import { AvatarPicker, EditToggle, PasswordForm } from '@/components/shared';
import { Badge, Banner, Button, Card, InfoRow, Loader, PageHeader, Screen, SectionTitle } from '@/components/ui';
import { space, type as t } from '@/theme';

export default function AdminProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ name: 'Admin', email: 'admin@lawlink.in', phone: '', role: 'ADMIN', avatarUrl: null as string | null });
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    getMe()
      .then((r) => {
        if (r.success) {
          const u = r.data;
          const p = { name: u.name, email: u.email, phone: u.phone || '', role: u.role, avatarUrl: fileUrl(u.avatar) };
          setProfile(p);
          setDraft(p);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const r = await updateMe({ name: draft.name, phone: draft.phone });
      if (r.success) {
        setProfile(draft);
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e: any) {
      Alert.alert('Could not save', e?.message || 'Please try again.');
    }
  };

  if (loading) return <Loader />;

  return (
    <Screen>
      <PageHeader back index="Profile" eyebrow="Administration" title="Admin Profile" subtitle="Manage your platform administrator account and security settings." />
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
        <Badge label={profile.role} tone="gold" icon="shield" />
      </Card>

      <Card style={{ marginBottom: space.lg }}>
        <SectionTitle title="Active Session" icon="globe" />
        <InfoRow label="Device" value="LawLink Mobile" />
        <InfoRow label="Logged in" value="Recently" last />
      </Card>

      <Card style={{ marginBottom: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg }}>
          <Text style={t.h3}>Account Details</Text>
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
        <EditableField label="Full Name" value={profile.name} draftValue={draft.name} editing={editing} onChange={(v) => setDraft({ ...draft, name: v })} />
        <EditableField label="Email Address" value={profile.email} editing={editing} disabled />
        <EditableField label="Phone Number" keyboardType="phone-pad" value={profile.phone} draftValue={draft.phone} editing={editing} onChange={(v) => setDraft({ ...draft, phone: v })} />
      </Card>

      <Card style={{ marginBottom: space.xl }}>
        <SectionTitle title="Change Password" icon="key" />
        <PasswordForm adminStyle />
      </Card>

      <Button
        title="Logout"
        icon="log-out"
        variant="secondary"
        onPress={() => {
          logout();
          router.replace('/login');
        }}
      />
    </Screen>
  );
}
