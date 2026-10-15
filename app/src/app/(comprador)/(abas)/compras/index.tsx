import { router, useLocalSearchParams } from 'expo-router';

import { PurchasesScreen } from '@/features/compras/ui/PurchasesScreen';

export default function PurchasesRoute() {
  // "Ver compras e ofertas" em Minhas lojas chega com a busca pronta pelo nome da loja.
  const { busca } = useLocalSearchParams<{ busca?: string }>();

  return (
    <PurchasesScreen
      key={busca}
      initialQuery={busca}
      onAlertsPress={() => router.push('/alertas')}
      onSimulatePress={() => router.push('/ofertas')}
      onNewPurchase={() => router.push('/compra/nova')}
      onPurchasePress={(id) => router.push({ pathname: '/compras/[id]', params: { id } })}
    />
  );
}
