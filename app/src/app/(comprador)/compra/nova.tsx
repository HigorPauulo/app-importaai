import { router, useLocalSearchParams } from 'expo-router';

import { PurchaseFormScreen } from '@/features/compras/ui/PurchaseFormScreen';

export default function NewPurchaseRoute() {
  // Vindo de "Converter em compra" (T11), chega com a oferta para preencher o formulário.
  const { oferta } = useLocalSearchParams<{ oferta?: string }>();

  return (
    <PurchaseFormScreen
      offerId={oferta}
      onBack={() => router.back()}
      onSaved={(id) => router.replace({ pathname: '/compras/[id]', params: { id } })}
      onOpenPurchase={(id) => router.replace({ pathname: '/compras/[id]', params: { id } })}
    />
  );
}
