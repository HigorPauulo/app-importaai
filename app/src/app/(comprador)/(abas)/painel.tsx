import { router } from 'expo-router';

import { useHasUnreadAlerts } from '@/features/alertas/ui/useUnreadAlerts';
import { DashboardScreen } from '@/features/compras/ui/DashboardScreen';

export default function DashboardRoute() {
  const hasUnreadAlerts = useHasUnreadAlerts();

  return (
    <DashboardScreen
      onAlertsPress={() => router.push('/alertas')}
      hasUnreadAlerts={hasUnreadAlerts}
      onNewPurchase={() => router.push('/compra/nova')}
    />
  );
}
