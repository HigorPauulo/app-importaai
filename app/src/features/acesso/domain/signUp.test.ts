import { measurePasswordStrength, validateNewAccount, type NewAccount } from './signUp';

const valid: NewAccount = {
  name: 'Camila Souza',
  email: 'camila.souza@email.com',
  password: 'importa2026',
  passwordConfirmation: 'importa2026',
};

describe('validateNewAccount', () => {
  it('aceita conta com os campos de RF-01 corretos', () => {
    expect(validateNewAccount(valid)).toEqual({});
  });

  it('RF-01: recusa senha curta ou sem número', () => {
    expect(validateNewAccount({ ...valid, password: 'abc123', passwordConfirmation: 'abc123' }).password).toBeDefined();
    expect(validateNewAccount({ ...valid, password: 'somenteletras', passwordConfirmation: 'somenteletras' }).password).toBeDefined();
  });

  it('recusa confirmação diferente da senha', () => {
    expect(validateNewAccount({ ...valid, passwordConfirmation: 'importa2025' })).toEqual({
      passwordConfirmation: 'As senhas não são iguais.',
    });
  });

  it('pede nome e e-mail', () => {
    const errors = validateNewAccount({ ...valid, name: ' ', email: 'camila@email' });
    expect(Object.keys(errors)).toEqual(['name', 'email']);
  });
});

describe('measurePasswordStrength', () => {
  it.each([
    ['', 0, ''],
    ['abc', 1, 'Fraca'],
    ['abcdefgh', 2, 'Razoável'],
    ['importa2026', 3, 'Boa'],
    ['importa-2026!', 4, 'Forte'],
  ])('"%s" vale nível %i', (password, level, label) => {
    expect(measurePasswordStrength(password)).toEqual({ level, label });
  });
});
