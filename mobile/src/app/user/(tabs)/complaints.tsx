import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { getComplaints } from '@/api/services';
import { Badge, Button, Card, Chip, ChipRow, Empty, IconButton, IconName, Input, Loader, MonoTag, PageHeader, Screen, Stat, StatGrid } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { PRIORITY_TONE, shortId, STATUS } from '@/utils/format';

const FILTERS = [
  { v: 'All', l: 'All' },
  { v: 'OPEN', l: 'Open' },
  { v: 'IN_REVIEW', l: 'In Review' },
  { v: 'RESOLVED', l: 'Resolved' },
  { v: 'CLOSED', l: 'Closed' },
];

export default function MyComplaints() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const load = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) setComplaints(res.data);
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

  const q = search.toLowerCase();
  const filtered = complaints.filter(
    (c) => (statusFilter === 'All' || c.status === statusFilter) && (c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
  );

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader
        index="002"
        eyebrow="Cases"
        title="My Complaints"
        subtitle="Track all your legal cases and their current status."
        right={<IconButton name="plus" bg={colors.gold} color={colors.onGold} onPress={() => router.push('/user/new-complaint')} />}
      />

      <StatGrid>
        <Stat label="Total Cases" value={complaints.length} tone="gold" />
        <Stat label="Open" value={complaints.filter((c) => c.status === 'OPEN').length} tone="info" />
        <Stat label="In Review" value={complaints.filter((c) => c.status === 'IN_REVIEW').length} tone="warning" />
        <Stat label="Resolved" value={complaints.filter((c) => c.status === 'RESOLVED').length} tone="success" />
      </StatGrid>

      <Input icon="search" placeholder="Search by title or case ID..." value={search} onChangeText={setSearch} containerStyle={{ marginBottom: space.md }} />
      <ChipRow>
        {FILTERS.map((f) => (
          <Chip key={f.v} label={f.l} active={statusFilter === f.v} onPress={() => setStatusFilter(f.v)} />
        ))}
      </ChipRow>

      {filtered.length === 0 ? (
        <Empty icon="alert-triangle" title="No complaints found" subtitle="Try adjusting your search or filters." />
      ) : (
        filtered.map((c) => {
          const st = STATUS[c.status] || STATUS.OPEN;
          return (
            <Card key={c.id} style={{ marginBottom: space.md }}>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: space.sm }}>
                <MonoTag label={shortId(c.id)} />
                <Badge label={st.label} tone={st.tone} icon={st.icon as IconName} />
                <Badge label={c.priority} tone={PRIORITY_TONE[c.priority]} />
                <Badge label={c.category} tone="neutral" />
              </View>
              <Text style={t.h3}>{c.title}</Text>
              <View style={{ flexDirection: 'row', marginTop: space.md, gap: space.md }}>
                <MetaCell label="Filed" value={new Date(c.createdAt).toLocaleDateString()} />
                <MetaCell label="Lawyer" value={c.assignedTo?.name || 'Unassigned'} warn={!c.assignedTo} />
                <MetaCell label="Next Hearing" value={c.hearingDate ? new Date(c.hearingDate).toLocaleDateString() : 'TBD'} />
              </View>
              <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg }}>
                {c.status === 'IN_REVIEW' ? (
                  <Button
                    title="Chat"
                    icon="message-circle"
                    small
                    variant="secondary"
                    style={{ flex: 1 }}
                    onPress={() => router.push(c.assignedTo?.id ? `/user/consultation?lawyerId=${c.assignedTo.id}` : '/user/consultation')}
                  />
                ) : null}
                <Button title="View Details" icon="eye" small style={{ flex: 1 }} onPress={() => router.push(`/user/complaint/${c.id}`)} />
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const MetaCell = ({ label, value, warn }: { label: string; value: string; warn?: boolean }) => (
  <View style={{ flex: 1 }}>
    <Text style={[t.meta, { textTransform: 'uppercase' }]}>{label}</Text>
    <Text style={[t.label, { marginTop: 2 }, warn && { color: colors.warning }]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);
