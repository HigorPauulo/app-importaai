import { StyleSheet, View } from 'react-native';

import { Text, colors, radius, type ColorName } from '@/shared/ui';

import { STATUS_LABELS, type PurchaseStatus } from '../domain/purchaseList';

// Variantes do "Badge de Situação" do Figma: o azul fica mais forte conforme a compra se aproxima.
const variants: Record<PurchaseStatus, { background: ColorName; text: ColorName }> = {
  AWAITING_POSTING: { background: 'background', text: 'textMuted' },
  INTERNATIONAL_TRANSIT: { background: 'primaryLight', text: 'primaryDark' },
  IN_BRAZIL: { background: 'primaryBase', text: 'surfaceWhite' },
  DELIVERED: { background: 'successBg', text: 'successDark' },
  RETURNED: { background: 'errorBg', text: 'errorDark' },
};

export function StatusBadge({ status }: { status: PurchaseStatus }) {
  const variant = variants[status];

  return (
    <View style={[styles.badge, { backgroundColor: colors[variant.background] }]}>
      <Text variant="caption11Bold" color={variant.text}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
});
