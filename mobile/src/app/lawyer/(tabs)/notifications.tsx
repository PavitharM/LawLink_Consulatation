import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useNotifications } from '@/context/NotificationContext';
import { groupByDate, NotificationCard } from '@/components/shared';
import { Button, Chip, ChipRow, Empty, Meta, PageHeader, Screen } from '@/components/ui';
import { space } from '@/theme';

const typeLabel: Record<string, string> = { case: 'Case', message: 'Message', hearing: 'Hearing', payment: 'Payment', review: 'Review' };

export default function LawyerNotifications() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead, dismiss, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // The lawyer page groups by en-GB dates on the web
  const items = useMemo(
    () =>
      notifications
        .filter((n) => (filter === 'Unread' ? !n.read : filter === 'Read' ? n.read : true))
        .map((n) => ({ ...n, date: new Date(n.createdAt).toLocaleDateString('en-GB') })),
    [notifications, filter]
  );
  const grouped = groupByDate(items);

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
        subtitle="Stay on top of case assignments, client messages and hearings."
      />
      {unreadCount > 0 ? (
        <Button title="Mark all as read" icon="check-square" variant="secondary" small onPress={markAllRead} style={{ alignSelf: 'flex-start', marginBottom: space.lg }} />
      ) : null}
      <ChipRow>
        {['All', 'Unread', 'Read'].map((f) => (
          <Chip key={f} label={f === 'Unread' && unreadCount > 0 ? `Unread (${unreadCount})` : f} active={filter === f} onPress={() => setFilter(f)} />
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
                onPress={() => markRead(n.id)}
                onMarkRead={() => markRead(n.id)}
                onDismiss={() => dismiss(n.id)}
                action={n.type === 'message' ? { label: 'Reply to Message', onPress: () => router.push('/lawyer/cases') } : undefined}
              />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}
