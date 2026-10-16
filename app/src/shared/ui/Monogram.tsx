import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors, radius } from './theme';

// "monograma" das lojas (T07, T10): a letra que distingue a loja num quadrado azul-claro.
export function Monogram({ letter }: { letter: string }) {
  return (
    <View style={styles.box}>
      <Text variant="body16Medium" color="primaryDark">
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
});
