import { router } from 'expo-router';

import { Header, Screen } from '@/shared/ui';

export default function ExchangeRatesScreen() {
  return (
    <Screen
      header={<Header title="Câmbio e impostos" subtitle="Base de todas as simulações" onAlertsPress={() => router.push('/integracao')} />}
      status="empty"
      empty={{
        icon: 'dollar',
        title: 'Nenhuma cotação ainda',
        description: 'As cotações de USD, CNY e EUR aparecem aqui depois da primeira busca automática.',
      }}
    />
  );
}
