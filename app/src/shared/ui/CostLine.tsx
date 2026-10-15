import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors } from './theme';

type CostLineProps = {
  label: string;
  caption?: string;
  value: string;
  isTotal?: boolean;
};

// "Linha de Custo" do Figma: rótulo com explicação curta embaixo e o valor à direita.
// A linha de total ganha o divisor acima e o valor maior, em azul escuro.
export function CostLine({ label, caption, value, isTotal = false }: CostLineProps) {
  return (
    <View style={[styles.line, isTotal && styles.total]} accessible accessibilityLabel={[label, caption, value].filter(Boolean).join(', ')}>
      <View style={styles.label}>
        <Text variant={isTotal ? 'body14Medium' : 'body14'} color={isTotal ? 'textStrong' : 'textMuted'}>
          {label}
        </Text>
        {caption && (
          <Text variant="caption12" color="textMuted">
            {caption}
          </Text>
        )}
      </View>
      <Text variant={isTotal ? 'body16Medium' : 'body14Medium'} color={isTotal ? 'primaryDark' : 'textStrong'}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { flexShrink: 1 },
  total: { paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderDefault },
});
