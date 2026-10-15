import { Pressable, StyleSheet } from 'react-native';

import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';
import { colors, radius, shadows } from './theme';

type FloatingButtonProps = {
  label: string;
  icon: IconName;
  onPress: () => void;
};

// Botão flutuante acima das abas ("Nova compra", "Nova oferta").
export function FloatingButton({ label, icon, onPress }: FloatingButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.85 : 1 }]}>
      <Icon name={icon} size={20} color="surfaceWhite" />
      <Text variant="body16Medium" color="surfaceWhite">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingLeft: 18,
    paddingRight: 22,
    borderRadius: radius.full,
    backgroundColor: colors.primaryBase,
    ...shadows.md,
  },
});
