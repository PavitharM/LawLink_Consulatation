import { Tabs } from 'expo-router';
import { tabIcon, tabScreenOptions } from '@/components/RoleGate';
import { useNotifications } from '@/context/NotificationContext';

export default function UserTabs() {
  const { unreadCount } = useNotifications();
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="complaints" options={{ title: 'Complaints', tabBarIcon: tabIcon('file-text') }} />
      <Tabs.Screen name="lawyers" options={{ title: 'Lawyers', tabBarIcon: tabIcon('users') }} />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Alerts', tabBarIcon: tabIcon('bell'), tabBarBadge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : undefined }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('user') }} />
    </Tabs>
  );
}
