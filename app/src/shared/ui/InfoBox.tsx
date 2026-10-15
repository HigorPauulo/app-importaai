import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import type { IconName } from './icons';
import { colors, radius } from './theme';

type InfoBoxProps = {
  icon?: IconName;
  // Verde para uma conclusão favorável, como a da pontualidade no painel (T06).
  tone?: 'info' | 'success';
  children: ReactNode;
};

// Caixa clara de informação ("origem", "conversao" da T05): explica, não alerta.
export function InfoBox({ icon, tone = 'info', children }: InfoBoxProps) {
  return (
    <View style={[styles.box, { backgroundColor: tone === 'success' ? colors.successBg : colors.primaryLight }]}>
      {icon && <Icon name={icon} size={18} color={tone === 'success' ? 'successDark' : 'primaryDark'} />}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  content: { flex: 1, gap: 2 },
});
