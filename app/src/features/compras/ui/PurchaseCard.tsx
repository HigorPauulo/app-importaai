import { Pressable, StyleSheet, View } from 'react-native';

import { convertToBrl, formatMoney, type ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import { Text, colors, radius, shadows } from '@/shared/ui';

import { STATUS_LABELS, describeDeadline, describeFlag, type PurchaseListItem } from '../domain/purchaseList';
import { FlagTag } from './FlagTag';
import { StatusBadge } from './StatusBadge';

type PurchaseCardProps = {
  purchase: PurchaseListItem;
  rates: readonly ExchangeRate[];
  today: string;
  onPress?: () => void;
};

// Valor pago na loja (produto e frete) em reais pela cotação da data da compra (RN07).
// Sem cotação, fica na moeda de origem; com a cotação de outro dia, leva "≈".
function describeAmount({ amountMinor, shippingMinor, currency, minorUnits, purchaseDate }: PurchaseListItem, rates: readonly ExchangeRate[]) {
  const total = amountMinor + shippingMinor;
  const conversion = convertToBrl(total, minorUnits, currency, purchaseDate, rates);
  if (conversion.kind === 'unavailable') return formatMoney(total, currency, minorUnits);
  return `${conversion.isApproximate ? '≈ ' : ''}${formatMoney(conversion.brlMinor)}`;
}

// "Card de Compra" do Figma: o que é e quanto custou, de onde vem, onde está e o que pede atenção.
export function PurchaseCard({ purchase, rates, today, onPress }: PurchaseCardProps) {
  const amount = describeAmount(purchase, rates);
  const deadline = describeDeadline(purchase);
  const flags = purchase.flags.map((flag) => ({ flag, label: describeFlag(flag, purchase, today) }));

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={[
        purchase.productDescription,
        amount,
        purchase.storeName,
        STATUS_LABELS[purchase.status].toLowerCase(),
        deadline,
        ...flags.map(({ label }) => label),
      ].join(', ')}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}>
      <View style={styles.top}>
        <Text variant="body16Medium" numberOfLines={1} style={styles.product}>
          {purchase.productDescription}
        </Text>
        <Text variant="body14Medium">{amount}</Text>
      </View>
      <Text variant="caption12" color="textMuted">
        {purchase.storeName} · {purchase.trackingCode}
      </Text>
      <View style={styles.statusRow}>
        <StatusBadge status={purchase.status} />
        <Text variant="caption12" color="textMuted">
          {deadline}
        </Text>
      </View>
      {flags.length > 0 && (
        <View style={styles.flags}>
          {flags.map(({ flag, label }) => (
            <FlagTag key={flag} flag={flag} label={label} />
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceWhite,
    ...shadows.sm,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  product: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  flags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
