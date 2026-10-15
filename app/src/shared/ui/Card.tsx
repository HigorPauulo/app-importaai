import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { colors, radius, shadows } from './theme';

type CardProps = {
  title?: string;
  // Explicação curta abaixo do título.
  subtitle?: string;
  // Título menor, dos cards do painel (T06); o padrão é o de seção, dos detalhes (T04).
  isCompact?: boolean;
  // Texto de apoio à direita do título, como "atualizado às 14:32".
  aside?: string;
  gap?: number;
  style?: ViewStyle;
  children: ReactNode;
};

// Bloco branco das telas de detalhe (Valores, Prazo, Rastreio).
export function Card({ title, subtitle, isCompact = false, aside, gap = 10, style, children }: CardProps) {
  return (
    <View style={[styles.card, { gap }, style]}>
      {title && (
        <View style={styles.titleBlock}>
          <View style={styles.title}>
            <Text variant={isCompact ? 'body16Medium' : 'section18'} accessibilityRole="header">
              {title}
            </Text>
            {aside && (
              <Text variant="caption12" color="textMuted">
                {aside}
              </Text>
            )}
          </View>
          {subtitle && (
            <Text variant="caption12" color="textMuted">
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: radius.card, backgroundColor: colors.surfaceWhite, ...shadows.sm },
  titleBlock: { gap: 2 },
  title: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
