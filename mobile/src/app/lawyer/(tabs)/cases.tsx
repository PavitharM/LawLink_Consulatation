import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getComplaints } from '@/api/services';
import { Avatar, Badge, Banner, Button, Card, Chip, ChipRow, Empty, IconName, Input, Loader, Meta, MonoTag, PageHeader, Screen, SectionTitle, Stat, StatGrid } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { fmtDateGB, PRIORITY_TONE, priorityLabel, shortId, STATUS } from '@/utils/format';

function CaseCard({ c, onView }: { c: any; onView: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS[c.status] || STATUS.OPEN;
  return (
    <Card onPress={onView} style={[{ marginBottom: space.md }, expanded && { borderColor: colors.goldBorder }]}>
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Avatar name={c.client?.name} size={40} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            <MonoTag label={shortId(c.id)} />
            <Badge label={st.label} tone={st.tone} icon={st.icon as IconName} />
            {c.priority ? <Badge label={priorityLabel(c.priority)} tone={PRIORITY_TONE[c.priority]} /> : null}
            {c.category ? <Badge label={c.category} tone="neutral" /> : null}
            <Badge label={c.packageId ? 'Package purchased' : 'No package'} icon="package" tone={c.packageId ? 'gold' : 'neutral'} />
          </View>
          <Text style={t.h3}>{c.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: 2, marginTop: 6 }}>
            <MetaItem icon="user" text={c.client?.name || 'Unknown'} />
            <MetaItem icon="clock" text={`Filed ${fmtDateGB(c.createdAt)}`} />
            <MetaItem icon="calendar" text={c.hearingDate ? `Hearing: ${fmtDateGB(c.hearingDate)}` : 'No hearing set'} gold={!!c.hearingDate} />
            <MetaItem icon="file-text" text={`${c.documents ? c.documents.length : 0} docs`} />
          </View>
        </View>
      </View>
      {expanded ? (
        <View style={{ marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 0.5, borderTopColor: colors.border }}>
          <Meta>Case Summary</Meta>
          <Text style={[t.bodySm, { marginTop: 4, color: colors.text }]}>{c.description}</Text>
          {c.hearingDate ? (
            <Card variant="gold" style={{ marginTop: space.md, padding: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="calendar" size={13} color={colors.gold} />
                <Text style={t.label}>Court Hearing</Text>
              </View>
              <Text style={t.bodySm}>{fmtDateGB(c.hearingDate)}</Text>
            </Card>
          ) : null}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg }}>
        <Button title={expanded ? 'Less' : 'Preview'} icon={expanded ? 'chevron-up' : 'chevron-down'} small variant="secondary" onPress={() => setExpanded((e) => !e)} />
        <Button title="Review" icon="eye" iconRight="arrow-right" small style={{ flex: 1 }} onPress={onView} />
      </View>
    </Card>
  );
}

const MetaItem = ({ icon, text, gold }: { icon: IconName; text: string; gold?: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <Feather name={icon} size={11} color={gold ? colors.gold : colors.textDim} />
    <Text style={[t.meta, { textTransform: 'none' }, gold && { color: colors.gold }]}>{text}</Text>
  </View>
);

export default function AssignedCases() {
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'filed' | 'priority'>('filed');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getComplaints();
      if (res.success) setCases(res.data);
      setError(null);
      setLoaded(true);
    } catch (e: any) {
      setError(e?.message || 'Could not load your cases.');
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
        <Empty icon="wifi-off" title="Can't load your cases" subtitle={error}
          action={{ label: 'Try again', icon: 'refresh-cw', onPress: () => { setLoading(true); load(); } }} />
      </Screen>
    );
  }


  const categories = ['All', ...Array.from(new Set(cases.map((c) => c.category)))];
  const q = search.toLowerCase();
  const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const filtered = cases
    .filter(
      (c) =>
        (statusFilter === 'All' || c.status === statusFilter) &&
        (priorityFilter === 'All' || c.priority === priorityFilter) &&
        (categoryFilter === 'All' || c.category === categoryFilter) &&
        (c.title.toLowerCase().includes(q) || c.client?.name?.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    )
    .sort((a, b) => (sortBy === 'priority' ? order[a.priority] - order[b.priority] : +new Date(b.createdAt) - +new Date(a.createdAt)));

  const total = cases.length;
  const active = cases.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const inReview = cases.filter((c) => c.status === 'IN_REVIEW').length;
  const resolved = cases.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const hearings = cases.filter((c) => c.hearingDate);
  const filtersOn = statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All' || !!search;

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader index="002" eyebrow="Caseload" title="Assigned Cases" subtitle={`${total} cases assigned · ${active} active · no unread messages`} />
      {error ? <Banner tone="warning" icon="wifi-off" text="Showing saved data — pull down to refresh." /> : null}

      <StatGrid>
        <Stat label="Total" value={total} tone="gold" />
        <Stat label="Active" value={active} tone="info" />
        <Stat label="In Review" value={inReview} tone="warning" />
        <Stat label="Resolved" value={resolved} tone="success" />
      </StatGrid>

      <Input icon="search" placeholder="Search by case ID, title or client name..." value={search} onChangeText={setSearch} containerStyle={{ marginBottom: space.md }} />
      <ChipRow label="Sort by">
        <Chip label="Filed Date" active={sortBy === 'filed'} onPress={() => setSortBy('filed')} />
        <Chip label="Priority" active={sortBy === 'priority'} onPress={() => setSortBy('priority')} />
      </ChipRow>
      <ChipRow label="Status">
        {['All', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].map((f) => (
          <Chip key={f} label={f} active={statusFilter === f} onPress={() => setStatusFilter(f)} />
        ))}
      </ChipRow>
      <ChipRow label="Priority">
        {['All', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
          <Chip key={f} label={f} active={priorityFilter === f} onPress={() => setPriorityFilter(f)} />
        ))}
      </ChipRow>
      <ChipRow label="Category">
        {categories.map((f) => (
          <Chip key={f} label={f} active={categoryFilter === f} onPress={() => setCategoryFilter(f)} />
        ))}
      </ChipRow>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md }}>
        <Text style={t.bodySm}>
          Showing <Text style={{ color: colors.text }}>{filtered.length}</Text> of {cases.length} cases
        </Text>
        {filtersOn ? (
          <Pressable
            onPress={() => {
              setStatusFilter('All');
              setPriorityFilter('All');
              setCategoryFilter('All');
              setSearch('');
            }}
          >
            <Text style={[t.label, { color: colors.gold }]}>Clear filters</Text>
          </Pressable>
        ) : null}
      </View>

      {filtered.length === 0 ? (
        cases.length === 0 ? (
          <Empty icon="briefcase" title="No cases assigned yet" subtitle="New client requests will appear here as soon as they're assigned to you." />
        ) : (
          <Empty
            icon="search"
            title="No cases match your filters"
            subtitle="Try adjusting the search or filter options."
            action={{
              label: 'Clear filters',
              icon: 'x',
              onPress: () => { setStatusFilter('All'); setPriorityFilter('All'); setCategoryFilter('All'); setSearch(''); },
            }}
          />
        )
      ) : (
        filtered.map((c) => <CaseCard key={c.id} c={c} onView={() => router.push(`/lawyer/complaint/${c.id}`)} />)
      )}

      {hearings.length > 0 ? (
        <>
          <SectionTitle title="Upcoming Court Hearings" icon="calendar" style={{ marginTop: space.xl }} />
          {hearings.map((c) => (
            <Card key={c.id} variant="gold" style={{ marginBottom: space.sm, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Feather name="calendar" size={18} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={t.label}>{fmtDateGB(c.hearingDate)}</Text>
                <Text style={t.bodySm}>
                  {shortId(c.id)} — {c.client?.name || 'Unknown'}
                </Text>
              </View>
              <Button title="View Case" small variant="secondary" onPress={() => router.push(`/lawyer/complaint/${c.id}`)} />
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
