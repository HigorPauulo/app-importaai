import { StyleSheet, View } from 'react-native';

import { Icon, Text, type ColorName } from '@/shared/ui';

// Até 3 dias de atraso médio é aviso; acima disso, a loja costuma atrasar de verdade.
export function describeDelay(averageDelay: number): { label: string; color: ColorName; icon: 'check-circle' | 'alert' } {
  if (averageDelay === 0) return { label: 'No prazo', color: 'successDark', icon: 'check-circle' };
  const label = `+${averageDelay} ${averageDelay === 1 ? 'dia' : 'dias'}`;
  return { label, color: averageDelay <= 3 ? 'warningDark' : 'errorDark', icon: 'alert' };
}

// Pontualidade da loja com cor e ícone: maior no painel (T06), menor na lista de lojas (T07).
export function DelayBadge({ averageDelay, size = 'md' }: { averageDelay: number; size?: 'sm' | 'md' }) {
  const delay = describeDelay(averageDelay);

  return (
    <View style={[styles.badge, { gap: size === 'md' ? 6 : 4 }]}>
      <Icon name={delay.icon} size={size === 'md' ? 16 : 14} color={delay.color} />
      <Text variant={size === 'md' ? 'body14Medium' : 'caption12Bold'} color={delay.color}>
        {delay.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center' },
});
