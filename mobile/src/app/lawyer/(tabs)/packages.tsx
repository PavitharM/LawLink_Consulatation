import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createPackage, deletePackage, getAllPackagesAdmin, updatePackage } from '@/api/services';
import { Badge, Button, Card, IconButton, Input, Loader, PageHeader, Screen, SelectField, Sheet, Stat, StatGrid } from '@/components/ui';
import { colors, fonts, radius, space, type as t } from '@/theme';

const blank = { name: '', price: '', period: 'per case', description: '', features: '' };

export default function PackageManagement() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getAllPackagesAdmin();
      if (res.success) setPackages(res.data);
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

  const openNew = () => {
    setEditItem(null);
    setForm(blank);
    setShowForm(true);
  };
  const openEdit = (p: any) => {
    setEditItem(p);
    setForm({
      name: p.name,
      price: String(p.price),
      period: p.period,
      description: p.description || '',
      features: Array.isArray(p.features) ? p.features.join('\n') : '',
    });
    setShowForm(true);
  };

  const toggleActive = async (p: any) => {
    try {
      const r = await updatePackage(p.id, { active: !p.active });
      if (r.success) load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update package.');
    }
  };

  const handleDelete = (p: any) =>
    Alert.alert('Delete package?', 'Are you sure you want to delete this package?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const r = await deletePackage(p.id);
            if (r.success) load();
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not delete package.');
          }
        },
      },
    ]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        period: form.period,
        description: form.description || 'No description provided',
        features: form.features.split('\n').filter((f) => f.trim() !== ''),
      };
      if (editItem) await updatePackage(editItem.id, payload);
      else await createPackage(payload);
      setShowForm(false);
      setEditItem(null);
      setForm(blank);
      load();
    } catch (e: any) {
      Alert.alert('Could not save', e?.errors?.[0]?.message || e?.message || 'Please check the fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const totalBookings = packages.reduce((a, p) => a + (p._count?.complaints || 0), 0);
  const totalRevenue = packages.reduce((a, p) => a + p.price * (p._count?.complaints || 0), 0);

  return (
    <Screen>
      <PageHeader
        index="003"
        eyebrow="Services"
        title="Package Management"
        subtitle="Create and manage the service packages you offer to clients."
        right={<IconButton name="plus" bg={colors.gold} color={colors.onGold} onPress={openNew} />}
      />

      <StatGrid>
        <Stat label="Total Packages" value={packages.length} icon="star" />
        <Stat label="Active" value={packages.filter((p) => p.active).length} icon="check-circle" tone="success" />
        <Stat label="Total Bookings" value={totalBookings} icon="trending-up" tone="info" />
        <Stat label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon="dollar-sign" tone="warning" />
      </StatGrid>

      {packages.map((p) => (
        <Card key={p.id} style={[{ marginBottom: space.md }, !p.active && { borderStyle: 'dashed', opacity: 0.6 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={t.h3}>{p.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <Text style={{ fontFamily: fonts.light, fontSize: 28, color: colors.goldText }}>₹{p.price.toLocaleString()}</Text>
                <Text style={t.bodySm}>{p.period}</Text>
              </View>
            </View>
            <Badge label={p.active ? '● Active' : '○ Inactive'} tone={p.active ? 'success' : 'neutral'} />
          </View>
          <View style={{ marginVertical: space.md }}>
            {(p.features || []).map((f: string, i: number) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                <Feather name="check-circle" size={13} color={colors.gold} style={{ marginTop: 3 }} />
                <Text style={[t.bodySm, { flex: 1, color: colors.text }]}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: space.md, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: colors.border, marginBottom: space.md }}>
            <View style={{ flex: 1 }}>
              <Text style={t.meta}>BOOKINGS</Text>
              <Text style={t.h3}>{p._count?.complaints || 0}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={t.meta}>REVENUE</Text>
              <Text style={t.h3}>₹{(p.price * (p._count?.complaints || 0)).toLocaleString()}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button title="Edit" icon="edit-2" small variant="secondary" style={{ flex: 1 }} onPress={() => openEdit(p)} />
            <Button title={p.active ? 'Deactivate' : 'Activate'} small variant={p.active ? 'secondary' : 'success'} style={{ flex: 1 }} onPress={() => toggleActive(p)} />
            <IconButton name="trash-2" color={colors.danger} bg={colors.dangerDim} onPress={() => handleDelete(p)} />
          </View>
        </Card>
      ))}

      <Pressable
        onPress={openNew}
        style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, borderRadius: radius.lg, alignItems: 'center', paddingVertical: space.xxl }}
      >
        <Feather name="plus-circle" size={28} color={colors.gold} />
        <Text style={[t.label, { marginTop: space.sm }]}>Add New Package</Text>
      </Pressable>

      <Sheet
        visible={showForm}
        onClose={() => setShowForm(false)}
        title={editItem ? 'Edit Package' : 'Create New Package'}
        footer={
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => setShowForm(false)} />
            <Button title={editItem ? 'Save Changes' : 'Create Package'} style={{ flex: 1 }} loading={saving} disabled={!form.name || !form.price || !form.features.trim()} onPress={handleSave} />
          </View>
        }
      >
        <Input label="Package Name" required placeholder="e.g., Standard Representation" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
        <Input label="Price (₹)" required placeholder="e.g., 1999" keyboardType="numeric" value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} />
        <SelectField label="Duration" required value={form.period} options={['per session', 'per case', 'per month']} onChange={(v) => setForm({ ...form, period: v })} />
        <Input label="Description" placeholder="e.g., Best for standard matters" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
        <Input
          label="Features (one per line)"
          required
          multiline
          style={{ minHeight: 110 }}
          placeholder={'30-minute consultation call\nFull document review\nCourt representation'}
          value={form.features}
          onChangeText={(v) => setForm({ ...form, features: v })}
        />
      </Sheet>
    </Screen>
  );
}
