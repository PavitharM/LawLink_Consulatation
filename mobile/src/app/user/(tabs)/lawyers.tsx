import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { assignLawyer, getComplaints, getLawyers } from '@/api/services';
import { Avatar, Badge, Banner, Button, Card, Checkbox, Chip, ChipRow, Empty, InfoGrid, Input, Loader, PageHeader, Screen, SelectField, Sheet } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { shortId } from '@/utils/format';

const specializations = ['All', 'Civil Law', 'Criminal Law', 'Family Law', 'Labour Law', 'Property Law', 'Corporate Law'];

export default function SearchLawyers() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [availOnly, setAvailOnly] = useState(false);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [userComplaints, setUserComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const [lRes, cRes] = await Promise.all([getLawyers(), getComplaints()]);
      if (lRes.success) setLawyers(lRes.data);
      if (cRes.success) setUserComplaints(cRes.data.filter((c: any) => c.status === 'OPEN' && !c.assignedToId));
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

  const closeProfile = () => {
    setSelected(null);
    setShowAssign(false);
    setSuccessMsg('');
  };

  const handleRequest = async () => {
    if (!selectedComplaintId || !selected) return;
    setRequesting(true);
    try {
      const res = await assignLawyer(selectedComplaintId, selected.id);
      if (res.success) {
        setSuccessMsg('Request sent successfully!');
        setTimeout(() => {
          setSuccessMsg('');
          setShowAssign(false);
          setSelected(null);
          setUserComplaints((prev) => prev.filter((c) => c.id !== selectedComplaintId));
          setSelectedComplaintId('');
        }, 2000);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <Loader />;

  const q = search.toLowerCase();
  const filtered = lawyers.filter((l) => {
    const p = l.lawyerProfile || {};
    const matchSearch =
      l.name?.toLowerCase().includes(q) || p.specialization?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q);
    const matchSpec = specFilter === 'All' || p.specialization === specFilter;
    const matchAvail = !availOnly || p.availability === 'Available';
    return matchSearch && matchSpec && matchAvail;
  });

  const sp = selected?.lawyerProfile || {};
  const selAvailable = sp.availability !== 'Unavailable';

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <PageHeader
        index="003"
        eyebrow="Directory"
        title="Find a Lawyer"
        subtitle="Browse verified legal professionals across Sri Lanka. All lawyers are Bar Association registered."
      />

      <Input icon="search" placeholder="Search by name, specialization, or city..." value={search} onChangeText={setSearch} containerStyle={{ marginBottom: space.md }} />
      <ChipRow>
        {specializations.map((s) => (
          <Chip key={s} label={s} active={specFilter === s} onPress={() => setSpecFilter(s)} />
        ))}
      </ChipRow>
      <Checkbox checked={availOnly} onChange={setAvailOnly}>
        <Text style={t.bodySm}>Available Only</Text>
      </Checkbox>

      <Text style={[t.meta, { marginBottom: space.md }]}>{filtered.length} LAWYERS FOUND</Text>

      {filtered.length === 0 ? <Empty icon="users" title="No lawyers found" subtitle="Try a different search or filter." /> : null}

      {filtered.map((l) => {
        const p = l.lawyerProfile || {};
        const available = p.availability !== 'Unavailable';
        return (
          <Card key={l.id} style={{ marginBottom: space.md }}>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              <View>
                <Avatar name={l.name} size={52} />
                <View style={[dot, { backgroundColor: available ? colors.success : colors.textDim }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={t.h3}>{l.name}</Text>
                <Text style={[t.label, { color: colors.gold }]}>{p.specialization || 'General'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Feather name="map-pin" size={11} color={colors.textDim} />
                  <Text style={t.meta}>
                    {p.location || 'Anywhere'} • {p.experience || 0} yrs
                  </Text>
                </View>
              </View>
            </View>
            <Text style={[t.bodySm, { marginTop: space.md }]} numberOfLines={2}>
              {p.bio || 'Experienced lawyer'}
            </Text>
            {Array.isArray(p.languages) && p.languages.length ? (
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: space.sm }}>
                {p.languages.map((lang: string) => (
                  <Badge key={lang} label={lang} tone="neutral" />
                ))}
              </View>
            ) : null}
            <View style={statsRow}>
              <MiniStat label="Rating" value="★ 4.8" />
              <MiniStat label="Cases" value="20+" />
              <MiniStat label="Reviews" value="15+" />
              <MiniStat label="Fee" value={`₹${p.consultationFee || '500'}`} />
            </View>
            <Button title="View Profile" small variant="secondary" onPress={() => setSelected(l)} />
          </Card>
        );
      })}

      <Sheet
        visible={!!selected}
        onClose={closeProfile}
        footer={
          showAssign ? null : (
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <Button title="Close" variant="secondary" style={{ flex: 1 }} onPress={closeProfile} />
              <Button title="Request Lawyer" style={{ flex: 1 }} onPress={() => setShowAssign(true)} />
            </View>
          )
        }
      >
        {selected ? (
          <>
            <View style={{ alignItems: 'center', marginBottom: space.xl }}>
              <Avatar name={selected.name} size={72} gold />
              <Text style={[t.h2, { marginTop: space.md }]}>{selected.name}</Text>
              <Text style={[t.label, { color: colors.gold }]}>{sp.specialization || 'General'}</Text>
              <Text style={[t.bodySm, { marginTop: 4 }]}>{sp.location || 'Anywhere'}</Text>
              <View style={{ marginTop: space.sm }}>
                <Badge label={selAvailable ? 'Available for new cases' : 'Not available'} tone={selAvailable ? 'success' : 'neutral'} />
              </View>
            </View>
            {sp.bio ? <Text style={[t.body, { color: colors.textMuted, marginBottom: space.xl }]}>{sp.bio}</Text> : null}
            <InfoGrid
              items={[
                { label: 'Experience', value: `${sp.experience || 0} yrs` },
                { label: 'Cases Handled', value: '20+' },
                { label: 'Rating', value: '4.8 ★ (15+ reviews)' },
                { label: 'Consultation Fee', value: `₹${sp.consultationFee || '500'}` },
                { label: 'Languages', value: (sp.languages || []).join?.(', ') },
              ]}
            />

            {showAssign ? (
              <Card variant="gold" style={{ marginTop: space.xl }}>
                <Text style={[t.h3, { marginBottom: space.md }]}>Select a Case to Assign</Text>
                {userComplaints.length === 0 ? (
                  <>
                    <Text style={[t.bodySm, { marginBottom: space.md }]}>You don't have any open, unassigned cases.</Text>
                    <Button title="Create a new case" small onPress={() => { closeProfile(); router.push('/user/new-complaint'); }} />
                  </>
                ) : (
                  <>
                    <SelectField
                      value={selectedComplaintId}
                      placeholder="-- Choose a Case --"
                      options={userComplaints.map((c) => ({ value: c.id, label: `${c.title} (${shortId(c.id)})` }))}
                      onChange={setSelectedComplaintId}
                    />
                    {successMsg ? (
                      <Banner text={successMsg} />
                    ) : (
                      <View style={{ flexDirection: 'row', gap: space.md }}>
                        <Button title="Cancel" variant="secondary" small style={{ flex: 1 }} onPress={() => setShowAssign(false)} />
                        <Button title="Send Request" small style={{ flex: 1 }} loading={requesting} disabled={!selectedComplaintId} onPress={handleRequest} />
                      </View>
                    )}
                  </>
                )}
              </Card>
            ) : null}
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={[t.meta, { textTransform: 'uppercase' }]}>{label}</Text>
    <Text style={[t.label, { marginTop: 2 }]}>{value}</Text>
  </View>
);

const dot = {
  position: 'absolute' as const,
  right: 1,
  bottom: 1,
  width: 12,
  height: 12,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: colors.surface,
};
const statsRow = {
  flexDirection: 'row' as const,
  marginVertical: space.lg,
  paddingVertical: space.md,
  borderTopWidth: 0.5,
  borderBottomWidth: 0.5,
  borderColor: colors.border,
};
