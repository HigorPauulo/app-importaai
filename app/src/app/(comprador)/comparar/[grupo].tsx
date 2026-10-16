import { router, useLocalSearchParams } from 'expo-router';

import { ComparisonScreen } from '@/features/ofertas/ui/ComparisonScreen';

export default function ComparisonRoute() {
  const { grupo } = useLocalSearchParams<{ grupo: string }>();

  return (
    <ComparisonScreen
      groupId={grupo}
      onBack={() => router.back()}
      onBuy={(offerId) => router.push({ pathname: '/compra/nova', params: { oferta: offerId } })}
      onOpenPurchase={(id) => router.navigate({ pathname: '/compras/[id]', params: { id } })}
    />
  );
}
