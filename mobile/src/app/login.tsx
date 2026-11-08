import React, { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { homeForRole, Role, useAuth } from '@/context/AuthContext';
import { login as loginApi } from '@/api/services';
import { Banner, Button, Checkbox, Input, PageHeader, Screen } from '@/components/ui';
import { colors, space, type as t } from '@/theme';

export default function Login() {
  const router = useRouter();
  const { role, setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (role) return <Redirect href={homeForRole(role)} />;

  const handleLogin = async () => {
    if (!email || !password) return setError('Please enter your email and password.');
    setLoading(true);
    setError('');
    try {
      const response = await loginApi({ email: email.trim(), password });
      if (response.success) {
        const u = response.data.user;
        await setAuth(u, u.role, response.data.accessToken);
        router.replace(homeForRole(u.role.toLowerCase() as Role));
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <PageHeader back index="Sign in" eyebrow="Access your legal dashboard" title="Welcome back" subtitle="Sign in to your LawLink account." />

      {error ? <Banner text={error} tone="danger" /> : null}

      <Input
        label="Email Address"
        icon="mail"
        placeholder="you@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        icon="lock"
        placeholder="••••••••"
        secure
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={handleLogin}
        returnKeyType="go"
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Checkbox checked={remember} onChange={setRemember}>
          <Text style={t.bodySm}>Remember me for 30 days</Text>
        </Checkbox>
        <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
          <Text style={[t.label, { color: colors.gold }]}>Forgot password?</Text>
        </Pressable>
      </View>

      <Button title={loading ? 'Signing in...' : 'Sign In'} loading={loading} onPress={handleLogin} style={{ marginTop: space.sm }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.xl }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text style={t.bodySm}>New to LawLink?</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
      <Button title="Create a Free Account" variant="secondary" onPress={() => router.push('/register')} />

      <Text style={[t.meta, { textAlign: 'center', marginTop: space.xl, textTransform: 'none' }]}>
        By logging in, you agree to our <Text style={{ color: colors.gold }}>Terms</Text> &{' '}
        <Text style={{ color: colors.gold }}>Privacy Policy</Text>.
      </Text>
    </Screen>
  );
}
