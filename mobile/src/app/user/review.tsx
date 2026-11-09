/**
 * Case summary shown after documents are uploaded.
 * Reads the real complaint (?case=<id>); without an id there is nothing to
 * review, so we send the user to their complaints list.
 */
import React, { useCallback, useState } from 'react';
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getComplaintById } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import { Badge, Banner, Button, Card, Empty, IconName, InfoRow, Loader, MonoTag, PageHeader, Screen, SectionTitle } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { fmtDateGB, formatLKR, PRIORITY_TONE, priorityLabel, shortId, STATUS } from '@/utils/format';

const DOC_LABELS: Record<string, string> = {
  id: 'ID proof',
  idProof: 'ID proof',
  complaint: 'Complaint letter',
  evidence: 'Evidence',
  other: 'Other',
};

const fileName = (url: string) => decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'document');

export default function Review() {
  const router = useRouter();
  const { user } = useAuth();
  const { case: caseId } = useLocalSearchParams<{ case?: string }>();
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(!!caseId);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!caseId) return;
    try {
      const res = await getComplaintById(caseId);
      if (res.success) setC(res.data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not load this case.');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!caseId) return <Redirect href="/user/complaints" />;
  if (loading) return <Loader rows={2} />;
  if (!c) {
    return (
      <Screen>
        <PageHeader back eyebrow="Case summary" title="Review" />
        <Empty
          icon="wifi-off"
          title="Can't load this case"
          subtitle={error || 'It may have been removed.'}
          action={{ label: 'Try again', icon: 'refresh-cw', onPress: () => { setLoading(true); load(); } }}
        />
      </Screen>
    );
  }

  const st = STATUS[c.status] || STATUS.OPEN;
  const docs: any[] = c.documents || [];
  const sections: { icon: IconName; title: string; items: { label: string; value?: string }[] }[] = [
    {
      icon: 'user',
      title: 'Your information',
      items: [
        { label: 'Full name', value: c.client?.name || user?.name },
        { label: 'Email', value: c.client?.email || user?.email },
        { label: 'Phone', value: c.client?.phone || '—' },
      ],
    },
    {
      icon: 'briefcase',
      title: 'Case details',
      items: [
        { label: 'Category', value: c.category },
        { label: 'Title', value: c.title },
        { label: 'Description', value: c.description },
        ...(c.location ? [{ label: 'Location', value: c.location }] : []),
        ...(c.incidentDate ? [{ label: 'Incident date', value: fmtDateGB(c.incidentDate) }] : []),
      ],
    },
    {
      icon: 'package',
      title: 'Package & lawyer',
      items: [
        { label: 'Package', value: c.package?.name || 'Not selected' },
        ...(c.package ? [{ label: 'Price', value: `${formatLKR(c.package.price)} ${c.package.period || ''}`.trim() }] : []),
        { label: 'Lawyer', value: c.assignedTo?.name || 'Awaiting assignment' },
      ],
    },
  ];

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Button title="Dashboard" variant="secondary" onPress={() => router.replace('/user')} />
          <Button title="View case" iconRight="arrow-right" style={{ flex: 1 }} onPress={() => router.replace(`/user/complaint/${c.id}`)} />
        </View>
      }
    >
      <PageHeader back eyebrow="Case summary" title="Review" subtitle="Here's everything we have on file for this case." />

      <Banner
        tone={c.assignedTo ? 'success' : 'info'}
        icon={c.assignedTo ? 'check-circle' : 'clock'}
        text={c.assignedTo ? `${c.assignedTo.name} is handling your case.` : "Submitted — we'll notify you as soon as a lawyer is assigned."}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: space.lg }}>
        <MonoTag label={shortId(c.id)} />
        <Badge label={st.label} tone={st.tone} icon={st.icon as IconName} />
        {c.priority ? <Badge label={priorityLabel(c.priority)} tone={PRIORITY_TONE[c.priority]} /> : null}
        <Badge label={`Filed ${fmtDateGB(c.createdAt)}`} tone="neutral" icon="calendar" />
      </View>

      {sections.map((s) => (
        <Card key={s.title} style={{ marginBottom: space.lg }}>
          <SectionTitle title={s.title} icon={s.icon} />
          {s.items.map((it, i) => (
            <InfoRow key={it.label} label={it.label} value={it.value || '—'} last={i === s.items.length - 1} />
          ))}
        </Card>
      ))}

      <Card>
        <SectionTitle
          title={`Documents (${docs.length})`}
          icon="file-text"
          action="Add"
          onAction={() => router.push(`/user/upload?case=${c.id}&from=details`)}
        />
        {docs.length === 0 ? (
          <Text style={t.bodySm}>No documents uploaded yet.</Text>
        ) : (
          docs.map((d, i) => (
            <View
              key={d.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                paddingVertical: space.sm,
                borderBottomWidth: i === docs.length - 1 ? 0 : 0.5,
                borderBottomColor: colors.border,
              }}
            >
              <Feather name="check-circle" size={16} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={t.label}>{DOC_LABELS[d.type] || d.type}</Text>
                <Text style={t.bodySm} numberOfLines={1}>{fileName(d.url)}</Text>
              </View>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
