import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors, radius, type ColorName } from './theme';

type ProgressRowProps = {
  label: string;
  value: number;
  max: number;
  // Texto no lugar do número, como "+ R$ 33,12" na comparação (T12).
  valueLabel?: string;
  trackColor?: ColorName;
};

// "linha" com trilho: o rótulo e o valor em cima, a proporção na barra embaixo.
export function ProgressRow({ label, value, max, valueLabel, trackColor = 'background' }: ProgressRowProps) {
  const text = valueLabel ?? String(value);
  const width = max > 0 ? Math.min(100, (Math.abs(value) / max) * 100) : 0;

  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${text}`}>
      <View style={styles.texts}>
        <Text variant="body14">{label}</Text>
        <Text variant="body14Medium">{text}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors[trackColor] }]}>
        <View style={[styles.fill, { width: `${width}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6 },
  texts: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 8, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: 8, borderRadius: radius.full, backgroundColor: colors.primaryBase },
});
