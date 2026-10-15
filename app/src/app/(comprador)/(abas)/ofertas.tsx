import { router } from 'expo-router';

import { Header, Screen } from '@/shared/ui';

export default function OffersScreen() {
  return (
    <Screen
      header={<Header title="Ofertas" subtitle="Custo final antes de comprar" onAlertsPress={() => router.push('/alertas')} />}
      status="empty"
      empty={{
        icon: 'tag',
        title: 'Nenhuma oferta ainda',
        description: 'Registre o preço que encontrou numa loja e veja quanto custa em reais, com frete e impostos, antes de comprar.',
      }}
    />
  );
}
