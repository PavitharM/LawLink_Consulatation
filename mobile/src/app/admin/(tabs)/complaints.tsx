import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { assignLawyer, getComplaints, getLawyers, updateComplaintStatus } from '@/api/services';
import { Avatar, Badge, Banner, Button, Card, Chip, ChipRow, Empty, IconName, InfoGrid, Input, Loader, Meta, MonoTag, PageHeader, Screen, Sheet, Stat, StatGrid } from '@/components/ui';
import { colors, radius, space, type as t } from '@/theme';
import { PRIORITY_TONE, shortId, STATUS } from '@/utils/format';

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [priFilter, setPriFilter] = useState('All');
  const [selected, setSelected] = useState<any>(null);
  const [assignFor, setAssignFor] = useState<any>(null);
  const [assignPick, setAssignPick] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    try {
      const [cRes, lRes] = await Promise.all([getComplaints(), getLawyers()]);
      if (cRes.success) {
        setComplaints(
          cRes.data.map((c: any) => ({
            id: c.id,
            user: c.client?.name || 'Unknown',
            userEmail: c.client?.email || 'N/A',
            userPhone: c.client?.phone || 'N/A',
            title: c.title,
            category: c.category || 'General',
            priority: c.priority || 'LOW',
            status: c.status || 'OPEN',
            assignedTo: c.assignedTo ? c.assignedTo.name : null,
            assignedToObj: c.assignedTo || null,
            date: new Date(c.createdAt).toLocaleDateString(),
            hearing: 'TBD',
            description: c.description || 'No description provided.',
            package: c.packageId ? 'Premium' : 'Free / Standard',
          }))
        );
      }
      if (lRes.success) setLawyers(lRes.data);
    } catch (e) {
      console.warn('Failed to load data:', e);
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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const r = await updateComplaintStatus(id, { status });
      if (r.success) {
        setComplaints((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
        setSelected((p: any) => (p?.id === id ? { ...p, status } : p));
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update status.');
    }
  };

  const openAssign = (c: any) => {
    setAssignPick(c.assignedToObj?.id || '');
    setAssignFor(c);
  };

  const handleAssign = async () => {
    if (!assignFor || !assignPick) return;
    try {
      const r = await assignLawyer(assignFor.id, assignPick);
      if (r.success) {
        setAssignFor(null);
        setSelected(null);
        load();
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not assign lawyer.');
    }
  };

  if (loading) return <Loader />;

  const categories = ['All', ...Array.from(new Set(complaints.map((c) => c.category)))];
  const q = search.toLowerCase();
  const filtered = complaints.filter(
    (c) =>
      (statusFilter === 'All' || c.status === statusFilter) &&
      (catFilter === 'All' || c.category === catFilter) &&
      (priFilter === 'All' || c.priority === priFilter) &&
      (c.title.toLowerCase().includes(q) || c.user.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
  );
  const isUnassigned = (c: any) => !c.assignedTo && c.status !== 'RESOLVED' && c.status !== 'CLOSED';
  const unassigned = complaints.filter(isUnassigned).length;
  const filtersOn = statusFilter !== 'All' || priFilter !== 'All' || catFilter !== 'All' || !!search;

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader index="002" eyebrow="Administration" title="Manage Complaints" subtitle="View, assign, update and resolve all platform complaints." />
      {unassigned > 0 ? <Banner tone="danger" icon="alert-triangle" text={`${unassigned} unassigned case${unassigned > 1 ? 's' : ''}`} /> : null}

      <StatGrid>
        <Stat label="Total" value={complaints.length} tone="gold" />
        <Stat label="Open" value={complaints.filter((c) => c.status === 'OPEN').length} tone="info" />
        <Stat label="In Review" value={complaints.filter((c) => c.status === 'IN_REVIEW').length} tone="warning" />
        <Stat label="Resolved" value={complaints.filter((c) => c.status === 'RESOLVED').length} tone="success" />
      </StatGrid>

      <Input icon="search" placeholder="Search by ID, title or user..." value={search} onChangeText={setSearch} containerStyle={{ marginBottom: space.md }} />
      <ChipRow label="Status">
        {['All', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].map((f) => (
          <Chip key={f} label={f} active={statusFilter === f} onPress={() => setStatusFilter(f)} />
        ))}
      </ChipRow>
      <ChipRow label="Priority">
        {['All', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
          <Chip key={f} label={f} active={priFilter === f} onPress={() => setPriFilter(f)} />
        ))}
      </ChipRow>
      <ChipRow label="Category">
        {categories.map((f) => (
          <Chip key={f} label={f} active={catFilter === f} onPress={() => setCatFilter(f)} />
        ))}
      </ChipRow>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.md }}>
        <Text style={t.bodySm}>
          Showing <Text style={{ color: colors.text }}>{filtered.length}</Text> of {complaints.length}
        </Text>
        {filtersOn ? (
          <Pressable onPress={() => { setStatusFilter('All'); setPriFilter('All'); setCatFilter('All'); setSearch(''); }}>
            <Text style={[t.label, { color: colors.gold }]}>Clear filters</Text>
          </Pressable>
        ) : null}
      </View>

      {filtered.length === 0 ? (
        <Empty icon="briefcase" title="No complaints match filters" />
      ) : (
        filtered.map((c) => {
          const st = STATUS[c.status] || STATUS.OPEN;
          return (
            <Card key={c.id} style={[{ marginBottom: space.md }, isUnassigned(c) && { borderColor: 'rgba(240,106,106,0.35)' }]}>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: space.sm }}>
                <MonoTag label={shortId(c.id)} />
                <Badge label={st.label} tone={st.tone} icon={st.icon as IconName} />
                <Badge label={c.priority} tone={PRIORITY_TONE[c.priority]} />
                <Badge label={c.category} tone="neutral" />
                <Badge label={`📦 ${c.package}`} tone="neutral" />
                {isUnassigned(c) ? <Badge label="Unassigned" tone="danger" /> : null}
              </View>
              <Text style={t.h3}>{c.title}</Text>
              <Text style={[t.bodySm, { marginTop: 4 }]} numberOfLines={2}>
                {c.description}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm }}>
                <Text style={t.meta}>👤 {c.user}</Text>
                <Text style={t.meta}>📅 {c.date}</Text>
                <Text style={[t.meta, !c.assignedTo && { color: colors.danger }]}>⚖️ {c.assignedTo || 'Unassigned'}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg }}>
                {isUnassigned(c) ? <Button title="Assign" icon="user-plus" small style={{ flex: 1 }} onPress={() => openAssign(c)} /> : null}
                <Button title="View" icon="eye" small variant="secondary" style={{ flex: 1 }} onPress={() => { setNote(''); setSelected(c); }} />
              </View>
            </Card>
          );
        })
      )}

      {/* Detail sheet */}
      <Sheet
        visible={!!selected && !assignFor}
        onClose={() => setSelected(null)}
        title={selected?.title}
        footer={
          selected ? (
            <View style={{ gap: space.sm }}>
              <Button title={selected.assignedTo ? 'Reassign Lawyer' : 'Assign Lawyer'} icon="user-plus" onPress={() => openAssign(selected)} />
              {selected.status !== 'RESOLVED' ? (
                <Button
                  title="Mark Resolved"
                  icon="check-circle"
                  variant="success"
                  onPress={() => {
                    handleStatusChange(selected.id, 'RESOLVED');
                    setSelected(null);
                  }}
                />
              ) : null}
            </View>
          ) : null
        }
      >
        {selected ? (
          <>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: space.lg }}>
              <MonoTag label={shortId(selected.id)} />
              <Badge label={(STATUS[selected.status] || STATUS.OPEN).label} tone={(STATUS[selected.status] || STATUS.OPEN).tone} />
              <Badge label={selected.priority} tone={PRIORITY_TONE[selected.priority]} />
            </View>
            <InfoGrid
              items={[
                { label: 'Filed By', value: selected.user },
                { label: 'Email', value: selected.userEmail },
                { label: 'Phone', value: selected.userPhone },
                { label: 'Category', value: selected.category },
                { label: 'Filed On', value: selected.date },
                { label: 'Package', value: selected.package },
                { label: 'Hearing', value: selected.hearing },
                { label: 'Assigned To', value: selected.assignedTo || '—' },
              ]}
            />
            <Meta style={{ marginTop: space.xl }}>Case Description</Meta>
            <Text style={[t.body, { color: colors.textMuted, marginTop: 4, marginBottom: space.xl }]}>{selected.description}</Text>
            <Meta style={{ marginBottom: space.sm }}>Update Status</Meta>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: space.xl }}>
              {['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].map((s) => (
                <Chip key={s} label={s} active={selected.status === s} onPress={() => handleStatusChange(selected.id, s)} />
              ))}
            </View>
            <Input
              label="Admin Note / Response"
              multiline
              placeholder="Add a note, assignment reason, or resolution summary..."
              value={note}
              onChangeText={setNote}
            />
          </>
        ) : null}
      </Sheet>

      {/* Assign sheet */}
      <Sheet
        visible={!!assignFor}
        onClose={() => setAssignFor(null)}
        title="Assign Lawyer"
        footer={<Button title="Assign Lawyer" icon="check" disabled={!assignPick} onPress={handleAssign} />}
      >
        {assignFor ? (
          <>
            <Text style={[t.bodySm, { marginBottom: space.lg }]}>
              Assigning lawyer for: <Text style={{ color: colors.text }}>{shortId(assignFor.id)} — {assignFor.title}</Text>
            </Text>
            {lawyers.length === 0 ? <Empty icon="users" title="No lawyers available" /> : null}
            {lawyers.map((l) => {
              const on = assignPick === l.id;
              return (
                <Pressable
                  key={l.id}
                  onPress={() => setAssignPick(l.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.md,
                    padding: space.md,
                    marginBottom: space.sm,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: on ? colors.gold : colors.border,
                    backgroundColor: on ? colors.goldDim : colors.surface2,
                  }}
                >
                  <Avatar name={l.name} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={t.label}>{l.name}</Text>
                    {l.lawyerProfile?.specialization ? <Text style={t.meta}>{l.lawyerProfile.specialization}</Text> : null}
                  </View>
                  {on ? <Feather name="check" size={16} color={colors.gold} /> : null}
                </Pressable>
              );
            })}
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}
