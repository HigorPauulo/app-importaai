import { router, useLocalSearchParams } from 'expo-router';

import { PurchaseDetailScreen } from '@/features/compras/ui/PurchaseDetailScreen';

export default function PurchaseDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PurchaseDetailScreen
      purchaseId={id}
      // navigate, e não back: aberto a partir do formulário, o histórico não termina na lista.
      onBack={() => router.navigate('/compras')}
      onEdit={() => router.push({ pathname: '/compra/editar/[id]', params: { id } })}
    />
  );
}
