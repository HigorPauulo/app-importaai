import { Pressable, StyleSheet, View } from 'react-native';

import { storeMonogram } from '@/features/compras/domain/stores';
import { Monogram, Text, colors, radius } from '@/shared/ui';

import type { OfferView } from '../domain/offerList';

// "Linha de Oferta": loja, preço na origem, custo final estimado (RN07, RN10) e a diferença para a menor.
export function OfferRow({ offer, onPress }: { offer: OfferView; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={[
        offer.storeName,
        offer.origin,
        `custo final estimado ${offer.total}`,
        offer.isCheapest ? 'menor custo' : offer.difference,
      ]
        .filter(Boolean)
        .join(', ')}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Monogram letter={storeMonogram(offer.storeName)} />
      <View style={styles.texts}>
        <Text variant="body16Medium" numberOfLines={1}>
          {offer.storeName}
        </Text>
        <Text variant="caption12" color="textMuted">
          {offer.origin}
        </Text>
      </View>
      <View style={styles.cost}>
        <Text variant="body16Medium">{offer.total}</Text>
        {offer.isCheapest && (
          <View style={styles.badge}>
            <Text variant="caption11Bold" color="successDark">
              MENOR CUSTO
            </Text>
          </View>
        )}
        {offer.difference && (
          <Text variant="caption12" color="textMuted">
            {offer.difference}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  pressed: { backgroundColor: colors.background },
  texts: { flex: 1, gap: 2 },
  cost: { alignItems: 'flex-end', gap: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.successBg },
});
