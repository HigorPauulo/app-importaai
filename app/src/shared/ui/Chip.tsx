import { Pressable, StyleSheet } from 'react-native';

import { Text } from './Text';
import { colors, radius } from './theme';

type ChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

export function Chip({ label, isActive, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      // 36 de altura no Figma; a área de toque chega aos 48 dp exigidos sem mudar o desenho.
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      style={[styles.base, isActive ? styles.active : styles.inactive]}>
      <Text variant="body14Medium" color={isActive ? 'surfaceWhite' : 'textStrong'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 36, justifyContent: 'center', borderRadius: radius.full },
  active: { paddingHorizontal: 14, backgroundColor: colors.primaryBase },
  inactive: { paddingHorizontal: 13, borderWidth: 1, borderColor: colors.borderDefault, backgroundColor: colors.surfaceWhite },
});
