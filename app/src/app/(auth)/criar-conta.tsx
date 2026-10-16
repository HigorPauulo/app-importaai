import { router } from 'expo-router';

import { signUp } from '@/features/acesso/data/authApi';
import { SignUpScreen } from '@/features/acesso/ui/SignUpScreen';

export default function SignUpRoute() {
  return (
    <SignUpScreen
      signUp={signUp}
      onSignedUp={() => router.replace('/compras')}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/entrar'))}
      onSignIn={(email) => router.replace({ pathname: '/entrar', params: email ? { email } : {} })}
    />
  );
}
