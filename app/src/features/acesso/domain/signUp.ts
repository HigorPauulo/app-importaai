import { isEmail } from './signIn';

export type NewAccount = { name: string; email: string; password: string; passwordConfirmation: string };

export type NewAccountErrors = Partial<Record<keyof NewAccount, string>>;

export type SignUpFailure = { code: 'EMAIL_TAKEN' } | { code: 'OFFLINE' } | { code: 'UNAVAILABLE' };

export type SignUp = (account: Omit<NewAccount, 'passwordConfirmation'>) => Promise<SignUpFailure | null>;

// Requisitos de senha de RF-01, na ordem em que a T02 os mostra.
export const PASSWORD_REQUIREMENTS = [
  { label: '8 ou mais caracteres', isMet: (password: string) => password.length >= 8 },
  { label: 'Letras e números', isMet: (password: string) => /\p{L}/u.test(password) && /\d/.test(password) },
] as const;

export type PasswordStrength = { level: 0 | 1 | 2 | 3 | 4; label: string };

const STRENGTH_LABELS = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'] as const;

// O medidor só orienta: o que a conta exige são os requisitos acima. Cumprir os dois vale "Boa";
// tamanho de 12 ou mais e símbolo levam a "Forte".
export function measurePasswordStrength(password: string): PasswordStrength {
  if (!password) return { level: 0, label: '' };
  const metRequirements = PASSWORD_REQUIREMENTS.filter((requirement) => requirement.isMet(password)).length;
  const isLongWithSymbol = password.length >= 12 && /[^\p{L}\d]/u.test(password);
  const level = metRequirements === 2 ? (isLongWithSymbol ? 4 : 3) : metRequirements === 1 ? 2 : 1;
  return { level, label: STRENGTH_LABELS[level] };
}

export function validateNewAccount({ name, email, password, passwordConfirmation }: NewAccount): NewAccountErrors {
  const errors: NewAccountErrors = {};
  if (!name.trim()) errors.name = 'Informe o seu nome.';
  if (!email.trim()) errors.email = 'Informe o e-mail.';
  else if (!isEmail(email)) errors.email = 'Confira o e-mail: falta o @ ou o domínio.';
  if (!PASSWORD_REQUIREMENTS.every((requirement) => requirement.isMet(password))) {
    errors.password = 'A senha precisa de 8 ou mais caracteres, com letras e números.';
  }
  if (passwordConfirmation !== password) errors.passwordConfirmation = 'As senhas não são iguais.';
  return errors;
}

// Vai junto ao campo de e-mail, e não no aviso, porque oferece entrar com ele (T02).
export const EMAIL_TAKEN_MESSAGE = 'Este e-mail já tem conta. Toque para entrar com ele.';

export function describeSignUpFailure(failure: Exclude<SignUpFailure, { code: 'EMAIL_TAKEN' }>): {
  title: string;
  message: string;
} {
  switch (failure.code) {
    case 'OFFLINE':
      return { title: 'Sem conexão', message: 'Criar a conta precisa de internet. Depois disso, o app funciona sem ela.' };
    case 'UNAVAILABLE':
      return { title: 'Não foi possível criar a conta agora', message: 'Tente de novo em instantes.' };
  }
}
