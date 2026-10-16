import { StyleSheet, View } from 'react-native';

import { Button, FloatingButton, Header, Icon, Screen, Text } from '@/shared/ui';

import { describeEstimateNote, groupOffers } from '../domain/offerList';
import { OfferGroupCard } from './OfferGroupCard';
import { useOffers } from './useOffers';

type OffersScreenProps = {
  onAlertsPress: () => void;
  hasUnreadAlerts?: boolean;
  onNewOffer?: (groupId?: string) => void;
  onOfferPress?: (offerId: string) => void;
  onCompare?: (groupId: string) => void;
};

// T10 · Ofertas (RF-04, RF-20).
export function OffersScreen({ onAlertsPress, hasUnreadAlerts, onNewOffer, onOfferPress, onCompare }: OffersScreenProps) {
  const { state, reload } = useOffers();
  const now = new Date();
  const groups = state.status === 'ready' ? groupOffers(state.offers, state.rates, state.taxVersions, now) : [];
  const note = describeEstimateNote(groups, now);

  return (
    <Screen
      header={<Header title="Ofertas" subtitle="Custo final antes de comprar" onAlertsPress={onAlertsPress} hasUnreadAlerts={hasUnreadAlerts} />}
      status={state.status === 'ready' ? (groups.length > 0 ? 'content' : 'empty') : state.status}
      onRetry={reload}
      empty={{
        icon: 'tag',
        title: 'Simule antes de comprar',
        description: 'Informe o preço e o frete de uma loja e veja o custo final em reais, com imposto de importação e ICMS.',
        action: onNewOffer && <Button label="Simular uma oferta" variant="secondary" onPress={() => onNewOffer()} style={styles.stretch} />,
      }}
      floatingAction={onNewOffer && <FloatingButton label="Nova oferta" icon="plus" onPress={() => onNewOffer()} />}>
      {groups.map((group) => (
        <OfferGroupCard
          key={group.id}
          group={group}
          onCompare={onCompare && (() => onCompare(group.id))}
          onOfferPress={onOfferPress}
          onAddOffer={onNewOffer && (() => onNewOffer(group.id))}
        />
      ))}
      {note && (
        <View style={styles.note}>
          <Icon name={note.isStale ? 'alert' : 'clock'} size={14} color={note.isStale ? 'warningDark' : 'textMuted'} />
          <Text variant="caption12" color={note.isStale ? 'warningDark' : 'textMuted'}>
            {note.text}
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stretch: { alignSelf: 'stretch' },
  note: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 4 },
});
