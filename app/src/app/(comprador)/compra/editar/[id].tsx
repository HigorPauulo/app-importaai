import { router, useLocalSearchParams } from 'expo-router';

import { PurchaseFormScreen } from '@/features/compras/ui/PurchaseFormScreen';

export default function EditPurchaseRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PurchaseFormScreen
      purchaseId={id}
      onBack={() => router.back()}
      onSaved={() => router.back()}
      onOpenPurchase={(existingId) => router.replace({ pathname: '/compras/[id]', params: { id: existingId } })}
    />
  );
}
