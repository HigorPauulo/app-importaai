import { router } from 'expo-router';

import { DashboardScreen } from '@/features/compras/ui/DashboardScreen';

export default function DashboardRoute() {
  return <DashboardScreen onAlertsPress={() => router.push('/alertas')} onNewPurchase={() => router.push('/compra/nova')} />;
}
