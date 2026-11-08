import { RoleStack } from '@/components/RoleGate';

export default function Layout() {
  return <RoleStack allowed="lawyer" />;
}
