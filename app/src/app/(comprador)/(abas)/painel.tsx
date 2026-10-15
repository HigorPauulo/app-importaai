import { router } from 'expo-router';

import { Header, Screen } from '@/shared/ui';

export default function DashboardScreen() {
  return (
    <Screen
      header={<Header title="Painel" subtitle="Suas compras em números" onAlertsPress={() => router.push('/alertas')} />}
      status="empty"
      empty={{
        icon: 'chart',
        title: 'Seu painel começa na primeira compra',
        description: 'Cadastre uma compra para ver o valor em trânsito, os gastos, os impostos e a pontualidade de cada loja.',
      }}
    />
  );
}
