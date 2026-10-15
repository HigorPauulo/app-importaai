import { TabBar, type Tab } from '@/shared/ui';

const ADMIN_TABS: readonly Tab[] = [
  { name: 'contas', href: '/contas', label: 'Contas', icon: 'users' },
  { name: 'cambio', href: '/cambio', label: 'Câmbio', icon: 'dollar' },
  { name: 'integracao', href: '/integracao', label: 'Integração', icon: 'activity' },
];

export default function AdminTabsLayout() {
  return <TabBar tabs={ADMIN_TABS} />;
}
