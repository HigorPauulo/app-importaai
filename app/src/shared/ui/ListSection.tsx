import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors, radius } from './theme';

type ListSectionProps = {
  title: string;
  count: number;
  isHighlighted?: boolean;
  children: ReactNode;
};

// "secao" das listas: título com a contagem; a seção que pede ação ganha a contagem em amarelo.
export function ListSection({ title, count, isHighlighted = false, children }: ListSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.title} accessible accessibilityRole="header" accessibilityLabel={`${title}, ${count}`}>
        <Text variant="body14Medium">{title}</Text>
        <View style={[styles.count, { backgroundColor: isHighlighted ? colors.warningBg : colors.borderDefault }]}>
          <Text variant="caption12Bold" color={isHighlighted ? 'warningDark' : 'textMuted'}>
            {count}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingTop: 8 },
  title: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: radius.full },
});
