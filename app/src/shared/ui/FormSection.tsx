import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from './Text';

// Bloco do formulário com o rótulo em caixa alta ("PRODUTO", "VALORES").
export function FormSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="caption12Bold" color="textMuted" accessibilityRole="header">
        {label.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
});
