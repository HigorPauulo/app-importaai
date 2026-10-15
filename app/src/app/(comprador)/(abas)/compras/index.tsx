import { router, useLocalSearchParams } from 'expo-router';

import { useHasUnreadAlerts } from '@/features/alertas/ui/useUnreadAlerts';
import { PurchasesScreen } from '@/features/compras/ui/PurchasesScreen';

export default function PurchasesRoute() {
  // "Ver compras e ofertas" em Minhas lojas chega com a busca pronta pelo nome da loja.
  const { busca } = useLocalSearchParams<{ busca?: string }>();
  const hasUnreadAlerts = useHasUnreadAlerts();

  return (
    <PurchasesScreen
      key={busca}
      initialQuery={busca}
      onAlertsPress={() => router.push('/alertas')}
      hasUnreadAlerts={hasUnreadAlerts}
      onSimulatePress={() => router.push('/ofertas')}
      onNewPurchase={() => router.push('/compra/nova')}
      onPurchasePress={(id) => router.push({ pathname: '/compras/[id]', params: { id } })}
    />
  );
}
