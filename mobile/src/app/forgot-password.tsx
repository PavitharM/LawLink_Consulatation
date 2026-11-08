/**
 * Mirrors frontend ForgotPassword.jsx — a 3-step UI flow (email → OTP → new password).
 * Like the web app, there is no backend endpoint yet, so steps advance locally.
 */
import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Input, PageHeader, Screen, StrengthMeter } from '@/components/ui';
import { colors, fonts, radius, space, type as t } from '@/theme';

type Step = 'email' | 'sent' | 'reset';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [done, setDone] = useState(false);
  const refs = useRef<({ focus: () => void } | null)[]>([]);

  const updateOtp = (i: number, val: string) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  if (done) {
    return (
      <Screen contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.successDim, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="check-circle" size={44} color={colors.success} />
          </View>
          <Text style={[t.h1, { marginTop: space.xl, textAlign: 'center' }]}>Password Reset!</Text>
          <Text style={[t.bodySm, { textAlign: 'center', marginTop: space.sm, marginBottom: space.xl }]}>
            Your password has been successfully updated. You can now log in with your new password.
          </Text>
          <Button title="Back to Login" onPress={() => router.replace('/login')} style={{ alignSelf: 'stretch' }} />
        </View>
      </Screen>
    );
  }

  const stepIdx = { email: 0, sent: 1, reset: 2 }[step];
  const valid = newPass.length >= 8 && newPass === confirmPass;

  return (
    <Screen>
      <PageHeader back index={`Step ${stepIdx + 1} / 3`} eyebrow="Secure account recovery" title={step === 'email' ? 'Forgot Password?' : step === 'sent' ? 'Check Your Email' : 'Set New Password'} />

      {/* Step indicator */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.xl }}>
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: i <= stepIdx ? colors.gold : colors.surface3,
              }}
            >
              <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: i <= stepIdx ? colors.onGold : colors.textDim }}>{i + 1}</Text>
            </View>
            {i < 2 ? <View style={{ flex: 1, height: 1, backgroundColor: i < stepIdx ? colors.gold : colors.border, marginHorizontal: 6 }} /> : null}
          </React.Fragment>
        ))}
      </View>

      {step === 'email' && (
        <>
          <Text style={[t.bodySm, { marginBottom: space.xl }]}>
            Enter your registered email address and we'll send you a one-time password (OTP) to reset your password.
          </Text>
          <Input label="Email Address" icon="mail" placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <Button title="Send OTP" disabled={!/\S+@\S+\.\S+/.test(email)} onPress={() => setStep('sent')} />
        </>
      )}

      {step === 'sent' && (
        <>
          <Text style={[t.bodySm, { marginBottom: space.xl }]}>
            We've sent a 6-digit OTP to <Text style={{ color: colors.text }}>{email}</Text>. Enter it below to verify your identity.
          </Text>
          <Text style={[t.label, { color: colors.textMuted, marginBottom: space.sm }]}>Enter OTP</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: space.xl }}>
            {otp.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  refs.current[i] = r;
                }}
                value={d}
                onChangeText={(v) => updateOtp(i, v)}
                onKeyPress={(e) => e.nativeEvent.key === 'Backspace' && !d && i > 0 && refs.current[i - 1]?.focus()}
                keyboardType="number-pad"
                maxLength={1}
                selectionColor={colors.gold}
                style={{
                  flex: 1,
                  height: 54,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: d ? colors.gold : colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  textAlign: 'center',
                  fontFamily: fonts.medium,
                  fontSize: 22,
                }}
              />
            ))}
          </View>
          <Button title="Verify OTP" disabled={otp.join('').length < 6} onPress={() => setStep('reset')} />
          <Text style={[t.bodySm, { textAlign: 'center', marginTop: space.lg }]}>
            Didn't receive it? <Text style={{ color: colors.gold }}>Resend OTP</Text>
          </Text>
        </>
      )}

      {step === 'reset' && (
        <>
          <Text style={[t.bodySm, { marginBottom: space.xl }]}>Create a strong new password for your LawLink account.</Text>
          <Input label="New Password" secure placeholder="Min. 8 characters" value={newPass} onChangeText={setNewPass} />
          <Input label="Confirm New Password" secure placeholder="Repeat new password" value={confirmPass} onChangeText={setConfirmPass} />
          <StrengthMeter pwd={newPass} thresholds="reset" />
          <Button title="Reset Password" disabled={!valid} onPress={() => setDone(true)} />
        </>
      )}

      <Button title="Back to Login" variant="ghost" icon="arrow-left" onPress={() => router.replace('/login')} style={{ marginTop: space.lg }} />
    </Screen>
  );
}
