import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { getComplaints } from '@/api/services';
import { Badge, Banner, Button, Card, Chip, ChipRow, Empty, IconButton, IconName, Input, Loader, MonoTag, PageHeader, Screen, Stat, StatGrid } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { PRIORITY_TONE, priorityLabel, shortId, STATUS } from '@/utils/format';

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
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) setComplaints(res.data);
      setError(null);
      setLoaded(true);
    } catch (e: any) {
      setError(e?.message || 'Could not load your complaints.');
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

  if (error && !loaded) {
    return (
      <Screen>
        <Empty
          icon="wifi-off"
          title="Can't load your complaints"
          subtitle={error}
          action={{ label: 'Try again', icon: 'refresh-cw', onPress: () => { setLoading(true); load(); } }}
        />
      </Screen>
    );
  }

  const q = search.trim().toLowerCase().replace(/^#/, '');
  const filtered = complaints.filter(
    (c) =>
      (statusFilter === 'All' || c.status === statusFilter) &&
      (!q || c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q))
  );
  const countFor = (v: string) => (v === 'All' ? complaints.length : complaints.filter((c) => c.status === v).length);
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const clearFilters = () => { setSearch(''); setStatusFilter('All'); };

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader
        index="002"
        eyebrow="Cases"
        title="My Complaints"
        subtitle="Track all your legal cases and their current status."
        right={<IconButton name="plus" label="New complaint" bg={colors.gold} color={colors.onGold} onPress={() => router.push('/user/new-complaint')} />}
      />

      {error ? <Banner tone="warning" icon="wifi-off" text="Showing saved data — pull down to refresh." /> : null}

      <StatGrid>
        <Stat label="Total Cases" value={complaints.length} tone="gold" />
        <Stat label="Open" value={complaints.filter((c) => c.status === 'OPEN').length} tone="info" />
        <Stat label="In Review" value={complaints.filter((c) => c.status === 'IN_REVIEW').length} tone="warning" />
        <Stat label="Resolved" value={complaints.filter((c) => c.status === 'RESOLVED').length} tone="success" />
      </StatGrid>

      <Input
        icon="search"
        placeholder="Search title, category or case ID…"
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        containerStyle={{ marginBottom: space.md }}
      />
      <ChipRow>
        {FILTERS.map((f) => (
          <Chip key={f.v} label={f.l} count={countFor(f.v)} active={statusFilter === f.v} onPress={() => setStatusFilter(f.v)} />
        ))}
      </ChipRow>

      {filtered.length === 0 ? (
        complaints.length === 0 ? (
          <Empty
            icon="inbox"
            title="You haven't filed any complaints"
            subtitle="Describe your legal issue and we'll match you with a verified lawyer."
            action={{ label: 'File a complaint', icon: 'plus', onPress: () => router.push('/user/new-complaint') }}
          />
        ) : (
          <Empty
            icon="search"
            title="No matching complaints"
            subtitle="Try a different search term or status filter."
            action={{ label: 'Clear filters', icon: 'x', onPress: clearFilters }}
          />
        )
      ) : (
        filtered.map((c) => {
          const st = STATUS[c.status] || STATUS.OPEN;
          return (
            <Card key={c.id} style={{ marginBottom: space.md }} onPress={() => router.push(`/user/complaint/${c.id}`)}>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: space.sm }}>
                <MonoTag label={shortId(c.id)} />
                <Badge label={st.label} tone={st.tone} icon={st.icon as IconName} />
                {c.priority ? <Badge label={priorityLabel(c.priority)} tone={PRIORITY_TONE[c.priority]} /> : null}
                {c.category ? <Badge label={c.category} tone="neutral" /> : null}
              </View>
              <Text style={t.h3}>{c.title}</Text>
              <View style={{ flexDirection: 'row', marginTop: space.md, gap: space.md }}>
                <MetaCell label="Filed" value={fmt(c.createdAt)} />
                <MetaCell label="Lawyer" value={c.assignedTo?.name || 'Awaiting'} warn={!c.assignedTo} />
                <MetaCell label="Hearing" value={c.hearingDate ? fmt(c.hearingDate) : 'TBD'} />
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
