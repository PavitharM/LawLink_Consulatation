import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createComplaint, uploadFile } from '@/api/services';
import DateField from '@/components/DateField';
import { COMPLAINT_SLOTS, DocSlotList, useDocUploads } from '@/components/DocSlots';
import { Banner, Button, Card, InfoRow, Input, Label, Meta, PageHeader, Screen } from '@/components/ui';
import { colors, fonts, radius, space, toneColors, type as t } from '@/theme';
import { fmtSize } from '@/utils/format';

const categories = [
  { value: 'civil', emoji: '🏠', label: 'Civil Law', desc: 'Property, contracts, torts' },
  { value: 'criminal', emoji: '⚖️', label: 'Criminal Law', desc: 'FIR, bail, defense' },
  { value: 'family', emoji: '👨‍👩‍👧', label: 'Family Law', desc: 'Divorce, custody, adoption' },
  { value: 'labour', emoji: '💼', label: 'Labour Law', desc: 'Employment, termination, wages' },
  { value: 'consumer', emoji: '🛒', label: 'Consumer Law', desc: 'Fraud, product defects' },
  { value: 'property', emoji: '🏗️', label: 'Property Law', desc: 'Ownership, disputes, registry' },
  { value: 'corporate', emoji: '🏢', label: 'Corporate Law', desc: 'Business, contracts, IP' },
  { value: 'other', emoji: '📋', label: 'Other', desc: 'Any other legal matter' },
];

const STEPS = ['Basic Info', 'Case Details', 'Documents', 'Review'];

