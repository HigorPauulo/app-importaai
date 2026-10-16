import { router, useLocalSearchParams } from 'expo-router';

import { OfferScreen } from '@/features/ofertas/ui/OfferScreen';

export default function NewOfferRoute() {
  // "Adicionar outra loja para comparar" chega com o grupo; "Nova oferta" abre um grupo novo.
  const { grupo } = useLocalSearchParams<{ grupo?: string }>();

  return (
    <OfferScreen
      groupId={grupo}
      onBack={() => router.back()}
      onSaved={() => router.back()}
      onConvert={(offerId) => router.replace({ pathname: '/compra/nova', params: { oferta: offerId } })}
      onOpenPurchase={(id) => router.navigate({ pathname: '/compras/[id]', params: { id } })}
    />
  );
}
