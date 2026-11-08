import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { getUsers, toggleUserStatus } from '@/api/services';
import { Avatar, Badge, Banner, Button, Card, Chip, ChipRow, Empty, IconButton, InfoRow, Input, Loader, MonoTag, PageHeader, Screen, Sheet, Stat, StatGrid } from '@/components/ui';
import { colors, space, Tone, type as t } from '@/theme';
import { shortId } from '@/utils/format';

const statusCfg: Record<string, { tone: Tone; label: string }> = {
  ACTIVE: { tone: 'success', label: 'Active' },
  INACTIVE: { tone: 'neutral', label: 'Inactive' },
  SUSPENDED: { tone: 'danger', label: 'Suspended' },
};

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<any>(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await getUsers();
      if (r.success) setUsers(r.data.filter((u: any) => u.role === 'USER'));
    } catch (e) {
      console.warn('Failed to fetch users:', e);
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

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      const r = await toggleUserStatus(id, next);
      if (r.success) {
        setUsers((p) => p.map((u) => (u.id === id ? { ...u, status: next } : u)));
        setToast(`User has been ${next.toLowerCase()}.`);
        setTimeout(() => setToast(''), 3000);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Status change failed.');
    }
  };

  if (loading) return <Loader />;

  const q = search.toLowerCase();
  const filtered = users.filter(
    (u) =>
      (filter === 'All' || u.status === filter.toUpperCase()) &&
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))
  );

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader index="003" eyebrow="Administration" title="Manage Users" subtitle="View and manage all registered clients on LawLink." />
      {toast ? <Banner text={toast} /> : null}

      <StatGrid>
        <Stat label="Total Users" value={users.length} tone="gold" />
        <Stat label="Active" value={users.filter((u) => u.status === 'ACTIVE').length} tone="success" />
        <Stat label="Inactive" value={users.filter((u) => u.status === 'INACTIVE').length} tone="neutral" />
        <Stat label="Suspended" value={users.filter((u) => u.status === 'SUSPENDED').length} tone="danger" />
      </StatGrid>

      <Input icon="search" placeholder="Search by name, email or ID..." value={search} onChangeText={setSearch} containerStyle={{ marginBottom: space.md }} />
      <ChipRow label="Status">
        {['All', 'Active', 'Inactive', 'Suspended'].map((f) => (
          <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ChipRow>

      {filtered.length === 0 ? <Empty icon="users" title="No users found" /> : null}

      {filtered.map((u) => {
        const cfg = statusCfg[u.status] || statusCfg.ACTIVE;
        return (
          <Card key={u.id} style={{ marginBottom: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Avatar name={u.name} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={t.h3}>{u.name}</Text>
                <MonoTag label={shortId(u.id)} />
              </View>
              <IconButton name="eye" onPress={() => setSelected(u)} />
            </View>
            <View style={{ marginTop: space.md }}>
              <InfoRow label="Email" value={u.email} />
              <InfoRow label="Phone" value={u.phone || 'N/A'} />
              <InfoRow label="Joined" value={new Date(u.createdAt).toLocaleDateString()} />
              <InfoRow label="Cases Filed" value={String(u._count?.complaints || 0)} last />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md }}>
              <Badge label={cfg.label} tone={cfg.tone} />
              <Button
                title={u.status === 'SUSPENDED' ? 'Reinstate User' : 'Suspend User'}
                small
                variant={u.status === 'SUSPENDED' ? 'success' : 'danger'}
                onPress={() => toggleStatus(u.id, u.status)}
              />
            </View>
          </Card>
        );
      })}

      <Sheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <Button title="Close" variant="secondary" style={{ flex: 1 }} onPress={() => setSelected(null)} />
              <Button
                title={selected.status !== 'SUSPENDED' ? 'Suspend User' : 'Reinstate User'}
                variant={selected.status !== 'SUSPENDED' ? 'danger' : 'success'}
                style={{ flex: 1 }}
                onPress={() => {
                  toggleStatus(selected.id, selected.status);
                  setSelected(null);
                }}
              />
            </View>
          ) : null
        }
      >
        {selected ? (
          <>
            <View style={{ alignItems: 'center', marginBottom: space.xl }}>
              <Avatar name={selected.name} size={64} gold />
              <Text style={[t.h2, { marginTop: space.md }]}>{selected.name}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: space.sm }}>
                <MonoTag label={shortId(selected.id)} />
                <Badge label={(statusCfg[selected.status] || statusCfg.ACTIVE).label} tone={(statusCfg[selected.status] || statusCfg.ACTIVE).tone} />
              </View>
            </View>
            <Text style={[t.h3, { marginBottom: space.sm }]}>Contact & Location</Text>
            <InfoRow label="Email" value={selected.email} />
            <InfoRow label="Phone" value={selected.phone || 'N/A'} />
            <InfoRow label="City" value={selected.city || 'N/A'} />
            <InfoRow label="Joined" value={new Date(selected.createdAt).toLocaleDateString()} />
            <InfoRow label="Current Plan" value={selected.activePackageId ? 'Premium' : 'Free / Standard'} />
            <InfoRow label="Cases Filed" value={String(selected._count?.complaints || 0)} last />
            {selected.status === 'SUSPENDED' ? (
              <Card variant="danger" style={{ marginTop: space.lg }}>
                <Text style={[t.label, { color: colors.danger }]}>Account Suspended</Text>
                <Text style={[t.bodySm, { marginTop: 2 }]}>This user cannot log in or file new cases. They can be reinstated at any time.</Text>
              </Card>
            ) : null}
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}
