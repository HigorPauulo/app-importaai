import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Icon } from './Icon';
import type { IconName } from './icons';
import { type ColorName } from './theme';

type IconButtonProps = Omit<PressableProps, 'children' | 'accessibilityLabel'> & {
  icon: IconName;
  accessibilityLabel: string;
  color?: ColorName;
};

// Botão só com ícone (voltar, mais ações): 48 dp de toque em volta do ícone de 24.
export function IconButton({ icon, color = 'textStrong', style, ...rest }: IconButtonProps) {
  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      style={(state) => [styles.base, { opacity: state.pressed ? 0.6 : 1 }, typeof style === 'function' ? style(state) : style]}>
      <Icon name={icon} size={24} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
