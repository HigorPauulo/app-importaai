import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text, colors, radius, shadows } from '@/shared/ui';

import type { OfferGroup } from '../domain/offerList';
import { OfferRow } from './OfferRow';

type OfferGroupCardProps = {
  group: OfferGroup;
  onCompare?: () => void;
  onOfferPress?: (offerId: string) => void;
  onAddOffer?: () => void;
};

// "grupo-produto" da T10: o produto, as ofertas dele e "Comparar". Com uma oferta só,
// convida a adicionar outra loja (telas.md).
export function OfferGroupCard({ group, onCompare, onOfferPress, onAddOffer }: OfferGroupCardProps) {
  const count = group.offers.length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.texts}>
          <Text variant="body16Medium" accessibilityRole="header">
            {group.name}
          </Text>
          <Text variant="caption12" color="textMuted">
            {count} {count === 1 ? 'oferta' : 'ofertas'}
          </Text>
        </View>
        {count >= 2 && onCompare && (
          <Pressable onPress={onCompare} accessibilityRole="button" accessibilityLabel={`Comparar ofertas de ${group.name}`} style={styles.link}>
            <Icon name="scale" size={18} color="primaryBase" />
            <Text variant="body14Medium" color="primaryBase">
              Comparar
            </Text>
          </Pressable>
        )}
      </View>
      {group.offers.map((offer) => (
        <View key={offer.id} style={styles.divider}>
          <OfferRow offer={offer} onPress={onOfferPress && (() => onOfferPress(offer.id))} />
        </View>
      ))}
      {count === 1 && onAddOffer && (
        <Pressable onPress={onAddOffer} accessibilityRole="button" style={[styles.divider, styles.add]}>
          <Icon name="plus" size={18} color="primaryBase" />
          <Text variant="body14Medium" color="primaryBase">
            Adicionar outra loja para comparar
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, backgroundColor: colors.surfaceWhite, overflow: 'hidden', ...shadows.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingLeft: 16, paddingRight: 8 },
  texts: { flex: 1 },
  link: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.borderDefault },
  add: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
});
