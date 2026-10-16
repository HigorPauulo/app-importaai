import { StyleSheet, View } from 'react-native';

import { Text, colors, radius, type ColorName } from '@/shared/ui';

import type { CompositionPart } from '../domain/offerSimulation';

// Do mais escuro ao mais claro: o que se paga à loja e, depois, os impostos.
const PART_COLORS: Record<CompositionPart['key'], ColorName> = {
  PAID: 'primaryDark',
  IMPORT_TAX: 'primaryBase',
  ICMS: 'borderInput',
};

// "barra-empilhada" e "legenda" da T11. As porcentagens e os valores estão na legenda, em texto,
// para o leitor de tela e para quem não distingue as cores.
export function CompositionChart({ parts }: { parts: readonly CompositionPart[] }) {
  return (
    <View style={styles.container}>
      <View style={styles.bar} accessible={false} importantForAccessibility="no-hide-descendants">
        {parts
          .filter((part) => part.share > 0)
          .map((part) => (
            <View key={part.key} style={{ flex: part.share, backgroundColor: colors[PART_COLORS[part.key]] }} />
          ))}
      </View>
      <View style={styles.legend}>
        {parts.map((part) => (
          <View key={part.key} style={styles.item} accessible accessibilityLabel={`${part.label}, ${part.percent}%, ${part.value}`}>
            <View style={[styles.swatch, { backgroundColor: colors[PART_COLORS[part.key]] }]} />
            <Text variant="body14" style={styles.label}>
              {part.label}
            </Text>
            <Text variant="caption12" color="textMuted">
              {part.percent}%
            </Text>
            <Text variant="body14Medium" align="right" style={styles.value}>
              {part.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  bar: { height: 14, flexDirection: 'row', gap: 2, borderRadius: radius.sm, overflow: 'hidden' },
  legend: { gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  label: { flex: 1 },
  value: { minWidth: 78 },
});
