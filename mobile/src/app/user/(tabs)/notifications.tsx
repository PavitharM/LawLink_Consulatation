import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useNotifications } from '@/context/NotificationContext';
import { groupByDate, NotificationCard } from '@/components/shared';
import { Button, Chip, ChipRow, Empty, Meta, PageHeader, Screen } from '@/components/ui';
import { space } from '@/theme';

const typeLabel: Record<string, string> = {
  lawyer: 'Assignment',
  case: 'Case Update',
  message: 'Message',
  payment: 'Payment',
  hearing: 'Hearing',
};

export default function Notifications() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead, dismiss, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  let items = notifications;
  if (filter === 'Unread') items = items.filter((n) => !n.read);
  if (filter === 'Read') items = items.filter((n) => n.read);
  if (typeFilter !== 'All') items = items.filter((n) => n.type === typeFilter);
  const grouped = groupByDate(items);
  const types = ['All', ...Array.from(new Set(notifications.map((n) => n.type).filter(Boolean) as string[]))];

  const open = (n: (typeof notifications)[number]) => {
    markRead(n.id);
    if (n.link) router.push(n.link as any);
  };

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
      }}
    >
      <PageHeader
        index={unreadCount > 0 ? `${unreadCount} unread` : '004'}
        eyebrow="Inbox"
        title="Notifications"
        subtitle="Stay updated on your cases, lawyer assignments and payments."
      />
      {unreadCount > 0 ? (
        <Button title="Mark all as read" icon="check-square" variant="secondary" small onPress={markAllRead} style={{ alignSelf: 'flex-start', marginBottom: space.lg }} />
      ) : null}

      <ChipRow>
        {['All', 'Unread', 'Read'].map((f) => (
          <Chip key={f} label={f} active={filter === f} count={f === 'Unread' ? unreadCount : undefined} onPress={() => setFilter(f)} />
        ))}
      </ChipRow>
      <ChipRow>
        {types.map((tp) => (
          <Chip key={tp} label={tp === 'All' ? 'All types' : typeLabel[tp] || tp} active={typeFilter === tp} onPress={() => setTypeFilter(tp)} />
        ))}
      </ChipRow>

      {Object.keys(grouped).length === 0 ? (
        <Empty icon="bell" title="No notifications" subtitle={filter === 'Unread' ? "You're all caught up!" : 'Nothing here yet.'} />
      ) : (
        Object.entries(grouped).map(([date, list]) => (
          <View key={date} style={{ marginBottom: space.lg }}>
            <Meta style={{ marginBottom: space.sm }}>{date}</Meta>
            {list.map((n) => (
              <NotificationCard
                key={n.id}
                n={n}
                label={typeLabel[n.type || ''] || n.type || undefined}
                onPress={() => open(n)}
                onMarkRead={() => markRead(n.id)}
                onDismiss={() => dismiss(n.id)}
                action={n.link ? { label: 'View →', onPress: () => open(n) } : undefined}
              />
            ))}
          </View>
        ))
      )}
      <Text />
    </Screen>
  );
}
