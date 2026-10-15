import { router } from 'expo-router';

import { PurchaseFormScreen } from '@/features/compras/ui/PurchaseFormScreen';

export default function NewPurchaseRoute() {
  return (
    <PurchaseFormScreen
      onBack={() => router.back()}
      onSaved={(id) => router.replace({ pathname: '/compras/[id]', params: { id } })}
      onOpenPurchase={(id) => router.replace({ pathname: '/compras/[id]', params: { id } })}
    />
  );
}
