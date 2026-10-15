import { router } from 'expo-router';

import { Header, Screen } from '@/shared/ui';

export default function AccountsScreen() {
  return (
    <Screen
      header={<Header title="Contas" subtitle="Administração" onAlertsPress={() => router.push('/integracao')} />}
      status="empty"
      empty={{
        icon: 'users',
        title: 'Nenhuma conta ainda',
        description: 'As contas dos compradores aparecem aqui assim que forem criadas.',
      }}
    />
  );
}
