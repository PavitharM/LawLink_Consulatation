import React, { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getComplaintById, getMessages, rejectAssignment, sendMessage, updateComplaintStatus } from '@/api/services';
import { fileUrl } from '@/api/client';
import DateField from '@/components/DateField';
import { ChatThread, Timeline } from '@/components/shared';
import { Badge, Button, Card, Chip, ChipRow, Empty, InfoGrid, Input, Loader, MonoTag, PageHeader, Screen, SectionTitle, SelectField } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { fmtDateGB, PRIORITY_TONE, shortId, STATUS } from '@/utils/format';

type Tab = 'overview' | 'documents' | 'chat' | 'resolution';
const TABS: Tab[] = ['overview', 'documents', 'chat', 'resolution'];

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function ComplaintReview() {
  const { id, tab: initialTab } = useLocalSearchParams<{ id: string; tab?: Tab }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>(initialTab && TABS.includes(initialTab) ? initialTab : 'overview');
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [outcome, setOutcome] = useState('');
  const [resolution, setResolution] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getComplaintById(id);
        if (res.success) {
          setC(res.data);
          setOutcome(res.data.resolutionOutcome || '');
          setResolution(res.data.resolutionSummary || '');
          if (res.data.hearingDate) setHearingDate(toLocalInput(res.data.hearingDate));
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const clientId = c?.client?.id;
  const fetchChat = useCallback(async () => {
    if (!clientId) return;
    try {
      const r = await getMessages(clientId);
      if (r.success) setChat(r.data);
    } catch {}
  }, [clientId]);

  useEffect(() => {
    if (tab !== 'chat' || !clientId) return;
    const first = setTimeout(fetchChat, 0);
    const i = setInterval(fetchChat, 3000);
    return () => {
      clearTimeout(first);
      clearInterval(i);
    };
  }, [tab, clientId, fetchChat]);

  const send = async () => {
    if (!msg.trim() || !clientId) return;
    const text = msg;
    setMsg('');
    setChat((p) => [...p, { id: Date.now().toString(), senderId: 'me', text, createdAt: new Date().toISOString() }]);
    try {
      await sendMessage(clientId, text);
    } catch {}
  };

  const patch = async (payload: any) => {
    setBusy(true);
    try {
      return await updateComplaintStatus(id, payload);
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async () => {
    const r = await patch({ status: 'IN_REVIEW' });
    if (r?.success) setC((p: any) => ({ ...p, status: 'IN_REVIEW' }));
  };

  const handleReject = () =>
    Alert.alert('Reject case?', 'This case will be returned for reassignment.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            const r = await rejectAssignment(id);
            if (r.success) router.replace('/lawyer');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not reject case.');
          }
        },
      },
    ]);

  const hearingPayload = () => (hearingDate ? new Date(hearingDate).toISOString() : undefined);

  const handleResolve = async () => {
    const r = await patch({ status: 'RESOLVED', resolutionOutcome: outcome, resolutionSummary: resolution, hearingDate: hearingPayload() });
    if (r?.success) {
      setC((p: any) => ({ ...p, status: 'RESOLVED', resolutionOutcome: outcome, resolutionSummary: resolution }));
      setTab('overview');
    }
  };

  const handleSaveDraft = async () => {
    const r = await patch({ resolutionOutcome: outcome, resolutionSummary: resolution, hearingDate: hearingPayload() });
    if (r?.success) {
      setC((p: any) => ({ ...p, resolutionOutcome: outcome, resolutionSummary: resolution }));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    }
  };

  if (loading) return <Loader />;
  if (!c)
    return (
      <Screen>
        <PageHeader back title="Case not found." />
      </Screen>
    );

  const st = STATUS[c.status] || STATUS.OPEN;

  const header = (
    <>
      <PageHeader back={() => router.back()} index={shortId(c.id)} eyebrow="Case review" title={c.title} />
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: -space.md, marginBottom: space.lg }}>
        <MonoTag label={shortId(c.id)} />
        <Badge label={c.status} tone={st.tone} icon="clock" />
        <Badge label={`${c.priority} Priority`} tone={PRIORITY_TONE[c.priority]} />
      </View>
      {c.status === 'OPEN' ? (
        <View style={{ flexDirection: 'row', gap: space.md, marginBottom: space.lg }}>
          <Button title="Reject Case" variant="danger" style={{ flex: 1 }} onPress={handleReject} />
          <Button title="Accept Case" style={{ flex: 1 }} loading={busy} onPress={handleAccept} />
        </View>
      ) : null}
      <ChipRow>
        {TABS.map((tb) => (
          <Chip key={tb} label={tb.charAt(0).toUpperCase() + tb.slice(1)} active={tab === tb} onPress={() => setTab(tb)} />
        ))}
      </ChipRow>
    </>
  );

  // Chat needs a fixed-height layout rather than a scroll view
  if (tab === 'chat') {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: insets.bottom }}>
          {header}
          <ChatThread
            messages={chat}
            isMine={(m) => m.senderId !== clientId}
            theirLabel="C"
            msg={msg}
            setMsg={setMsg}
            onSend={send}
            placeholder="Send a message to your client..."
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <Screen>
      {header}

      {tab === 'overview' && (
        <>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Client Information" icon="user" />
            <InfoGrid
              items={[
                { label: 'Name', value: c.client?.name || 'Unknown' },
                { label: 'Email', value: c.client?.email || 'N/A' },
                { label: 'Phone', value: c.client?.phone || 'N/A' },
                { label: 'Package', value: c.package?.name || 'None' },
                { label: 'Category', value: c.category },
                { label: 'Filed On', value: fmtDateGB(c.createdAt) },
              ]}
            />
          </Card>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Case Description" icon="file-text" />
            <Text style={[t.body, { color: colors.textMuted }]}>{c.description}</Text>
          </Card>
          <Card style={{ marginBottom: space.lg }}>
            <SectionTitle title="Scheduled Hearings" icon="calendar" />
            {c.hearingDate ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={t.h3}>{fmtDateGB(c.hearingDate)}</Text>
                <Badge label="Scheduled" tone="info" />
              </View>
            ) : (
              <Text style={t.bodySm}>No hearings scheduled.</Text>
            )}
          </Card>
          {c.status === 'RESOLVED' && (c.resolutionOutcome || c.resolutionSummary) ? (
            <Card variant="gold" style={{ marginBottom: space.lg }}>
              <SectionTitle title="Resolution" icon="check-circle" />
              <Text style={t.label}>{c.resolutionOutcome}</Text>
              <Text style={[t.bodySm, { marginTop: 4 }]}>{c.resolutionSummary}</Text>
            </Card>
          ) : null}
          <Card>
            <SectionTitle title="Case Timeline" />
            <Timeline
              items={[
                { event: 'Complaint Filed', date: fmtDateGB(c.createdAt), done: true },
                { event: 'Lawyer Assigned', date: c.updatedAt ? fmtDateGB(c.updatedAt) : 'N/A', done: !!c.assignedToId },
                { event: 'Final Resolution', date: c.status === 'RESOLVED' ? fmtDateGB(c.updatedAt) : 'TBD', done: c.status === 'RESOLVED' },
              ]}
            />
          </Card>
        </>
      )}

      {tab === 'documents' && (
        <Card>
          {c.documents?.length ? (
            c.documents.map((d: any, i: number) => (
              <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md }, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.goldDim, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="paperclip" size={18} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[t.label, { textTransform: 'capitalize' }]}>{d.type ? d.type.replace('_', ' ') : 'Document'}</Text>
                  <Text style={t.meta}>Uploaded {fmtDateGB(d.createdAt)}</Text>
                </View>
                <Button title="View" icon="eye" small variant="secondary" onPress={() => WebBrowser.openBrowserAsync(fileUrl(d.url)!)} />
              </View>
            ))
          ) : (
            <Empty icon="paperclip" title="No documents uploaded." />
          )}
        </Card>
      )}

      {tab === 'resolution' && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Feather name="check-circle" size={18} color={colors.gold} />
              <Text style={t.h3}>Submit Case Resolution</Text>
            </View>
            {draftSaved ? <Badge label="Draft Saved" tone="success" icon="check-circle" /> : null}
          </View>
          <SelectField
            label="Outcome"
            required
            value={outcome}
            placeholder="Select outcome..."
            options={["Resolved in client's favor", 'Settled out of court', 'Case dismissed', 'Ongoing (requires extension)']}
            onChange={setOutcome}
          />
          <Input
            label="Resolution Summary"
            required
            multiline
            style={{ minHeight: 120 }}
            placeholder="Describe the outcome and key actions taken... (You can save this as a draft)"
            value={resolution}
            onChangeText={setResolution}
          />
          <DateField label="Final Court Date & Time (Optional)" mode="datetime" value={hearingDate} onChange={setHearingDate} placeholder="Select date & time" />
          <View style={{ gap: space.sm }}>
            <Button title="Mark as Resolved" disabled={!outcome || !resolution} loading={busy} onPress={handleResolve} />
            <Button title="Save Draft" variant="secondary" disabled={busy} onPress={handleSaveDraft} />
          </View>
        </Card>
      )}
    </Screen>
  );
}
