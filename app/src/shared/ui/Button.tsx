import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Text } from './Text';
import { colors, radius, type ColorName } from './theme';

type ButtonVariant = 'primary' | 'secondary' | 'text';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
};

// Variantes do componente "Botão" do Figma: cor de fundo, borda e cor do rótulo.
const variants: Record<ButtonVariant, { background?: ColorName; border?: ColorName; label: ColorName; height: number }> = {
  primary: { background: 'primaryBase', label: 'surfaceWhite', height: 52 },
  secondary: { background: 'surfaceWhite', border: 'primaryBase', label: 'primaryBase', height: 52 },
  text: { label: 'primaryBase', height: 44 },
};

export function Button({ label, variant = 'primary', isLoading = false, disabled, style, ...rest }: ButtonProps) {
  const spec = variants[variant];
  const isDisabled = disabled || isLoading;
  const background = isLoading ? 'primaryDark' : disabled ? 'borderDefault' : spec.background;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      style={(state) => [
        styles.base,
        {
          height: spec.height,
          backgroundColor: background && colors[background],
          borderColor: spec.border && !disabled ? colors[spec.border] : undefined,
          borderWidth: spec.border && !disabled ? 1.5 : 0,
          opacity: state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}>
      {isLoading && <ActivityIndicator size={18} color={colors.surfaceWhite} />}
      <Text variant="body16Medium" color={disabled ? 'textMuted' : spec.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: radius.md,
  },
});
