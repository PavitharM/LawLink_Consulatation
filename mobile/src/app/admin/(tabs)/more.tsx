import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Avatar, Button, Card, IconName, PageHeader, Screen } from '@/components/ui';
import { colors, space, type as t } from '@/theme';

const links: { label: string; desc: string; icon: IconName; to: string }[] = [
  { label: 'Packages', desc: 'Create and manage legal service packages', icon: 'package', to: '/admin/packages' },
  { label: 'Articles', desc: 'Legal knowledge articles for users', icon: 'file-text', to: '/admin/articles' },
  { label: 'Reports', desc: 'Platform analytics and metrics', icon: 'bar-chart-2', to: '/admin/report' },
  { label: 'Notifications', desc: 'Platform alerts and preferences', icon: 'bell', to: '/admin/notifications' },
  { label: 'My Profile', desc: 'Account details and security', icon: 'user', to: '/admin/profile' },
];

export default function AdminMore() {
  const router = useRouter();
  const { user, logout } = useAuth();
  return (
    <Screen>
      <PageHeader index="005" eyebrow="Administration" title="More" />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xl }} onPress={() => router.push('/admin/profile')}>
        <Avatar name={user?.name} size={48} gold />
        <View style={{ flex: 1 }}>
          <Text style={t.h3}>{user?.name || 'Admin'}</Text>
          <Text style={t.bodySm}>{user?.email}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textDim} />
      </Card>
      <Card style={{ paddingVertical: space.xs, marginBottom: space.xl }}>
        {links.map((l, i) => (
          <Pressable
            key={l.to}
            onPress={() => router.push(l.to as any)}
            style={({ pressed }) => [
              { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg },
              i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border },
              pressed && { opacity: 0.6 },
            ]}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.goldDim, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={l.icon} size={17} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={t.label}>{l.label}</Text>
              <Text style={t.bodySm}>{l.desc}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textDim} />
          </Pressable>
        ))}
      </Card>
      <Button
        title="Logout"
        icon="log-out"
        variant="danger"
        onPress={() => {
          logout();
          router.replace('/login');
        }}
      />
    </Screen>
  );
}
