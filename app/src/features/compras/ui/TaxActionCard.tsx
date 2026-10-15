import { StyleSheet, View } from 'react-native';

import { Button, Icon, Text, colors, radius } from '@/shared/ui';

import type { TaxAction } from '../domain/purchaseDetail';

type TaxActionCardProps = {
  taxAction: TaxAction;
  // Sem ação disponível (registrar a taxa depende do formulário), o card só informa.
  onPress?: () => void;
};

const tones = {
  warning: { background: colors.warningBg, border: colors.warning, text: 'warningDark' },
  error: { background: colors.errorBg, border: colors.error, text: 'errorDark' },
} as const;

// "acao-taxa" da T04: o que fazer com a taxa vem antes de qualquer outro dado da compra.
export function TaxActionCard({ taxAction, onPress }: TaxActionCardProps) {
  const tone = tones[taxAction.tone];

  return (
    <View style={[styles.card, { backgroundColor: tone.background, borderColor: tone.border }]} accessibilityRole="alert">
      <View style={styles.title}>
        <Icon name="alert" size={20} color={tone.text} />
        <Text variant="body16Medium" color={tone.text} style={styles.titleText}>
          {taxAction.title}
        </Text>
      </View>
      <Text variant="body14" color={tone.text}>
        {taxAction.message}
      </Text>
      {onPress && (
        <Button
          label={taxAction.action === 'REGISTER_PAYMENT' ? 'Registrar pagamento' : 'Registrar taxa'}
          onPress={onPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 16, borderWidth: 1, borderRadius: radius.card },
  title: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleText: { flex: 1 },
});
