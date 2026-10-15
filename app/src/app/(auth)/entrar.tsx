import { router, useLocalSearchParams } from 'expo-router';

import { signIn } from '@/features/acesso/data/authApi';
import { SignInScreen } from '@/features/acesso/ui/SignInScreen';

export default function SignInRoute() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <SignInScreen
      initialEmail={email}
      signIn={signIn}
      onSignedIn={() => router.replace('/compras')}
      onCreateAccount={() => router.push('/criar-conta')}
    />
  );
}
