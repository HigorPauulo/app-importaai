import { Header, Screen } from '@/shared/ui';

export default function IntegrationScreen() {
  return (
    <Screen
      header={<Header title="Integração" subtitle="Fonte de rastreio e cotação" />}
      status="empty"
      empty={{
        icon: 'activity',
        title: 'Nenhuma execução ainda',
        description: 'As execuções das rotinas de rastreio e cotação aparecem aqui assim que rodarem.',
      }}
    />
  );
}
