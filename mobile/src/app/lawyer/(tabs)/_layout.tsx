import { Tabs } from 'expo-router';
import { tabIcon, tabScreenOptions } from '@/components/RoleGate';
import { useNotifications } from '@/context/NotificationContext';

export default function LawyerTabs() {
  const { unreadCount } = useNotifications();
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="cases" options={{ title: 'Cases', tabBarIcon: tabIcon('briefcase') }} />
      <Tabs.Screen name="packages" options={{ title: 'Packages', tabBarIcon: tabIcon('package') }} />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Alerts', tabBarIcon: tabIcon('bell'), tabBarBadge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : undefined }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('user') }} />
    </Tabs>
  );
}
