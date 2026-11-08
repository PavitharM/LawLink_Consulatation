import React, { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';
import { getComplaintById } from '@/api/services';
import { fileUrl } from '@/api/client';
import { Timeline } from '@/components/shared';
import { Avatar, Badge, Button, Card, Empty, IconName, InfoGrid, Loader, Meta, MonoTag, PageHeader, Screen, SectionTitle } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { PRIORITY_TONE, shortId, STATUS } from '@/utils/format';

export default function ComplaintDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const res = await getComplaintById(id);
          if (res.success) setC(res.data);
        } catch (e) {
          console.warn(e);
        } finally {
          setLoading(false);
        }
      })();
    }, [id])
  );

  if (loading) return <Loader />;
  if (!c)
    return (
      <Screen>
        <PageHeader back title="Not found" />
        <Empty icon="alert-circle" title="Complaint not found" />
      </Screen>
    );

  const st = STATUS[c.status] || STATUS.OPEN;
  const done = c.status === 'RESOLVED' || c.status === 'CLOSED';

  return (
    <Screen>
      <PageHeader back index={shortId(c.id)} eyebrow="Complaint" title={c.title} />
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: -space.md, marginBottom: space.xl }}>
        <MonoTag label={shortId(c.id)} />
        <Badge label={st.label} tone={st.tone} icon={st.icon as IconName} />
        <Badge label={`${c.priority} Priority`} tone={PRIORITY_TONE[c.priority]} />
        <Badge label={c.category} tone="neutral" />
      </View>

      {/* Assigned lawyer */}
      <Card variant={c.assignedTo ? 'default' : 'gold'} style={{ marginBottom: space.lg }}>
        <Meta style={{ marginBottom: space.md }}>Assigned Lawyer</Meta>
        {c.assignedTo ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Avatar name={c.assignedTo.name} size={48} gold />
            <View style={{ flex: 1 }}>
              <Text style={t.h3}>{c.assignedTo.name}</Text>
              <Text style={t.bodySm}>Assigned Lawyer</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success }} />
                <Text style={[t.meta, { color: colors.success }]}>Currently online</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <Text style={t.h3}>⏳ Pending Assignment</Text>
            <Text style={t.bodySm}>A lawyer will be assigned soon.</Text>
          </>
        )}
      </Card>

      {c.hearingDate ? (
        <Card variant="white" style={{ marginBottom: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Feather name="calendar" size={24} color={colors.onGold} />
          <View>
            <Text style={[t.label, { color: colors.onGold }]}>Next Court Hearing</Text>
            <Text style={[t.h2, { color: colors.onGold }]}>{new Date(c.hearingDate).toLocaleDateString()}</Text>
          </View>
        </Card>
      ) : null}

      <Card style={{ marginBottom: space.lg }}>
        <SectionTitle title="Case Information" icon="file-text" />
        <InfoGrid
          items={[
            { label: 'Filed On', value: new Date(c.createdAt).toLocaleDateString() },
            { label: 'Incident Date', value: c.incidentDate ? new Date(c.incidentDate).toLocaleDateString() : 'N/A' },
            { label: 'Location', value: c.location || 'N/A' },
            { label: 'Opposing Party', value: c.opposingParty || 'N/A' },
            { label: 'Package', value: c.package?.name || 'Standard Representation' },
            { label: 'Case ID', value: shortId(c.id) },
          ]}
        />
        <Meta style={{ marginTop: space.xl }}>Description</Meta>
        <Text style={[t.body, { marginTop: 4, color: colors.textMuted }]}>{c.description}</Text>
      </Card>

      <Card style={{ marginBottom: space.lg }}>
        <SectionTitle title="Uploaded Documents" icon="paperclip" />
        {c.documents?.length ? (
          c.documents.map((d: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.goldDim, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="file-text" size={16} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={t.label}>{d.type}</Text>
                <Text style={t.meta}>Uploaded {new Date(d.createdAt).toLocaleDateString()}</Text>
              </View>
              <Button title="Download" icon="download" small variant="secondary" onPress={() => WebBrowser.openBrowserAsync(fileUrl(d.url)!)} />
            </View>
          ))
        ) : (
          <Text style={t.bodySm}>No documents uploaded.</Text>
        )}
      </Card>

      <Card style={{ marginBottom: space.lg }}>
        <SectionTitle title="Quick Actions" />
        <View style={{ gap: space.sm }}>
          {c.assignedTo ? (
            <Button title="Consultation" icon="message-square" onPress={() => router.push(`/user/consultation?lawyerId=${c.assignedTo.id}`)} />
          ) : null}
          <Button title="Upload More Documents" icon="upload" variant="secondary" onPress={() => router.push(`/user/upload?case=${c.id}&from=details`)} />
        </View>
      </Card>

      <Card>
        <SectionTitle title="Case Timeline" />
        <Timeline
          items={[
            { event: 'Complaint Filed', date: new Date(c.createdAt).toLocaleDateString(), done: true },
            { event: 'Payment Received', date: new Date(c.createdAt).toLocaleDateString(), done: !!c.packageId },
            { event: 'Lawyer Assigned', date: c.assignedTo ? 'Completed' : 'Pending', done: !!c.assignedTo },
            { event: 'Documents Reviewed by Lawyer', date: 'Pending', done },
            { event: 'Resolution', date: 'TBD', done },
          ]}
        />
      </Card>
    </Screen>
  );
}
