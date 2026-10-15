import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors } from './theme';

export type Bar = { label: string; value: number; caption: string; isCurrent: boolean };

const MAX_BAR_HEIGHT = 88;

// "gasto-por-mes": colunas proporcionais ao maior valor; a coluna atual em azul, com o valor em cima.
// Os valores de cada mês vão no rótulo de acessibilidade, já que o leitor de tela não vê a altura.
export function BarChart({ bars }: { bars: readonly Bar[] }) {
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <View accessible accessibilityLabel={bars.map((bar) => `${bar.label}: ${bar.caption}`).join(', ')}>
      <View style={styles.columns}>
        {bars.map((bar) => (
          <View key={bar.label} style={styles.column}>
            {bar.isCurrent && (
              <Text variant="caption12Bold" numberOfLines={1}>
                {bar.caption}
              </Text>
            )}
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(bar.value > 0 ? 4 : 0, (bar.value / max) * MAX_BAR_HEIGHT),
                  backgroundColor: bar.isCurrent ? colors.primaryBase : colors.borderInput,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {bars.map((bar) => (
          <Text
            key={bar.label}
            variant={bar.isCurrent ? 'caption12Bold' : 'caption12'}
            color={bar.isCurrent ? 'textStrong' : 'textMuted'}
            align="center"
            style={styles.label}>
            {bar.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  columns: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: { width: 28, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  labels: { flexDirection: 'row', gap: 8, marginTop: 12 },
  label: { flex: 1 },
});
