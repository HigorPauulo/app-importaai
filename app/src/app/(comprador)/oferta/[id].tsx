import { router, useLocalSearchParams } from 'expo-router';

import { OfferScreen } from '@/features/ofertas/ui/OfferScreen';

export default function OfferRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <OfferScreen
      offerId={id}
      onBack={() => router.back()}
      onSaved={() => router.back()}
      onConvert={(offerId) => router.replace({ pathname: '/compra/nova', params: { oferta: offerId } })}
      onOpenPurchase={(purchaseId) => router.navigate({ pathname: '/compras/[id]', params: { id: purchaseId } })}
    />
  );
}
