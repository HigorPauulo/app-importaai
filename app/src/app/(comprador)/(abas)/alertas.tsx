import { Header, Screen } from '@/shared/ui';

export default function AlertsScreen() {
  return (
    <Screen
      header={<Header title="Alertas" />}
      status="empty"
      empty={{
        icon: 'check-circle',
        title: 'Nenhum alerta',
        description: 'Tudo em dia. Avisamos aqui quando uma encomenda for taxada, atrasar, parar ou chegar perto do prazo de reclamação.',
      }}
    />
  );
}
