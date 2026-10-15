import { router } from 'expo-router';

import { PurchasesScreen } from '@/features/compras/ui/PurchasesScreen';

export default function PurchasesRoute() {
  return (
    <PurchasesScreen
      onAlertsPress={() => router.push('/alertas')}
      onSimulatePress={() => router.push('/ofertas')}
      onNewPurchase={() => router.push('/compra/nova')}
      onPurchasePress={(id) => router.push({ pathname: '/compras/[id]', params: { id } })}
    />
  );
}
