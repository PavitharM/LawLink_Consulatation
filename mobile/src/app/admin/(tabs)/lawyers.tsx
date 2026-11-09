import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getUsers, toggleUserStatus, verifyLawyer } from '@/api/services';
import { Avatar, Badge, Banner, Button, Card, Chip, ChipRow, Empty, IconName, InfoRow, Input, Loader, Meta, PageHeader, Screen, Sheet, Stat, StatGrid } from '@/components/ui';
import { colors, space, Tone, type as t } from '@/theme';

type UIStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
const getUIStatus = (l: any): UIStatus => {
  if (l.status === 'SUSPENDED') return 'SUSPENDED';
  if (!l.lawyerProfile?.isVerified) return 'PENDING';
  if (l.status === 'ACTIVE') return 'ACTIVE';
  return 'INACTIVE';
};
const STATUS_UI: Record<UIStatus, { tone: Tone; icon: IconName }> = {
  ACTIVE: { tone: 'success', icon: 'check-circle' },
  PENDING: { tone: 'warning', icon: 'clock' },
  SUSPENDED: { tone: 'danger', icon: 'x-circle' },
  INACTIVE: { tone: 'neutral', icon: 'alert-circle' },
};
const OPTIONS: { label: string; value: UIStatus }[] = [
  { label: 'Approve (Active)', value: 'ACTIVE' },
  { label: 'Set Inactive', value: 'INACTIVE' },
  { label: 'Suspend', value: 'SUSPENDED' },
];

