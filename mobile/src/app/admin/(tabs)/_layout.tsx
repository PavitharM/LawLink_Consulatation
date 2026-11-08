import { Tabs } from 'expo-router';
import { tabIcon, tabScreenOptions } from '@/components/RoleGate';

export default function AdminTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="complaints" options={{ title: 'Complaints', tabBarIcon: tabIcon('briefcase') }} />
      <Tabs.Screen name="users" options={{ title: 'Users', tabBarIcon: tabIcon('users') }} />
      <Tabs.Screen name="lawyers" options={{ title: 'Lawyers', tabBarIcon: tabIcon('award') }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: tabIcon('menu') }} />
    </Tabs>
  );
}
