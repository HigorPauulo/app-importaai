import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';

import { DelayBadge, describeDelay } from './DelayBadge';

type PunctualityRowProps = { storeName: string; deliveries: number; averageDelay: number };

// "loja" da pontualidade (RF-19): nome, número de entregas e o atraso médio.
export function PunctualityRow({ storeName, deliveries, averageDelay }: PunctualityRowProps) {
  const deliveriesLabel = `${deliveries} ${deliveries === 1 ? 'entrega' : 'entregas'}`;

  return (
    <View style={styles.row} accessible accessibilityLabel={`${storeName}, ${deliveriesLabel}, ${describeDelay(averageDelay).label}`}>
      <View style={styles.texts}>
        <Text variant="body14Medium">{storeName}</Text>
        <Text variant="caption12" color="textMuted">
          {deliveriesLabel}
        </Text>
      </View>
      <DelayBadge averageDelay={averageDelay} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  texts: { flex: 1 },
});
