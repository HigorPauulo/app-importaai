import { StyleSheet, View } from 'react-native';

import { Text, colors, radius, type ColorName } from '@/shared/ui';

import type { PurchaseFlag } from '../domain/purchaseList';

type Tone = 'warning' | 'error' | 'neutral';

// Cor de cada "Sinalização" do Figma: vermelho para o que já passou do prazo, amarelo para o que pede ação.
const toneOf: Record<PurchaseFlag, Tone> = {
  TAX_TO_REGISTER: 'warning',
  TAX_PENDING: 'warning',
  TAX_OVERDUE: 'error',
  DELAYED: 'error',
  STALLED: 'warning',
  CLAIM_WINDOW_CLOSING: 'warning',
  CLAIM_WINDOW_CLOSED: 'neutral',
};

const tones: Record<Tone, { background: ColorName; text: ColorName }> = {
  warning: { background: 'warningBg', text: 'warningDark' },
  error: { background: 'errorBg', text: 'errorDark' },
  neutral: { background: 'background', text: 'textMuted' },
};

export function FlagTag({ flag, label }: { flag: PurchaseFlag; label: string }) {
  const tone = tones[toneOf[flag]];

  return (
    <View style={[styles.tag, { backgroundColor: colors[tone.background] }]}>
      <View style={[styles.dot, { backgroundColor: colors[tone.text] }]} />
      <Text variant="caption12Bold" color={tone.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: radius.sm,
  },
  dot: { width: 6, height: 6, borderRadius: radius.full },
});
