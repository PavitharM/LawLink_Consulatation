import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getPackages } from '@/api/services';
import { Badge, Button, Empty, Loader, Meta, PageHeader, Screen } from '@/components/ui';
import { colors, fonts, radius, space, type as t } from '@/theme';
import { formatLKR } from '@/utils/format';

const iconFor = (name?: string) => (name === 'Zap' || name === 'zap' ? 'zap' : name === 'Star' || name === 'star' ? 'star' : 'shield');

export default function SelectPackage() {
  const router = useRouter();
  const { complaintId } = useLocalSearchParams<{ complaintId?: string }>();
  const [packages, setPackages] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPackages();
        if (res.success) {
          setPackages(res.data);
          if (res.data.length) setSelected(res.data[0].id);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader />;
  const pkg = packages.find((p) => p.id === selected);

  return (
    <Screen
      footer={
        pkg ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Meta>Selected Package</Meta>
              <Text style={t.label} numberOfLines={1}>
                {pkg.name}
              </Text>
              <Text style={[t.bodySm, { color: colors.gold }]}>
                {formatLKR(pkg.price)} {pkg.period}
              </Text>
            </View>
            <Button
              title="Continue to Payment"
              iconRight="arrow-right"
              onPress={() => router.push(complaintId ? `/user/payment?packageId=${selected}&complaintId=${complaintId}` : `/user/payment?packageId=${selected}`)}
            />
          </View>
        ) : undefined
      }
    >
      <PageHeader back index="Packages" eyebrow="Checkout" title="Choose a Legal Package" subtitle="Select the package that best fits your legal needs. All packages include access to verified, experienced lawyers." />

      {packages.length === 0 ? <Empty icon="package" title="No packages available" /> : null}

      {packages.map((p) => {
        const on = p.id === selected;
        return (
          <Pressable
            key={p.id}
            onPress={() => setSelected(p.id)}
            style={{
              borderRadius: radius.xl,
              borderWidth: on ? 1.5 : 1,
              borderColor: on ? colors.gold : colors.border,
              backgroundColor: on ? colors.goldDim : colors.surface,
              padding: space.xl,
              marginBottom: space.lg,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: on ? colors.gold : colors.surface3, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={iconFor(p.icon)} size={20} color={on ? colors.onGold : colors.gold} />
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                {p.badge ? <Badge label={p.badge} tone="gold" /> : null}
                {on ? <Feather name="check-circle" size={20} color={colors.gold} /> : null}
              </View>
            </View>
            <Text style={[t.h2, { marginTop: space.lg }]}>{p.name}</Text>
            {p.description ? <Text style={[t.bodySm, { marginTop: 4 }]}>{p.description}</Text> : null}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: space.lg }}>
              <Text style={{ fontFamily: fonts.light, fontSize: 36, letterSpacing: -1, color: colors.goldText }}>{formatLKR(p.price)}</Text>
              <Text style={t.bodySm}>{p.period}</Text>
            </View>
            {(p.features || []).map((f: string, i: number) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Feather name="check" size={14} color={colors.gold} style={{ marginTop: 3 }} />
                <Text style={[t.body, { flex: 1, fontSize: 14 }]}>{f}</Text>
              </View>
            ))}
          </Pressable>
        );
      })}
    </Screen>
  );
}
