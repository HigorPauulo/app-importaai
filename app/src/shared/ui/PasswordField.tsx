import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from './Icon';
import { TextField } from './TextField';

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'icon' | 'action' | 'secureTextEntry'>;

// "Campo de texto" com cadeado e o botão de mostrar senha à direita.
export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      icon="lock"
      secureTextEntry={!isVisible}
      autoCapitalize="none"
      autoCorrect={false}
      action={
        <Pressable
          onPress={() => setIsVisible((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
          hitSlop={14}
          style={styles.toggle}>
          <Icon name={isVisible ? 'eye-off' : 'eye'} size={20} />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: { width: 20, height: 20 },
});
