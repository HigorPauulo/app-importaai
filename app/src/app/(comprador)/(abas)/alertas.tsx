import { router } from 'expo-router';

import { AlertsScreen } from '@/features/alertas/ui/AlertsScreen';

export default function AlertsRoute() {
  return (
    <AlertsScreen
      onOpenPurchase={(id) => router.navigate({ pathname: '/compras/[id]', params: { id } })}
      onEditPurchase={(id) => router.push({ pathname: '/compra/editar/[id]', params: { id } })}
    />
  );
}
