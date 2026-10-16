export type Credentials = { email: string; password: string };

export type CredentialErrors = Partial<Record<keyof Credentials, string>>;

// Códigos de erro de /auth/login (api.md), mais as duas falhas que o servidor não chega a responder.
export type SignInFailure =
  | { code: 'INVALID_CREDENTIALS' }
  | { code: 'ACCOUNT_LOCKED'; retryAfterSeconds: number }
  | { code: 'ACCOUNT_BLOCKED' }
  | { code: 'OFFLINE' }
  | { code: 'UNAVAILABLE' };

export type SignIn = (credentials: Credentials) => Promise<SignInFailure | null>;

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(email: string): boolean {
  return EMAIL_FORMAT.test(email.trim());
}

// Só confere o formato: se a conta existe e a senha confere, quem decide é a API (RF-02).
export function validateCredentials({ email, password }: Credentials): CredentialErrors {
  const errors: CredentialErrors = {};
  if (!email.trim()) errors.email = 'Informe o e-mail.';
  else if (!isEmail(email)) errors.email = 'Confira o e-mail: falta o @ ou o domínio.';
  if (!password) errors.password = 'Informe a senha.';
  return errors;
}

// Credencial errada tem mensagem única, sem dizer se o erro foi no e-mail ou na senha (CT-04).
export function describeSignInFailure(failure: SignInFailure): { title: string; message: string } {
  switch (failure.code) {
    case 'INVALID_CREDENTIALS':
      return { title: 'E-mail ou senha incorretos', message: 'Confira os dois e tente de novo.' };
    case 'ACCOUNT_LOCKED': {
      const minutes = Math.max(1, Math.ceil(failure.retryAfterSeconds / 60));
      return {
        title: 'Acesso bloqueado por tentativas erradas',
        message: `Tente de novo em ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}.`,
      };
    }
    case 'ACCOUNT_BLOCKED':
      return { title: 'Conta bloqueada', message: 'Esta conta foi bloqueada pela administração.' };
    case 'OFFLINE':
      return { title: 'Sem conexão', message: 'Entrar precisa de internet. Depois disso, o app funciona sem ela.' };
    case 'UNAVAILABLE':
      return { title: 'Não foi possível entrar agora', message: 'Tente de novo em instantes.' };
  }
}
