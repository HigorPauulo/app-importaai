import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors, radius, shadows, type ColorName } from './theme';

type ToastType = 'success' | 'warning' | 'error';

type ToastProps = {
  type: ToastType;
  title: string;
  message?: string;
};

// Variantes do "Toast" do Figma. O texto usa o tom escuro de cada cor: o tom do Figma
// sobre o fundo claro não chega ao contraste AA exigido em usabilidade-e-acessibilidade.md.
const variants: Record<ToastType, { background: ColorName; accent: ColorName; text: ColorName }> = {
  success: { background: 'successBg', accent: 'success', text: 'successDark' },
  warning: { background: 'warningBg', accent: 'warning', text: 'warningDark' },
  error: { background: 'errorBg', accent: 'error', text: 'errorDark' },
};

export function Toast({ type, title, message }: ToastProps) {
  const spec = variants[type];

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor: colors[spec.background] }]}>
      <View style={[styles.accent, { backgroundColor: colors[spec.accent] }]} />
      <View style={styles.texts}>
        <Text variant="body14Bold" color={spec.text}>
          {title}
        </Text>
        {message && (
          <Text variant="caption12" color={spec.text}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 16,
    borderRadius: radius.sm,
    ...shadows.md,
  },
  accent: { width: 4, borderRadius: 2 },
  texts: { flex: 1, gap: 2 },
});