export default function SubmitComplaint() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', category: '', priority: 'MEDIUM', description: '', incidentDate: '', location: '', opposingParty: '', additionalInfo: '',
  });
  const update = (f: keyof typeof form, v: string) => setForm((p) => ({ ...p, [f]: v }));
  const docs = useDocUploads(COMPLAINT_SLOTS);

  const step1Ok = form.title.length >= 5 && !!form.category;
  const step2Ok = form.description.length >= 10;

  const handleSubmit = async () => {
    if (form.title.length < 5) return Alert.alert('Check title', 'Title must be at least 5 characters.');
    if (form.description.length < 10) return Alert.alert('Check description', 'Description must be at least 10 characters.');
    try {
      setSubmitting(true);
      const payload: any = { ...form };
      if (!payload.incidentDate) delete payload.incidentDate;
      else payload.incidentDate = new Date(payload.incidentDate).toISOString();
      if (!payload.location) delete payload.location;
      if (!payload.opposingParty) delete payload.opposingParty;
      if (!payload.additionalInfo) delete payload.additionalInfo;

      const res = await createComplaint(payload);
      if (res.success) {
        const complaintId = res.data.id;
        const jobs = Object.entries(docs.uploads).flatMap(([slotId, files]) =>
          files.filter((f) => !f.tooLarge).map((f) => uploadFile(complaintId, slotId, { uri: f.uri, name: f.name, mimeType: f.mimeType }))
        );
        if (jobs.length) await Promise.allSettled(jobs);
        router.replace(`/user/packages?complaintId=${complaintId}`);
      }
    } catch (e: any) {
      Alert.alert('Submission failed', e?.message || 'Please try again.');
      setSubmitting(false);
    }
  };

  const footer =
    step === 1 ? (
      <Button title="Next: Case Details" iconRight="chevron-right" disabled={!step1Ok} onPress={() => setStep(2)} />
    ) : step === 2 ? (
      <Nav back={() => setStep(1)} next={<Button title="Next: Upload Documents" iconRight="chevron-right" disabled={!step2Ok} onPress={() => setStep(3)} style={{ flex: 1 }} />} />
    ) : step === 3 ? (
      <Nav back={() => setStep(2)} next={<Button title="Next: Review" iconRight="chevron-right" disabled={!docs.complete} onPress={() => setStep(4)} style={{ flex: 1 }} />} />
    ) : (
      <Nav back={() => setStep(3)} next={<Button title="Submit & Choose Package" icon="arrow-right" loading={submitting} onPress={handleSubmit} style={{ flex: 1 }} />} />
    );

  return (
    <Screen footer={footer}>
      <PageHeader back index={`Step ${step} / 4`} eyebrow={STEPS[step - 1]} title="Submit New Complaint" subtitle="Provide details about your legal issue and attach supporting documents." />

      {/* Step bar */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.xl }}>
        {STEPS.map((label, i) => {
          const s = i + 1;
          const done = step > s;
          const cur = step === s;
          return (
            <React.Fragment key={s}>
              <View style={{ alignItems: 'center', width: 64 }}>
                <View
                  style={{
                    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: done || cur ? colors.gold : colors.surface3,
                    borderWidth: cur ? 3 : 0, borderColor: colors.goldDim,
                  }}
                >
                  {done ? <Feather name="check" size={13} color={colors.onGold} /> : <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: cur ? colors.onGold : colors.textDim }}>{s}</Text>}
                </View>
                <Text style={[t.meta, { marginTop: 4, textAlign: 'center' }, (done || cur) && { color: colors.text }]}>{label}</Text>
              </View>
              {s < STEPS.length ? <View style={{ flex: 1, height: 1.5, marginTop: 14, backgroundColor: done ? colors.gold : colors.border }} /> : null}
            </React.Fragment>
          );
        })}
      </View>

      {step === 1 && (
        <>
          <Input label="Complaint Title" required placeholder="E.g., Property Boundary Dispute with Neighbor" value={form.title} onChangeText={(v) => update('title', v)} hint="Be specific. Good titles help lawyers identify your issue faster." />
          <Label required>Category</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.xl }}>
            {categories.map((c) => {
              const on = form.category === c.value;
              return (
                <Pressable
                  key={c.value}
                  onPress={() => update('category', c.value)}
                  style={{
                    width: '48.5%', padding: space.md, borderRadius: radius.md, borderWidth: 1,
                    borderColor: on ? colors.gold : colors.border, backgroundColor: on ? colors.goldDim : colors.surface,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
                  <Text style={[t.label, { marginTop: 6 }]}>{c.label}</Text>
                  <Text style={[t.meta, { textTransform: 'none' }]}>{c.desc}</Text>
                  {on ? <Feather name="check-circle" size={14} color={colors.gold} style={{ position: 'absolute', top: 10, right: 10 }} /> : null}
                </Pressable>
              );
            })}
          </View>
          <Label>Priority Level</Label>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => {
              const on = form.priority === p;
              const tone = toneColors[p === 'HIGH' ? 'danger' : p === 'MEDIUM' ? 'warning' : 'success'];
              return (
                <Pressable
                  key={p}
                  onPress={() => update('priority', p)}
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, alignItems: 'center',
                    borderColor: on ? tone.fg : colors.border, backgroundColor: on ? tone.bg : colors.surface,
                  }}
                >
                  <Text style={[t.label, { color: on ? tone.fg : colors.textMuted }]}>{p === 'LOW' ? 'Low' : p === 'MEDIUM' ? 'Medium' : 'High'}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <Input
            label="Detailed Description"
            required
            multiline
            numberOfLines={6}
            style={{ minHeight: 140 }}
            placeholder="Describe your legal issue in full detail. Include what happened, when, who was involved, and what outcome you're seeking..."
            value={form.description}
            onChangeText={(v) => update('description', v)}
            hint={`${form.description.length} / 200+ characters recommended`}
          />
          <DateField label="Date of Incident" value={form.incidentDate} onChange={(v) => update('incidentDate', v)} />
          <Input label="Location of Incident" placeholder="e.g., Colombo, Western Province" value={form.location} onChangeText={(v) => update('location', v)} />
          <Input label="Opposing Party / Defendant Name" placeholder="Name of person, organization, or company (if applicable)" value={form.opposingParty} onChangeText={(v) => update('opposingParty', v)} />
          <Input label="Additional Information" multiline placeholder="Any previous legal steps taken, police complaint numbers, FIR details, etc." value={form.additionalInfo} onChangeText={(v) => update('additionalInfo', v)} />
        </>
      )}

      {step === 3 && (
        <>
          <Card variant="gold" style={{ marginBottom: space.lg }}>
            <Text style={t.label}>Attach Supporting Documents</Text>
            <Text style={[t.bodySm, { marginTop: 4 }]}>Upload your ID and complaint document (required). Add evidence or contracts to strengthen your case.</Text>
            <View style={{ flexDirection: 'row', gap: space.lg, marginTop: space.md, flexWrap: 'wrap' }}>
              <Text style={t.bodySm}>
                Required: <Text style={{ color: colors.text }}>{docs.requiredDone}/{docs.requiredSlots.length}</Text>
              </Text>
              <Text style={t.bodySm}>
                Total files: <Text style={{ color: colors.text }}>{docs.valid.length}</Text>
              </Text>
              {docs.complete ? <Text style={[t.bodySm, { color: colors.success }]}>✓ All required docs added</Text> : null}
            </View>
          </Card>
          <DocSlotList slots={COMPLAINT_SLOTS} uploads={docs.uploads} onPick={docs.pick} onRemove={docs.remove} />
          {docs.hasOversized ? <View style={{ marginTop: space.lg }}><Banner tone="danger" text="Remove oversized files before proceeding." /></View> : null}
        </>
      )}

      {step === 4 && (
        <>
          <Card style={{ marginBottom: space.lg }}>
            <Text style={[t.h3, { marginBottom: space.sm }]}>Review Your Complaint</Text>
            <InfoRow label="Title" value={form.title} />
            <InfoRow label="Category" value={categories.find((c) => c.value === form.category)?.label || form.category} />
            <InfoRow label="Priority" value={form.priority} />
            <InfoRow label="Incident Date" value={form.incidentDate || 'Not specified'} />
            <InfoRow label="Location" value={form.location || 'Not specified'} />
            <InfoRow label="Opposing Party" value={form.opposingParty || 'Not specified'} last />
            <Meta style={{ marginTop: space.lg }}>Description</Meta>
            <Text style={[t.body, { marginTop: 4 }]}>{form.description}</Text>
          </Card>
          <Card style={{ marginBottom: space.lg }}>
            <Meta style={{ marginBottom: space.sm }}>Uploaded Documents ({docs.valid.length} files)</Meta>
            {COMPLAINT_SLOTS.map((slot) => {
              const valid = (docs.uploads[slot.id] || []).filter((f) => !f.tooLarge);
              if (!valid.length) return null;
              return (
                <View key={slot.id} style={{ marginBottom: space.md }}>
                  <Text style={[t.label, { color: colors.gold }]}>{slot.label}</Text>
                  {valid.map((f) => (
                    <Text key={f.id} style={t.bodySm} numberOfLines={1}>
                      {f.name} · {fmtSize(f.size)}
                    </Text>
                  ))}
                </View>
              );
            })}
          </Card>
          <Card variant="gold">
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <Feather name="file-text" size={18} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={t.label}>Next: Choose a Legal Package</Text>
                <Text style={t.bodySm}>After submitting, you'll select a package to complete your case registration.</Text>
              </View>
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

const Nav = ({ back, next }: { back: () => void; next: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', gap: space.md }}>
    <Button title="Back" variant="secondary" onPress={back} />
    {next}
  </View>
);
