import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { Text } from './Text';
import { colors, radius } from './theme';

// Marca das telas de acesso: logo com o ícone de pacote e o nome do app.
export function BrandMark() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Importa Aí">
      <View style={styles.logo}>
        <Icon name="package" size={22} color="surfaceWhite" />
      </View>
      <Text variant="section18" color="primaryDark">
        Importa Aí
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    backgroundColor: colors.primaryBase,
  },
});
