import { useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View, type TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark, Button, Icon, PasswordField, Text, TextField, Toast, colors } from '@/shared/ui';

import {
  describeSignInFailure,
  validateCredentials,
  type CredentialErrors,
  type SignIn,
  type SignInFailure,
} from '../domain/signIn';

type SignInScreenProps = {
  initialEmail?: string;
  signIn: SignIn;
  onSignedIn: () => void;
  onCreateAccount: () => void;
};

// T01 · Entrar (RF-02).
export function SignInScreen({ initialEmail = '', signIn, onSignedIn, onCreateAccount }: SignInScreenProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<CredentialErrors>({});
  const [failure, setFailure] = useState<SignInFailure | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  async function handleSubmit() {
    const credentials = { email, password };
    const fieldErrors = validateCredentials(credentials);
    setErrors(fieldErrors);
    setFailure(null);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await signIn(credentials);
    setIsSubmitting(false);
    if (result) setFailure(result);
    else onSignedIn();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BrandMark />

          <View style={styles.title}>
            <Text variant="title28" accessibilityRole="header">
              Entrar
            </Text>
            <Text variant="body15" color="textMuted">
              Acompanhe suas encomendas e saiba o custo final antes de comprar.
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="E-mail"
              icon="mail"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <PasswordField
              ref={passwordRef}
              label="Senha"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              error={errors.password}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
            {failure && <Toast type="error" {...describeSignInFailure(failure)} />}
          </View>

          <Button label="Entrar" isLoading={isSubmitting} onPress={handleSubmit} style={styles.submit} />

          <View style={styles.footer}>
            <Text variant="body14" color="textMuted">
              Ainda não tem conta?
            </Text>
            <Button label="Criar conta" variant="secondary" onPress={onCreateAccount} style={styles.fullWidth} />
            <View style={styles.security}>
              <Icon name="shield" size={14} />
              <Text variant="caption12" color="textMuted">
                5 tentativas erradas bloqueiam o acesso por 15 minutos.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Espaços verticais medidos no frame T01 do Figma (48, 32, 28) e o rodapé empurrado para baixo.
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceWhite },
  fill: { flex: 1 },
  content: { flexGrow: 1, padding: 24 },
  title: { gap: 8, marginTop: 48 },
  form: { gap: 20, marginTop: 32 },
  submit: { marginTop: 28 },
  footer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: 12, paddingTop: 32 },
  fullWidth: { alignSelf: 'stretch' },
  security: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8 },
});
