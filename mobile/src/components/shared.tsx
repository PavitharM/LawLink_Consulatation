/**
 * Building blocks reused across roles: notification cards, chat, case rows,
 * password form, avatar picker, profile tab bar.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts, radius, space, type as t } from '../theme';
import { Avatar, Badge, Banner, Button, Card, IconButton, IconName, Input, MonoTag, StrengthMeter } from './ui';
import { fileUrl } from '../api/client';
import { uploadAvatar } from '../api/services';
import { fmtTime, PRIORITY_TONE, shortId, STATUS } from '../utils/format';

/* ─── Notifications ─────────────────────────────────────────── */
export const NOTIF_ICON: Record<string, IconName> = {
  lawyer: 'user',
  case: 'briefcase',
  message: 'message-square',
  payment: 'credit-card',
  hearing: 'clock',
  review: 'star',
  EMERGENCY: 'alert-triangle',
};

export function NotificationCard({
  n,
  label,
  onPress,
  onMarkRead,
  onDismiss,
  action,
}: {
  n: { id: string; title: string; message: string; read: boolean; type?: string | null; time: string };
  label?: string;
  onPress?: () => void;
  onMarkRead?: () => void;
  onDismiss?: () => void;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notif,
        !n.read ? { borderColor: colors.goldBorder } : { opacity: 0.7 },
        pressed && { backgroundColor: colors.surface2 },
      ]}
    >
      <View style={[styles.notifIcon, !n.read && { backgroundColor: colors.goldDim }]}>
        <Feather name={NOTIF_ICON[n.type || ''] || 'bell'} size={16} color={n.read ? colors.textMuted : colors.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Text style={[t.label, { flex: 1 }, n.read && { color: colors.textMuted, fontFamily: fonts.regular }]}>{n.title}</Text>
          {!n.read ? <View style={styles.unreadDot} /> : null}
          <Text style={t.meta}>{n.time}</Text>
        </View>
        <Text style={[t.bodySm, { marginTop: 4 }]}>{n.message}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.md, marginTop: space.sm }}>
          {label ? <Badge label={label} tone="neutral" /> : null}
          {action ? <TextLink label={action.label} onPress={action.onPress} /> : null}
          {!n.read && onMarkRead ? <TextLink label="Mark as read" onPress={onMarkRead} muted /> : null}
        </View>
      </View>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={10} style={{ padding: 2 }}>
          <Feather name="x" size={14} color={colors.textDim} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export const TextLink = ({ label, onPress, muted }: { label: string; onPress: () => void; muted?: boolean }) => (
  <Pressable onPress={onPress} hitSlop={6}>
    <Text style={[t.label, { color: muted ? colors.textMuted : colors.gold, fontSize: 12 }]}>{label}</Text>
  </Pressable>
);

/** Groups items by their `date` field, preserving order — like the web pages. */
export const groupByDate = <T extends { date: string }>(items: T[]) =>
  items.reduce<Record<string, T[]>>((acc, n) => {
    (acc[n.date] = acc[n.date] || []).push(n);
    return acc;
  }, {});

