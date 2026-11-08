/**
 * Mirrors Review.jsx, which on the web displays a static sample summary and a
 * local "submitted" confirmation (it is not wired to the API).
 */
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Banner, Button, Card, Checkbox, IconName, InfoRow, PageHeader, Screen, SectionTitle } from '@/components/ui';
import { colors, space, type as t } from '@/theme';

const sections: { icon: IconName; title: string; items: { label: string; value: string }[] }[] = [
  { icon: 'user', title: 'Your Information', items: [
    { label: 'Full Name', value: 'John Doe' },
    { label: 'Email', value: 'john.doe@email.com' },
    { label: 'Phone', value: '+91 98765 43210' },
  ] },
  { icon: 'briefcase', title: 'Case Details', items: [
    { label: 'Category', value: 'Civil Law' },
    { label: 'Title', value: 'Property Dispute with Neighbor' },
    { label: 'Priority', value: 'High' },
    { label: 'Description', value: 'I am facing a property boundary dispute with my neighbor who has encroached on my land. Need legal advice urgently.' },
  ] },
  { icon: 'credit-card', title: 'Payment', items: [
    { label: 'Package', value: 'Standard Representation' },
    { label: 'Amount Paid', value: '₹1,999' },
    { label: 'Transaction ID', value: 'TXN-2024-LLK-00842' },
  ] },
  { icon: 'file-text', title: 'Documents', items: [
    { label: 'ID Proof', value: 'aadhaar_card.pdf ✅' },
    { label: 'Complaint', value: 'complaint_letter.pdf ✅' },
    { label: 'Evidence', value: 'property_photos.jpg ✅' },
  ] },
];

export default function Review() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Screen contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.successDim, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="check-circle" size={52} color={colors.success} />
          </View>
          <Text style={[t.h1, { marginTop: space.xl }]}>Case Submitted!</Text>
          <Text style={[t.bodySm, { textAlign: 'center', marginTop: space.sm }]}>
            Your case has been successfully submitted. A lawyer will be assigned to your case within 24 hours. You will receive a notification once assigned.
          </Text>
          <Card style={{ alignSelf: 'stretch', marginVertical: space.xl }}>
            <InfoRow label="Case Reference ID" value="CMP-2024-00847" />
            <InfoRow label="Status" value="Open — Awaiting Assignment" />
            <InfoRow label="Package" value="Standard Representation" />
            <InfoRow label="Submitted" value="Jun 08, 2024" last />
          </Card>
          <Button title="Go to Dashboard" onPress={() => router.replace('/user')} style={{ alignSelf: 'stretch' }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Button title="Back" variant="secondary" onPress={() => router.back()} />
          <Button title="Submit Case" disabled={!agreed} onPress={() => setSubmitted(true)} style={{ flex: 1 }} />
        </View>
      }
    >
      <PageHeader back index="Step 4 / 4" eyebrow="Final review" title="Review & Submit" subtitle="Please review all the details below before submitting your case." />
      <Banner text="Step 4 of 4 — Final Review. Everything looks good!" />
      {sections.map((s) => (
        <Card key={s.title} style={{ marginBottom: space.lg }}>
          <SectionTitle title={s.title} icon={s.icon} action="Edit" onAction={() => router.back()} />
          {s.items.map((it, i) => (
            <InfoRow key={it.label} label={it.label} value={it.value} last={i === s.items.length - 1} />
          ))}
        </Card>
      ))}
      <Checkbox checked={agreed} onChange={setAgreed}>
        <Text style={t.bodySm}>
          I confirm that all the information provided is accurate and I agree to the <Text style={{ color: colors.gold }}>Terms of Service</Text> and{' '}
          <Text style={{ color: colors.gold }}>Privacy Policy</Text> of LawLink.
        </Text>
      </Checkbox>
    </Screen>
  );
}
