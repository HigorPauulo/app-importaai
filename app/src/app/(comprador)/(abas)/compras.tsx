import { router } from 'expo-router';

import { Header, Screen } from '@/shared/ui';

export default function PurchasesScreen() {
  return (
    <Screen
      header={<Header title="Compras" onAlertsPress={() => router.push('/alertas')} />}
      status="empty"
      empty={{
        icon: 'package',
        title: 'Nenhuma compra ainda',
        description: 'Cadastre uma compra com o código de rastreio, ou simule uma oferta antes de comprar.',
      }}
    />
  );
}