/* ─── Chat ──────────────────────────────────────────────────── */
export function ChatThread({
  messages,
  isMine,
  myLabel = 'ME',
  theirLabel,
  msg,
  setMsg,
  onSend,
  placeholder = 'Type your message...',
}: {
  messages: any[];
  isMine: (m: any) => boolean;
  myLabel?: string;
  theirLabel: string;
  msg: string;
  setMsg: (s: string) => void;
  onSend: () => void;
  placeholder?: string;
}) {
  const listRef = useRef<FlatList>(null);
  useEffect(() => {
    if (messages.length) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ paddingVertical: space.lg, gap: space.md }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: space.xxxl }}>
            <Feather name="message-square" size={32} color={colors.textDim} />
            <Text style={[t.bodySm, { marginTop: space.sm }]}>No messages yet. Say hello.</Text>
          </View>
        }
        renderItem={({ item: m }) => {
          const mine = isMine(m);
          return (
            <View style={{ flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
              <View style={[styles.chatAvatar, mine && { backgroundColor: colors.gold }]}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 10, color: mine ? colors.onGold : colors.goldText }}>
                  {mine ? myLabel : theirLabel}
                </Text>
              </View>
              <View style={{ maxWidth: '75%', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[t.body, mine && { color: colors.onGold }]}>{m.text}</Text>
                </View>
                <Text style={[t.meta, { marginTop: 4 }]}>{fmtTime(m.createdAt)}</Text>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.composer}>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          selectionColor={colors.gold}
          style={styles.composerInput}
          onSubmitEditing={onSend}
          returnKeyType="send"
        />
        <Pressable
          onPress={onSend}
          disabled={!msg.trim()}
          style={[styles.sendBtn, !msg.trim() && { backgroundColor: colors.surface3 }]}
        >
          <Feather name="send" size={16} color={msg.trim() ? colors.onGold : colors.textDim} />
        </Pressable>
      </View>
    </View>
  );
}

/* ─── Complaint row (user lists / dashboards) ───────────────── */
export function ComplaintRow({ c, onPress, showMeta = true }: { c: any; onPress: () => void; showMeta?: boolean }) {
  const st = STATUS[c.status] || STATUS.OPEN;
  return (
    <Card onPress={onPress} style={{ marginBottom: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: space.sm }}>
        <MonoTag label={shortId(c.id)} />
        <Badge label={st.label} tone={st.tone} icon={st.icon as IconName} />
        {c.priority ? <Badge label={c.priority} tone={PRIORITY_TONE[c.priority]} /> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Text style={[t.h3, { flex: 1 }]} numberOfLines={2}>
          {c.title}
        </Text>
        <Feather name="arrow-up-right" size={18} color={colors.gold} />
      </View>
      {showMeta ? (
        <Text style={[t.bodySm, { marginTop: 6 }]}>
          {c.category} · {new Date(c.createdAt).toLocaleDateString()} ·{' '}
          <Text style={!c.assignedTo ? { color: colors.warning } : undefined}>{c.assignedTo?.name || 'Unassigned'}</Text>
        </Text>
      ) : null}
    </Card>
  );
}

/* ─── Timeline ──────────────────────────────────────────────── */
export function Timeline({ items }: { items: { event: string; date: string; done: boolean }[] }) {
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ alignItems: 'center' }}>
            <View style={[styles.tlDot, it.done && { backgroundColor: colors.gold, borderColor: colors.gold }]}>
              <Feather name={it.done ? 'check' : 'clock'} size={11} color={it.done ? colors.onGold : colors.textDim} />
            </View>
            {i < items.length - 1 ? <View style={[styles.tlLine, it.done && { backgroundColor: colors.goldBorder }]} /> : null}
          </View>
          <View style={{ paddingBottom: space.lg, flex: 1 }}>
            <Text style={[t.label, !it.done && { color: colors.textMuted }]}>{it.event}</Text>
            <Text style={t.meta}>{it.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ─── Profile helpers ───────────────────────────────────────── */
export function ProfileTabs<K extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: K; label: string; icon: IconName }[];
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tb) => {
        const on = tb.id === value;
        return (
          <Pressable key={tb.id} onPress={() => onChange(tb.id)} style={[styles.tab, on && styles.tabOn]}>
            <Feather name={tb.icon} size={14} color={on ? colors.onGold : colors.textMuted} />
            <Text style={[styles.tabText, on && { color: colors.onGold }]} numberOfLines={1}>
              {tb.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Avatar with camera button; uploads exactly like the web pages (preview first, revert on failure). */
export function AvatarPicker({
  name,
  url,
  onChange,
  size = 96,
}: {
  name?: string;
  url: string | null;
  onChange: (url: string | null) => void;
  size?: number;
}) {
  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0];
    const prev = url;
    onChange(a.uri);
    try {
      const r = await uploadAvatar({ uri: a.uri, name: a.fileName || `avatar-${Date.now()}.jpg`, mimeType: a.mimeType || 'image/jpeg' });
      if (r.success) onChange(fileUrl(r.data.avatarUrl));
      else throw new Error(r.error || 'Upload failed');
    } catch {
      alertFn('Failed to save profile picture. If using Cloudinary, check your API keys in .env!');
      onChange(prev);
    }
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <View>
        <Avatar name={name} uri={url} size={size} />
        <Pressable onPress={pick} style={styles.camBtn}>
          <Feather name="camera" size={14} color={colors.onGold} />
        </Pressable>
      </View>
    </View>
  );
}

const alertFn = (msg: string) => Alert.alert('Profile picture', msg);

/** Change-password form — same client-side validation as the web pages (no backend endpoint exists). */
export function PasswordForm({ adminStyle }: { adminStyle?: boolean }) {
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const submit = () => {
    setErr('');
    if (adminStyle) {
      if (!pwd.current || !pwd.newPwd) return setErr('Please fill all fields.');
      if (pwd.newPwd.length < 8) return setErr('Password must be at least 8 characters.');
    } else {
      if (!pwd.current) return setErr('Enter your current password.');
      if (pwd.newPwd.length < 8) return setErr('New password must be at least 8 characters.');
    }
    if (pwd.newPwd !== pwd.confirm) return setErr('Passwords do not match.');
    setOk(true);
    setPwd({ current: '', newPwd: '', confirm: '' });
    setTimeout(() => setOk(false), 3000);
  };
  return (
    <View>
      {ok ? <Banner text="Password updated successfully!" /> : null}
      {err ? <Banner text={err} tone="danger" /> : null}
      <Input label="Current Password" secure placeholder="••••••••" value={pwd.current} onChangeText={(v) => setPwd((p) => ({ ...p, current: v }))} />
      <Input label="New Password" secure placeholder="Min 8 characters" value={pwd.newPwd} onChangeText={(v) => setPwd((p) => ({ ...p, newPwd: v }))} />
      <Input
        label={adminStyle ? 'Confirm Password' : 'Confirm New Password'}
        secure
        placeholder="••••••••"
        value={pwd.confirm}
        onChangeText={(v) => setPwd((p) => ({ ...p, confirm: v }))}
      />
      <StrengthMeter pwd={pwd.newPwd} />
      <Button title="Update Password" icon={adminStyle ? 'key' : 'lock'} onPress={submit} />
    </View>
  );
}

export function EditToggle({ editing, onEdit, onCancel, onSave }: { editing: boolean; onEdit: () => void; onCancel: () => void; onSave: () => void }) {
  return editing ? (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <IconButton name="x" onPress={onCancel} />
      <Button title="Save" icon="save" small onPress={onSave} />
    </View>
  ) : (
    <Button title="Edit" icon="edit-2" small variant="secondary" onPress={onEdit} />
  );
}

const styles = StyleSheet.create({
  notif: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: space.sm,
  },
  notifIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold, marginTop: 6 },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  bubble: { paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: 18 },
  bubbleMine: { backgroundColor: colors.gold, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface2, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    paddingLeft: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: space.sm,
  },
  composerInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, paddingVertical: 8 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  tlDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlLine: { width: 1.5, flex: 1, minHeight: 18, backgroundColor: colors.border, marginVertical: 2 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: space.xl },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  camBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.bg,
  },
});