export default function ManageLawyers() {
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | UIStatus>('All');
  const [selected, setSelected] = useState<any>(null);
  const [statusMenu, setStatusMenu] = useState<any>(null);
  const [toast, setToast] = useState('');

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    try {
      const r = await getUsers();
      if (r.success) {
        const mapped = r.data
          .filter((u: any) => u.role === 'LAWYER')
          .map((l: any) => ({
            id: l.id,
            name: l.name,
            email: l.email,
            phone: l.phone,
            city: l.city,
            status: l.status,
            createdAt: l.createdAt,
            cases: l._count?.complaints || 0,
            lawyerProfile: l.lawyerProfile,
            specialization: l.lawyerProfile?.specialization || 'Not specified',
            experience: l.lawyerProfile?.experience || 0,
            location: l.lawyerProfile?.location || l.city || 'Not specified',
            barCouncilId: l.lawyerProfile?.barCouncilId || 'N/A',
            education: l.lawyerProfile?.education || 'N/A',
            bio: l.lawyerProfile?.bio || '',
            consultationFee: l.lawyerProfile?.consultationFee,
            isVerified: l.lawyerProfile?.isVerified || false,
            uiStatus: getUIStatus(l),
          }));
        setLawyers(mapped);
        setSelected((p: any) => (p ? mapped.find((m: any) => m.id === p.id) || null : p));
      }
    } catch (e) {
      console.warn('Failed to fetch lawyers:', e);
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

  // Same sequence as the web: approve → verify; suspend/deactivate → un-verify; then set status.
  const handleStatusChange = async (lawyer: any, next: UIStatus) => {
    setActionLoading(lawyer.id);
    try {
      if (next === 'ACTIVE' && !lawyer.isVerified) await verifyLawyer(lawyer.id, true);
      if ((next === 'SUSPENDED' || next === 'INACTIVE') && lawyer.isVerified) await verifyLawyer(lawyer.id, false);
      await toggleUserStatus(lawyer.id, next);
      showToast(`${lawyer.name}'s status changed to ${next}`);
      await load();
    } catch {
      showToast('Failed to change status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader />;

  const q = search.toLowerCase();
  const filtered = lawyers.filter(
    (l) =>
      (filter === 'All' || l.uiStatus === filter) &&
      (l.name.toLowerCase().includes(q) || l.specialization.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
  );
  const pending = lawyers.filter((l) => l.uiStatus === 'PENDING').length;

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader index="004" eyebrow="Administration" title="Manage Lawyers" subtitle="Review, approve and manage registered lawyers on LawLink." />
      {toast ? <Banner text={toast} tone={toast.startsWith('Failed') ? 'danger' : 'success'} /> : null}
      {pending > 0 ? (
        <Button
          title={`${pending} Pending Approval${pending > 1 ? 's' : ''}`}
          icon="clock"
          variant="secondary"
          small
          style={{ alignSelf: 'flex-start', marginBottom: space.lg, borderColor: colors.warning }}
          onPress={() => setFilter('PENDING')}
        />
      ) : null}

      <StatGrid>
        <Stat label="Total Lawyers" value={lawyers.length} tone="gold" onPress={() => setFilter('All')} />
        <Stat label="Active" value={lawyers.filter((l) => l.uiStatus === 'ACTIVE').length} tone="success" onPress={() => setFilter('ACTIVE')} />
        <Stat label="Pending Approval" value={pending} tone="warning" onPress={() => setFilter('PENDING')} />
        <Stat label="Suspended" value={lawyers.filter((l) => l.uiStatus === 'SUSPENDED').length} tone="danger" onPress={() => setFilter('SUSPENDED')} />
      </StatGrid>

      <Input icon="search" placeholder="Search by name, email or specialization..." value={search} onChangeText={setSearch} containerStyle={{ marginBottom: space.md }} />
      <ChipRow>
        {(['All', 'ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'] as const).map((f) => (
          <Chip key={f} label={f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ChipRow>

      {filtered.length === 0 ? <Empty icon="award" title="No lawyers found." /> : null}

      {filtered.map((l) => {
        const ui = STATUS_UI[l.uiStatus as UIStatus];
        const busy = actionLoading === l.id;
        return (
          <Card key={l.id} style={{ marginBottom: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Avatar name={l.name} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={t.h3}>{l.name}</Text>
                <Text style={t.bodySm} numberOfLines={1}>
                  {l.email}
                </Text>
              </View>
              <Pressable onPress={() => setStatusMenu(l)} disabled={busy} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Badge label={l.uiStatus} tone={ui.tone} icon={ui.icon} />
                <Feather name="chevron-down" size={14} color={colors.textDim} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', marginTop: space.lg }}>
              <Cell label="Specialization" value={l.specialization} />
              <Cell label="Experience" value={`${l.experience} yr${l.experience !== 1 ? 's' : ''}`} />
              <Cell label="Cases" value={String(l.cases)} />
            </View>
            <Text style={[t.meta, { marginTop: space.sm }]}>Bar ID · {l.barCouncilId}</Text>
            <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg }}>
              <Button title="View Profile" icon="eye" small variant="secondary" style={{ flex: 1 }} onPress={() => setSelected(l)} />
              {l.uiStatus === 'PENDING' ? (
                <Button title="Approve" icon="check-circle" small variant="success" style={{ flex: 1 }} loading={busy} onPress={() => handleStatusChange(l, 'ACTIVE')} />
              ) : null}
            </View>
          </Card>
        );
      })}
      <Text style={[t.meta, { textAlign: 'center', marginTop: space.sm }]}>
        Showing {filtered.length} of {lawyers.length} lawyers
      </Text>

      {/* Status picker (web dropdown) */}
      <Sheet visible={!!statusMenu} onClose={() => setStatusMenu(null)} title={statusMenu ? `Change status · ${statusMenu.name}` : ''}>
        {statusMenu
          ? OPTIONS.filter((o) => o.value !== statusMenu.uiStatus).map((o) => (
              <Pressable
                key={o.value}
                onPress={() => {
                  const l = statusMenu;
                  setStatusMenu(null);
                  handleStatusChange(l, o.value);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg, borderBottomWidth: 0.5, borderBottomColor: colors.border }}
              >
                <Feather name={STATUS_UI[o.value].icon} size={18} color={colors.gold} />
                <Text style={t.body}>{o.label}</Text>
              </Pressable>
            ))
          : null}
      </Sheet>

      {/* Profile sheet */}
      <Sheet
        visible={!!selected && !statusMenu}
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <View style={{ gap: space.sm }}>
              {selected.uiStatus === 'PENDING' ? (
                <Button title="Approve Lawyer" icon="check-circle" variant="success" loading={actionLoading === selected.id} onPress={() => handleStatusChange(selected, 'ACTIVE')} />
              ) : null}
              {selected.uiStatus !== 'SUSPENDED' ? (
                <Button title="Suspend" icon="x-circle" variant="danger" disabled={actionLoading === selected.id} onPress={() => handleStatusChange(selected, 'SUSPENDED')} />
              ) : (
                <Button title="Reactivate" icon="check-circle" variant="success" disabled={actionLoading === selected.id} onPress={() => handleStatusChange(selected, 'ACTIVE')} />
              )}
              <Button title="Close" variant="secondary" onPress={() => setSelected(null)} />
            </View>
          ) : null
        }
      >
        {selected ? (
          <>
            <View style={{ alignItems: 'center', marginBottom: space.xl }}>
              <Avatar name={selected.name} size={68} gold />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md }}>
                <Text style={t.h2}>{selected.name}</Text>
                {selected.isVerified ? <Badge label="Verified" tone="success" icon="shield" /> : null}
              </View>
              <Text style={[t.label, { color: colors.gold }]}>{selected.specialization}</Text>
              <View style={{ marginTop: space.sm }}>
                <Badge label={selected.uiStatus} tone={STATUS_UI[selected.uiStatus as UIStatus].tone} icon={STATUS_UI[selected.uiStatus as UIStatus].icon} />
              </View>
            </View>
            <Meta style={{ marginBottom: 4 }}>Contact Information</Meta>
            <InfoRow label="Email" value={selected.email} />
            <InfoRow label="Phone" value={selected.phone || 'Not provided'} />
            <InfoRow label="Location" value={selected.location} />
            <InfoRow label="City" value={selected.city || 'Not provided'} last />
            <Meta style={{ marginTop: space.xl, marginBottom: 4 }}>Professional Details</Meta>
            <InfoRow label="Specialization" value={selected.specialization} />
            <InfoRow label="Experience" value={`${selected.experience} year(s)`} />
            <InfoRow label="Bar Association ID" value={selected.barCouncilId} />
            <InfoRow label="Cases Handled" value={`${selected.cases} cases`} />
            <InfoRow label="Consultation Fee" value={selected.consultationFee ? `LKR ${selected.consultationFee}` : 'Not set'} />
            <InfoRow label="Education" value={selected.education} last />
            {selected.bio ? (
              <>
                <Meta style={{ marginTop: space.xl }}>Bio</Meta>
                <Text style={[t.body, { color: colors.textMuted, marginTop: 4 }]}>{selected.bio}</Text>
              </>
            ) : null}
            <Meta style={{ marginTop: space.xl, marginBottom: 4 }}>Account Info</Meta>
            <InfoRow label="Registered On" value={new Date(selected.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' } as any)} />
            <InfoRow label="Verification" value={selected.isVerified ? 'Verified' : 'Not yet verified'} last />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const Cell = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flex: 1 }}>
    <Text style={t.meta}>{label.toUpperCase()}</Text>
    <Text style={[t.label, { marginTop: 2 }]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);
