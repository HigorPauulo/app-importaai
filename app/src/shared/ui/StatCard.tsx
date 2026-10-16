import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors, radius, shadows } from './theme';

type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
  // Destaque do painel: número grande, em azul escuro ("Em trânsito agora").
  isHighlighted?: boolean;
};

// "indicador" do painel: rótulo, número e uma linha de contexto.
export function StatCard({ label, value, caption, isHighlighted = false }: StatCardProps) {
  return (
    <View
      style={[styles.card, isHighlighted ? styles.highlighted : styles.regular]}
      accessible
      accessibilityLabel={[label, value, caption].filter(Boolean).join(', ')}>
      <Text variant={isHighlighted ? 'body14' : 'caption13'} color="textMuted">
        {label}
      </Text>
      <Text variant={isHighlighted ? 'display34' : 'section20'} color={isHighlighted ? 'primaryDark' : 'textStrong'}>
        {value}
      </Text>
      {caption && (
        <Text variant={isHighlighted ? 'caption13' : 'caption12'} color="textMuted">
          {caption}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, backgroundColor: colors.surfaceWhite, ...shadows.sm },
  highlighted: { gap: 4, padding: 16 },
  regular: { gap: 2, paddingVertical: 14, paddingHorizontal: 16 },
});
