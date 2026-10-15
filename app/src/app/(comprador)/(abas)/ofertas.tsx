import { router } from 'expo-router';

import { useHasUnreadAlerts } from '@/features/alertas/ui/useUnreadAlerts';
import { OffersScreen } from '@/features/ofertas/ui/OffersScreen';

export default function OffersRoute() {
  const hasUnreadAlerts = useHasUnreadAlerts();

  return (
    <OffersScreen
      onAlertsPress={() => router.push('/alertas')}
      hasUnreadAlerts={hasUnreadAlerts}
      onNewOffer={(groupId) => router.push({ pathname: '/oferta/nova', params: groupId ? { grupo: groupId } : {} })}
      onOfferPress={(id) => router.push({ pathname: '/oferta/[id]', params: { id } })}
    />
  );
}
