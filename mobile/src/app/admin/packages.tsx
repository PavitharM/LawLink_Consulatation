import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createPackage, deletePackage, getAllPackagesAdmin, updatePackage } from '@/api/services';
import { Badge, Banner, Button, Card, IconButton, IconName, Input, Label, Loader, PageHeader, Screen, SelectField, Sheet, Stat, StatGrid, Toggle } from '@/components/ui';
import { colors, fonts, radius, space, type as t } from '@/theme';

const ICONS: { value: string; icon: IconName; label: string }[] = [
  { value: 'shield', icon: 'shield', label: 'Shield' },
  { value: 'zap', icon: 'zap', label: 'Lightning' },
  { value: 'crown', icon: 'award', label: 'Crown' },
  { value: 'star', icon: 'star', label: 'Star' },
];
const iconFor = (n?: string): IconName => ICONS.find((i) => i.value === n)?.icon || 'package';

const blank = { name: '', price: '', period: 'per case', description: '', icon: 'shield', badge: '', active: true, features: [] as string[] };

export default function ManagePackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'new' | any>(null);
  const [form, setForm] = useState<any>(blank);
  const [featureInput, setFeatureInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await getAllPackagesAdmin();
      if (r.success) setPackages(r.data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const open = (pkg: any | 'new') => {
    setErrors({});
    setFeatureInput('');
    setForm(pkg === 'new' ? blank : { ...pkg, price: String(pkg.price), badge: pkg.badge || '', features: pkg.features || [] });
    setModal(pkg);
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm((p: any) => ({ ...p, features: [...p.features.filter(Boolean), featureInput.trim()] }));
    setFeatureInput('');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price required';
    if (!form.description?.trim()) e.description = 'Description is required';
    if (form.features.filter(Boolean).length === 0) e.features = 'Add at least one feature';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      name: form.name,
      price: Number(form.price),
      period: form.period,
      description: form.description,
      icon: form.icon,
      badge: form.badge || undefined,
      active: form.active,
      features: form.features.filter(Boolean),
    };
    try {
      const r = form.id ? await updatePackage(form.id, payload) : await createPackage(payload);
      if (r.success) {
        setModal(null);
        load();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e: any) {
      Alert.alert('Could not save', e?.errors?.[0]?.message || e?.message || 'Please check the fields.');
    }
  };

  const toggle = async (p: any) => {
    try {
      const r = await updatePackage(p.id, { active: !p.active });
      if (r.success) load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update.');
    }
  };

  const confirmDelete = (p: any) =>
    Alert.alert('Delete Package?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const r = await deletePackage(p.id);
            if (r.success) load();
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not delete.');
          }
        },
      },
    ]);

  if (loading) return <Loader />;

  const totalSubs = packages.reduce((s, p) => s + (p._count?.complaints || 0), 0);
  const totalRevenue = packages.reduce((s, p) => s + (p._count?.complaints || 0) * p.price, 0);

  return (
    <Screen>
      <PageHeader
        back
        index="Packages"
        eyebrow="Administration"
        title="Package Management"
        subtitle="Create, edit and manage legal service packages shown to clients."
        right={<IconButton name="plus" bg={colors.gold} color={colors.onGold} onPress={() => open('new')} />}
      />
      {saved ? <Banner text="Package saved successfully!" /> : null}

      <StatGrid>
        <Stat label="Total Packages" value={packages.length} icon="package" />
        <Stat label="Active" value={packages.filter((p) => p.active).length} icon="eye" tone="success" />
        <Stat label="Total Subscribers" value={totalSubs} icon="users" tone="info" />
        <Stat label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon="trending-up" tone="warning" />
      </StatGrid>

      {packages.map((p) => (
        <Card key={p.id} style={[{ marginBottom: space.md }, !p.active && { opacity: 0.6 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.goldDim, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={iconFor(p.icon)} size={20} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={t.h3}>{p.name}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                {p.badge ? <Badge label={p.badge} tone="gold" /> : null}
                <Badge label={p.active ? 'Active' : 'Hidden'} tone={p.active ? 'success' : 'neutral'} />
              </View>
            </View>
          </View>
          {p.description ? <Text style={[t.bodySm, { marginTop: space.md }]}>{p.description}</Text> : null}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: space.md }}>
            <Text style={{ fontFamily: fonts.light, fontSize: 28, color: colors.goldText }}>₹{p.price.toLocaleString('en-IN')}</Text>
            <Text style={t.bodySm}>{p.period}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: space.md, paddingVertical: space.md, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: colors.border }}>
            <View style={{ flex: 1 }}>
              <Text style={t.h3}>{p._count?.complaints || 0}</Text>
              <Text style={t.meta}>USAGE (CASES)</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={t.h3}>₹{((p._count?.complaints || 0) * p.price).toLocaleString('en-IN')}</Text>
              <Text style={t.meta}>EST. REVENUE</Text>
            </View>
          </View>
          {(p.features || []).slice(0, 3).map((f: string, i: number) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
              <Feather name="check" size={13} color={colors.gold} style={{ marginTop: 3 }} />
              <Text style={[t.bodySm, { flex: 1, color: colors.text }]}>{f}</Text>
            </View>
          ))}
          {(p.features || []).length > 3 ? <Text style={[t.meta, { marginLeft: 21 }]}>+{p.features.length - 3} more features</Text> : null}
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg }}>
            <Button title="Edit" icon="edit-2" small variant="secondary" style={{ flex: 1 }} onPress={() => open(p)} />
            <Button title={p.active ? 'Hide' : 'Show'} icon={p.active ? 'eye-off' : 'eye'} small variant="secondary" style={{ flex: 1 }} onPress={() => toggle(p)} />
            <IconButton name="trash-2" color={colors.danger} bg={colors.dangerDim} onPress={() => confirmDelete(p)} />
          </View>
        </Card>
      ))}

      <Pressable
        onPress={() => open('new')}
        style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, borderRadius: radius.lg, alignItems: 'center', paddingVertical: space.xxl }}
      >
        <Feather name="plus" size={28} color={colors.gold} />
        <Text style={[t.label, { marginTop: space.sm }]}>Add New Package</Text>
        <Text style={t.bodySm}>Create a custom legal service package</Text>
      </Pressable>

      <Sheet
        visible={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'new' ? 'Create New Package' : 'Edit Package'}
        footer={
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => setModal(null)} />
            <Button title={modal === 'new' ? 'Create Package' : 'Save Changes'} icon="save" style={{ flex: 1 }} onPress={handleSave} />
          </View>
        }
      >
        <Input label="Package Name" required placeholder="e.g., Premium Full Service" value={form.name} error={errors.name} onChangeText={(v) => setForm({ ...form, name: v })} />
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Input label="Price (₹)" required placeholder="e.g., 1999" keyboardType="numeric" value={form.price} error={errors.price} onChangeText={(v) => setForm({ ...form, price: v })} containerStyle={{ flex: 1 }} />
          <SelectField label="Period" value={form.period} options={['per case', 'per month', 'per year', 'one-time']} onChange={(v) => setForm({ ...form, period: v })} containerStyle={{ flex: 1 }} />
        </View>
        <Input label="Badge Label (optional)" placeholder="e.g., Most Popular" value={form.badge} onChangeText={(v) => setForm({ ...form, badge: v })} />
        <Label>Icon</Label>
        <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.lg }}>
          {ICONS.map((ic) => {
            const on = form.icon === ic.value;
            return (
              <Pressable
                key={ic.value}
                onPress={() => setForm({ ...form, icon: ic.value })}
                style={{ flex: 1, alignItems: 'center', gap: 4, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: on ? colors.gold : colors.border, backgroundColor: on ? colors.goldDim : colors.surface2 }}
              >
                <Feather name={ic.icon} size={18} color={on ? colors.gold : colors.textMuted} />
                <Text style={t.meta}>{ic.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Input label="Description" required multiline placeholder="Brief description of this package..." value={form.description} error={errors.description} onChangeText={(v) => setForm({ ...form, description: v })} />
        <Label required>Features</Label>
        {form.features.filter(Boolean).map((f: string, i: number) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.sm, backgroundColor: colors.surface2, marginBottom: 6 }}>
            <Feather name="check" size={14} color={colors.gold} />
            <Text style={[t.bodySm, { flex: 1, color: colors.text }]}>{f}</Text>
            <Pressable hitSlop={8} onPress={() => setForm({ ...form, features: form.features.filter((_: string, idx: number) => idx !== i) })}>
              <Feather name="x" size={14} color={colors.textDim} />
            </Pressable>
          </View>
        ))}
        <Input
          placeholder="Type a feature and press Add"
          value={featureInput}
          onChangeText={setFeatureInput}
          onSubmitEditing={addFeature}
          returnKeyType="done"
          error={errors.features}
          right={
            <Pressable onPress={addFeature} hitSlop={8}>
              <Text style={[t.label, { color: colors.gold }]}>Add</Text>
            </Pressable>
          }
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface2 }}>
          <View style={{ flex: 1 }}>
            <Text style={t.label}>Package Active</Text>
            <Text style={t.bodySm}>Show this package to users on the checkout page</Text>
          </View>
          <Toggle value={form.active} onChange={(v) => setForm({ ...form, active: v })} />
        </View>
      </Sheet>
    </Screen>
  );
}
