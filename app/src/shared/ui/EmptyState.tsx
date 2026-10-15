import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';
import { colors, radius } from './theme';

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
};

// Todo vazio diz a causa e oferece a saída (telas.md, "Estados de toda tela").
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Icon name={icon} size={28} color="primaryDark" />
      </View>
      <Text variant="section18" align="center">
        {title}
      </Text>
      <Text variant="body14" color="textMuted" align="center">
        {description}
      </Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12, paddingVertical: 32, paddingHorizontal: 24 },
  icon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
});
