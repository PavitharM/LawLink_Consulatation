import React, { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { homeForRole, useAuth } from '@/context/AuthContext';
import { register } from '@/api/services';
import { Banner, Button, Checkbox, IconName, Input, PageHeader, Screen, SelectField } from '@/components/ui';
import { colors, radius, space, type as t } from '@/theme';
import { SPECIALIZATIONS } from '@/utils/format';

const roles: { value: 'user' | 'lawyer'; label: string; icon: IconName; desc: string }[] = [
  { value: 'user', label: 'Client / User', icon: 'user', desc: 'I need legal help and want to file complaints or find a lawyer.' },
  { value: 'lawyer', label: 'Lawyer', icon: 'briefcase', desc: 'I am a verified advocate looking to offer my legal services.' },
];

export default function Register() {
  const router = useRouter();
  const { role: authed, setAuth } = useAuth();
  const [role, setRole] = useState<'user' | 'lawyer'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    barCouncilId: '', specialization: '', experience: '',
  });
  const update = (f: keyof typeof form, v: string) => setForm((p) => ({ ...p, [f]: v }));

  if (authed) return <Redirect href={homeForRole(authed)} />;

  const handleSubmit = async () => {
    const requiredFilled =
      form.name && form.phone && form.email && form.password && form.confirmPassword &&
      (role === 'user' || (form.barCouncilId && form.experience && form.specialization));
    if (!requiredFilled) return setError('Please fill in all required fields.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      const payload: any = {
        name: form.name,
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
        city: 'Colombo', // same placeholder as the web app (no city field in the UI)
        role: role.toUpperCase(),
      };
      if (role === 'lawyer') {
        payload.specialization = form.specialization;
        payload.barCouncilId = form.barCouncilId;
        payload.experience = parseInt(form.experience, 10) || 0;
      }
      const response = await register(payload);
      if (response.success) {
        await setAuth(response.data.user, response.data.user.role, response.data.accessToken);
        router.replace(role === 'lawyer' ? '/lawyer' : '/user');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <PageHeader back index="Join" eyebrow="Sri Lanka's trusted legal platform" title="Create your account" subtitle="Join LawLink and get started for free." />

      <View style={{ flexDirection: 'row', gap: space.md, marginBottom: space.xl }}>
        {roles.map((r) => {
          const on = role === r.value;
          return (
            <Pressable
              key={r.value}
              onPress={() => setRole(r.value)}
              style={{
                flex: 1,
                padding: space.lg,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: on ? colors.gold : colors.border,
                backgroundColor: on ? colors.goldDim : colors.surface,
              }}
            >
              <Feather name={r.icon} size={20} color={on ? colors.gold : colors.textMuted} />
              <Text style={[t.label, { marginTop: space.sm }]}>{r.label}</Text>
              <Text style={[t.bodySm, { fontSize: 12, marginTop: 2 }]}>{r.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Banner text={error} tone="danger" /> : null}

      <Input label="Full Name" required placeholder={role === 'lawyer' ? 'Adv. Your Name' : 'Your full name'} value={form.name} onChangeText={(v) => update('name', v)} />
      <Input label="Phone Number" required placeholder="+94 77 123 4567" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => update('phone', v)} />
      <Input label="Email Address" required placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => update('email', v)} />

      {role === 'lawyer' ? (
        <>
          <Input label="Bar Association ID" required placeholder="e.g. BASL/12345" autoCapitalize="characters" value={form.barCouncilId} onChangeText={(v) => update('barCouncilId', v)} />
          <Input label="Experience (years)" required placeholder="e.g., 8" keyboardType="number-pad" value={form.experience} onChangeText={(v) => update('experience', v)} />
          <SelectField
            label="Specialization"
            required
            value={form.specialization}
            placeholder="Select your specialization..."
            options={SPECIALIZATIONS}
            onChange={(v) => update('specialization', v)}
          />
        </>
      ) : null}

      <Input label="Password" required secure placeholder="Min. 8 characters" value={form.password} onChangeText={(v) => update('password', v)} />
      <Input label="Confirm Password" required secure placeholder="Repeat password" value={form.confirmPassword} onChangeText={(v) => update('confirmPassword', v)} />

      <Checkbox checked={agreed} onChange={setAgreed}>
        <Text style={t.bodySm}>
          I agree to LawLink's <Text style={{ color: colors.gold }}>Terms of Service</Text> and{' '}
          <Text style={{ color: colors.gold }}>Privacy Policy</Text>.
        </Text>
      </Checkbox>

      <Button title={loading ? 'Creating Account...' : 'Create Account'} disabled={!agreed} loading={loading} onPress={handleSubmit} />

      <Text style={[t.bodySm, { textAlign: 'center', marginTop: space.xl }]}>
        Already have an account?{' '}
        <Text style={{ color: colors.gold }} onPress={() => router.replace('/login')}>
          Login
        </Text>
      </Text>
    </Screen>
  );
}
