/**
 * Mirrors Payment.jsx — the web app simulates payment (no gateway), posts a
 * "Payment Confirmed" notification and redirects after 3 seconds.
 */
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createNotification, getPackages } from '@/api/services';
import { useNotifications } from '@/context/NotificationContext';
import { Banner, Button, Card, Chip, ChipRow, Divider, Input, Loader, Meta, PageHeader, Screen, SelectField } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { formatLKR } from '@/utils/format';

export default function Payment() {
  const router = useRouter();
  const { packageId, complaintId } = useLocalSearchParams<{ packageId?: string; complaintId?: string }>();
  const { fetchNotifications } = useNotifications();
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [paid, setPaid] = useState(false);
  const [form, setForm] = useState({ name: '', card: '', expiry: '', cvv: '', upi: '', bank: '' });
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [txn] = useState(() => `TXN-${Date.now()}-LLK`);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPackages();
        if (res.success) setPkg(res.data.find((p: any) => p.id === packageId) || res.data[0]);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [packageId]);

  const valid =
    method === 'card' ? !!(form.name && form.card && form.expiry && form.cvv) : method === 'upi' ? !!form.upi : !!form.bank;

  const handlePay = async () => {
    setPaid(true);
    try {
      await createNotification({
        title: 'Payment Confirmed',
        message: `Your payment of ${formatLKR(pkg?.price)} for the ${pkg?.name} Package was successfully processed.`,
        type: 'payment',
      });
      fetchNotifications();
    } catch (e) {
      console.warn('Failed to create payment notification', e);
    }
    setTimeout(() => {
      if (complaintId) router.replace(`/user/complaint/${complaintId}`);
      else router.replace('/user');
    }, 3000);
  };

  if (loading) return <Loader />;

  if (paid) {
    return (
      <Screen contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.successDim, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="check-circle" size={48} color={colors.success} />
          </View>
          <Text style={[t.h1, { marginTop: space.xl }]}>Payment Successful!</Text>
          {complaintId ? <View style={{ marginTop: space.lg, alignSelf: 'stretch' }}><Banner text="Your complaint was submitted successfully!" /></View> : null}
          <Text style={[t.bodySm, { textAlign: 'center', marginTop: space.sm }]}>
            Your payment of <Text style={{ color: colors.text }}>{formatLKR(pkg?.price)}</Text> was received. You'll be redirected shortly...
          </Text>
          <Card style={{ marginTop: space.xl, alignSelf: 'stretch' }}>
            <Meta>Transaction ID</Meta>
            <Text style={[t.label, { marginTop: 2 }]}>{txn}</Text>
            <Text style={[t.bodySm, { marginTop: space.sm }]}>
              {pkg?.name} Package — {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
            </Text>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <>
          <Button title={`Pay ${formatLKR(pkg?.price)} Securely`} icon="lock" iconRight="arrow-right" disabled={!valid} onPress={handlePay} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: space.sm }}>
            <Feather name="lock" size={11} color={colors.textDim} />
            <Text style={t.meta}>256-bit SSL encrypted. Your details are secure.</Text>
          </View>
        </>
      }
    >
      <PageHeader back index="Payment" eyebrow="Checkout" title="Secure Payment" subtitle="Complete your payment to activate your legal package." />

      {/* Order summary */}
      <Card variant="gold" style={{ marginBottom: space.xl }}>
        <Meta style={{ marginBottom: space.md }}>Order Summary</Meta>
        <Row k="Package" v={pkg?.name} strong />
        <Row k="Base Price" v={formatLKR(pkg?.price)} />
        <Row k="GST (18%)" v={formatLKR((pkg?.price || 0) * 0.18)} />
        <Row k="Discount" v={`-${formatLKR((pkg?.price || 0) * 0.18)}`} green />
        <Divider />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={t.h3}>Total</Text>
          <Text style={[t.h2, { color: colors.goldText }]}>{formatLKR(pkg?.price)}</Text>
        </View>
        {pkg?.features?.length ? (
          <>
            <Text style={[t.label, { marginTop: space.lg, marginBottom: 4 }]}>What's Included</Text>
            {pkg.features.map((f: string, i: number) => (
              <Text key={i} style={t.bodySm}>
                • {f}
              </Text>
            ))}
          </>
        ) : null}
      </Card>

      <ChipRow>
        {[
          { id: 'card', label: '💳 Card' },
          { id: 'upi', label: '📱 UPI' },
          { id: 'netbanking', label: '🏦 Net Banking' },
        ].map((m) => (
          <Chip key={m.id} label={m.label} active={method === m.id} onPress={() => setMethod(m.id as any)} />
        ))}
      </ChipRow>

      {method === 'card' && (
        <>
          <Input label="Cardholder Name" placeholder="Name as on card" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <Input label="Card Number" icon="credit-card" placeholder="1234 5678 9012 3456" keyboardType="number-pad" maxLength={19} value={form.card} onChangeText={(v) => setForm({ ...form, card: v })} />
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Input label="Expiry Date" placeholder="MM / YY" maxLength={7} value={form.expiry} onChangeText={(v) => setForm({ ...form, expiry: v })} containerStyle={{ flex: 1 }} />
            <Input label="CVV" placeholder="•••" secure keyboardType="number-pad" maxLength={4} value={form.cvv} onChangeText={(v) => setForm({ ...form, cvv: v })} containerStyle={{ flex: 1 }} />
          </View>
        </>
      )}
      {method === 'upi' && (
        <Input label="UPI ID" placeholder="yourname@upi" autoCapitalize="none" hint="e.g., yourname@okaxis, yourname@paytm" value={form.upi} onChangeText={(v) => setForm({ ...form, upi: v })} />
      )}
      {method === 'netbanking' && (
        <SelectField
          label="Select Your Bank"
          placeholder="Choose a bank..."
          value={form.bank}
          options={['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Bank of Baroda', 'Punjab National Bank']}
          onChange={(v) => setForm({ ...form, bank: v })}
        />
      )}
    </Screen>
  );
}

const Row = ({ k, v, strong, green }: { k: string; v?: string; strong?: boolean; green?: boolean }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
    <Text style={t.bodySm}>{k}</Text>
    <Text style={[strong ? t.label : t.bodySm, green && { color: colors.success }, !strong && !green && { color: colors.text }]}>{v}</Text>
  </View>
);
