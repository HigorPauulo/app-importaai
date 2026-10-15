import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';
import { colors } from './theme';

// "rodape-fixo" dos formulários: a ação principal sempre visível, com uma linha de apoio.
export function StickyFooter({ caption, children }: { caption?: string; children: ReactNode }) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: 16 + bottom }]}>
      {children}
      {caption && (
        <Text variant="caption12" color="textMuted" align="center">
          {caption}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: 8,
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceWhite,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
});
