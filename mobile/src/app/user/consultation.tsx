import React, { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getLawyerById, getMessages, sendMessage } from '@/api/services';
import { ChatThread } from '@/components/shared';
import { Avatar, Badge, Button, Empty, InfoRow, Loader, PageHeader, Screen, Sheet } from '@/components/ui';
import { colors, space, type as t } from '@/theme';
import { initials } from '@/utils/format';

export default function Consultation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lawyerId } = useLocalSearchParams<{ lawyerId?: string }>();
  const [lawyer, setLawyer] = useState<any>(null);
  const [chat, setChat] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(!!lawyerId);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!lawyerId) return;
    getLawyerById(lawyerId)
      .then((r) => r.success && setLawyer(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lawyerId]);

  const fetchChat = useCallback(async () => {
    if (!lawyerId) return;
    try {
      const r = await getMessages(lawyerId);
      if (r.success) setChat(r.data);
    } catch {}
  }, [lawyerId]);

  // Poll every 3s — same as the web page
  useEffect(() => {
    const first = setTimeout(fetchChat, 0);
    const i = setInterval(fetchChat, 3000);
    return () => {
      clearTimeout(first);
      clearInterval(i);
    };
  }, [fetchChat]);

  const send = async () => {
    if (!msg.trim() || !lawyerId) return;
    const text = msg;
    setMsg('');
    setChat((p) => [...p, { id: Date.now().toString(), senderId: 'me', text, createdAt: new Date().toISOString() }]);
    try {
      await sendMessage(lawyerId, text);
      fetchChat();
    } catch {}
  };

  if (!lawyerId) {
    return (
      <Screen>
        <PageHeader back index="Chat" title="Consultation" />
        <Empty
          icon="message-square"
          title="Select Your Case and Lawyer"
          subtitle={'Please navigate to your dashboard and select "Send Message" on a specific case to start a live consultation.'}
        >
          <Button title="My Complaints" small style={{ marginTop: space.lg }} onPress={() => router.replace('/user/complaints')} />
        </Empty>
      </Screen>
    );
  }
  if (loading) return <Loader />;

  const lp = lawyer?.lawyerProfile || {};

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, paddingTop: insets.top + space.sm, paddingHorizontal: space.lg, paddingBottom: insets.bottom }}>
        {/* Chat header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingBottom: space.md, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => setShowInfo(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flex: 1 }}>
            <Avatar name={lawyer?.name} size={40} gold />
            <View style={{ flex: 1 }}>
              <Text style={t.label}>{lawyer?.name || 'Lawyer'}</Text>
              <Text style={[t.meta, { color: colors.success }]}>● Online</Text>
            </View>
          </Pressable>
          <Badge label="Live Chat" tone="gold" />
        </View>

        <ChatThread
          messages={chat}
          isMine={(m) => m.senderId !== lawyerId}
          theirLabel={initials(lawyer?.name, 2, 'L')}
          msg={msg}
          setMsg={setMsg}
          onSend={send}
        />
        <Text style={[t.meta, { textAlign: 'center', marginBottom: space.xs, textTransform: 'none' }]}>Messages are end-to-end encrypted.</Text>
      </View>

      <Sheet visible={showInfo} onClose={() => setShowInfo(false)} title="Your Lawyer">
        <View style={{ alignItems: 'center', marginBottom: space.lg }}>
          <Avatar name={lawyer?.name} size={64} gold />
          <Text style={[t.h2, { marginTop: space.md }]}>{lawyer?.name || 'Lawyer'}</Text>
          <Text style={[t.label, { color: colors.gold }]}>{lp.specialization || 'Legal Specialist'}</Text>
        </View>
        <InfoRow label="Experience" value={`${lp.experience || 0} years`} />
        <InfoRow label="Rating" value="★ 4.8" />
        <InfoRow label="Location" value={lp.location || 'Sri Lanka'} last />
      </Sheet>
    </KeyboardAvoidingView>
  );
}
