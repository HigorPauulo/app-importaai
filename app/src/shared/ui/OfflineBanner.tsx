import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { Text } from './Text';
import { colors } from './theme';

type OfflineBannerProps = {
  lastSyncLabel: string;
};

// "Faixa sem conexão" do Figma: avisa sem esconder os dados locais.
export function OfflineBanner({ lastSyncLabel }: OfflineBannerProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Icon name="wifi-off" size={16} color="surfaceWhite" />
      <Text variant="caption13" color="surfaceWhite">
        Sem conexão · última sincronização {lastSyncLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.textStrong,
  },
});
