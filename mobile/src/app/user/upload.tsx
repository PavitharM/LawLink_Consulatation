import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { uploadFile } from '@/api/services';
import { DocSlotList, UPLOAD_SLOTS, useDocUploads } from '@/components/DocSlots';
import { Banner, Button, Card, Meta, PageHeader, ProgressBar, Screen } from '@/components/ui';
import { colors, fonts, space, type as t } from '@/theme';
import { shortId } from '@/utils/format';

export default function UploadDocuments() {
  const router = useRouter();
  const { case: caseId, from } = useLocalSearchParams<{ case?: string; from?: string }>();
  const fromDetails = from === 'details' && !!caseId;
  const docs = useDocUploads(UPLOAD_SLOTS);
  const [uploading, setUploading] = useState(false);
  const pct = Math.round((docs.requiredDone / docs.requiredSlots.length) * 100);

  const handleBack = () => {
    if (fromDetails) router.back();
    else router.replace('/user/payment');
  };

  const handleNext = async () => {
    if (!fromDetails) return router.push('/user/review');
    setUploading(true);
    try {
      const jobs = Object.entries(docs.uploads).flatMap(([slotId, files]) =>
        files.filter((f) => !f.tooLarge).map((f) => uploadFile(caseId!, slotId, { uri: f.uri, name: f.name, mimeType: f.mimeType }))
      );
      if (jobs.length) await Promise.allSettled(jobs);
      router.back();
    } catch (e) {
      console.warn('Upload failed', e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Button title={fromDetails ? 'Back' : 'Back'} icon="arrow-left" variant="secondary" onPress={handleBack} />
          <Button
            title={uploading ? 'Uploading...' : fromDetails ? 'Save Documents' : 'Review & Submit'}
            iconRight={uploading ? undefined : 'arrow-right'}
            loading={uploading}
            disabled={!docs.complete}
            onPress={handleNext}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <PageHeader
        back
        index={fromDetails ? shortId(caseId) : 'Step 3 / 4'}
        eyebrow="Documents"
        title={fromDetails ? `Add Documents` : 'Upload Documents'}
        subtitle="Attach all relevant documents to support your legal case. Fields marked * are required."
      />

      <Card variant={fromDetails ? 'outline' : 'gold'} style={{ marginBottom: space.lg }}>
        {fromDetails ? (
          <>
            <Text style={t.label}>
              Adding more documents to case <Text style={{ color: colors.gold }}>{shortId(caseId)}</Text>
            </Text>
            <Text style={[t.bodySm, { marginTop: 4 }]}>These documents will be attached to your existing case and shared with your assigned lawyer.</Text>
          </>
        ) : (
          <>
            <Text style={t.label}>Step 3 of 4 — Document Upload</Text>
            <Text style={[t.bodySm, { marginTop: 4 }]}>Upload at least the required documents to proceed. Adding optional docs strengthens your case.</Text>
          </>
        )}
      </Card>

      <DocSlotList slots={UPLOAD_SLOTS} uploads={docs.uploads} onPick={docs.pick} onRemove={docs.remove} />

      <Card style={{ marginTop: space.xl }}>
        <Meta style={{ marginBottom: space.md }}>Upload Summary</Meta>
        <View style={{ flexDirection: 'row', marginBottom: space.lg }}>
          {[
            { v: docs.valid.length, l: 'Valid Files' },
            { v: `${docs.requiredDone}/${docs.requiredSlots.length}`, l: 'Required Done' },
            { v: docs.optionalFilled, l: 'Optional Added' },
          ].map((s) => (
            <View key={s.l} style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.light, fontSize: 28, color: colors.goldLight }}>{s.v}</Text>
              <Text style={t.bodySm}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={t.bodySm}>Required documents</Text>
          <Text style={t.label}>{pct}%</Text>
        </View>
        <ProgressBar pct={pct} color={pct === 100 ? colors.success : colors.gold} />
      </Card>

      {docs.hasOversized ? (
        <View style={{ marginTop: space.lg }}>
          <Banner tone="danger" text="Some files exceed the size limit. Please remove or replace them before proceeding." />
        </View>
      ) : null}
    </Screen>
  );
}
