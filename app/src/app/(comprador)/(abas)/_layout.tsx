import { TabBar, type Tab } from '@/shared/ui';

const BUYER_TABS: readonly Tab[] = [
  { name: 'compras', href: '/compras', label: 'Compras', icon: 'package' },
  { name: 'ofertas', href: '/ofertas', label: 'Ofertas', icon: 'tag' },
  { name: 'painel', href: '/painel', label: 'Painel', icon: 'chart' },
  { name: 'alertas', href: '/alertas', label: 'Alertas', icon: 'bell' },
];

export default function BuyerTabsLayout() {
  return <TabBar tabs={BUYER_TABS} />;
}
