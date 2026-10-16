import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { IconButton } from './IconButton';
import type { IconName } from './icons';
import { Text } from './Text';

type StackBarProps = {
  title?: string;
  onBack: () => void;
  onMore?: () => void;
  // Ação principal da tela em texto azul à direita, como "+ Nova" em Minhas lojas (T07).
  action?: { label: string; icon: IconName; onPress: () => void };
};

// "barra" das telas empilhadas: voltar à esquerda, o título quando a tela tem um (T05) e,
// quando há ações raras ou destrutivas, o menu ⋮.
export function StackBar({ title, onBack, onMore, action }: StackBarProps) {
  return (
    <View style={[styles.bar, title ? styles.withTitle : null, action ? styles.withAction : null]}>
      <IconButton icon="chevron-left" accessibilityLabel="Voltar" onPress={onBack} />
      {title && (
        <Text variant="section20" accessibilityRole="header" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      )}
      {action && (
        <Pressable onPress={action.onPress} accessibilityRole="button" style={styles.action}>
          <Icon name={action.icon} size={20} color="primaryBase" />
          <Text variant="body16Medium" color="primaryBase">
            {action.label}
          </Text>
        </Pressable>
      )}
      {onMore && <IconButton icon="more-vertical" accessibilityLabel="Mais ações" onPress={onMore} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  withTitle: { gap: 4, paddingRight: 20, paddingBottom: 4 },
  withAction: { paddingRight: 12 },
  title: { flex: 1 },
  action: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
});
