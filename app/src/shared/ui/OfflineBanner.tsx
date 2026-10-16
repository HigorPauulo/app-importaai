import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { Text } from './Text';
import { colors, radius } from './theme';

type OfflineBannerProps = {
  lastSyncLabel: string;
  onRetry: () => void;
};

// Faixa "sem-conexao" das telas: fica no conteúdo, avisa a idade dos dados e não esconde nada.
export function OfflineBanner({ lastSyncLabel, onRetry }: OfflineBannerProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Icon name="wifi-off" size={18} color="warningDark" />
      <Text variant="caption13" color="warningDark" style={styles.message}>
        Sem conexão · dados de {lastSyncLabel}
      </Text>
      <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={{ top: 15, bottom: 15, left: 8, right: 12 }}>
        <Text variant="caption13SemiBold" color="warningDark">
          Tentar de novo
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.warningBg,
  },
  message: { flex: 1 },
});
