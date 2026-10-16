import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View, type TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, IconButton, PasswordField, Text, TextField, Toast, colors } from '@/shared/ui';

import {
  EMAIL_TAKEN_MESSAGE,
  describeSignUpFailure,
  validateNewAccount,
  type NewAccount,
  type NewAccountErrors,
  type SignUp,
  type SignUpFailure,
} from '../domain/signUp';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

type SignUpScreenProps = {
  signUp: SignUp;
  onSignedUp: () => void;
  onBack: () => void;
  onSignIn: (email?: string) => void;
};

const emptyAccount: NewAccount = { name: '', email: '', password: '', passwordConfirmation: '' };

// T02 · Criar conta (RF-01).
export function SignUpScreen({ signUp, onSignedUp, onBack, onSignIn }: SignUpScreenProps) {
  const [account, setAccount] = useState(emptyAccount);
  const [errors, setErrors] = useState<NewAccountErrors>({});
  const [failure, setFailure] = useState<Exclude<SignUpFailure, { code: 'EMAIL_TAKEN' }> | null>(null);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);

  function fieldProps(field: keyof NewAccount) {
    return {
      value: account[field],
      error: errors[field],
      onChangeText: (value: string) => {
        setAccount((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
        if (field === 'email') setIsEmailTaken(false);
      },
    };
  }

  async function handleSubmit() {
    const fieldErrors = validateNewAccount(account);
    setErrors(fieldErrors);
    setFailure(null);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await signUp(account);
    setIsSubmitting(false);
    if (!result) return onSignedUp();
    if (result.code === 'EMAIL_TAKEN') {
      setIsEmailTaken(true);
      setErrors({ email: EMAIL_TAKEN_MESSAGE });
    } else setFailure(result);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navigation}>
        <IconButton icon="chevron-left" accessibilityLabel="Voltar" onPress={onBack} />
      </View>
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.title}>
            <Text variant="title28" accessibilityRole="header">
              Criar conta
            </Text>
            <Text variant="body15" color="textMuted">
              Leva menos de um minuto. Suas compras ficam visíveis só para você.
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              {...fieldProps('name')}
              label="Nome"
              icon="user"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            <TextField
              {...fieldProps('email')}
              ref={emailRef}
              label="E-mail"
              icon="mail"
              onErrorPress={isEmailTaken ? () => onSignIn(account.email.trim()) : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <View style={styles.password}>
              <PasswordField
                {...fieldProps('password')}
                ref={passwordRef}
                label="Senha"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => confirmationRef.current?.focus()}
              />
              <PasswordStrengthMeter password={account.password} />
            </View>
            <PasswordField
              {...fieldProps('passwordConfirmation')}
              ref={confirmationRef}
              label="Confirmar senha"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
            {failure && <Toast type="error" {...describeSignUpFailure(failure)} />}
          </View>

          <Button label="Criar conta" isLoading={isSubmitting} onPress={handleSubmit} style={styles.submit} />
          <Text variant="caption12" color="textMuted" align="center" style={styles.terms}>
            Ao criar a conta, você concorda com os <Text variant="caption12" color="primaryBase">Termos de uso</Text> e a{' '}
            <Text variant="caption12" color="primaryBase">
              Política de privacidade
            </Text>
            .
          </Text>

          <View style={styles.footer}>
            <Text variant="body14" color="textMuted">
              Já tem conta?
            </Text>
            <Pressable onPress={() => onSignIn()} accessibilityRole="link" hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
              <Text variant="body14Medium" color="primaryBase">
                Entrar
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Espaços verticais medidos no frame T02 do Figma (28, 18, 24, 12) e o rodapé empurrado para baixo.
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceWhite },
  navigation: { paddingLeft: 12, paddingTop: 4 },
  fill: { flex: 1 },
  content: { flexGrow: 1, paddingTop: 8, paddingHorizontal: 24, paddingBottom: 24 },
  title: { gap: 8 },
  form: { gap: 18, marginTop: 28 },
  password: { gap: 8 },
  submit: { marginTop: 24 },
  terms: { marginTop: 12 },
  footer: { flex: 1, minHeight: 76, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4, paddingBottom: 12 },
});
