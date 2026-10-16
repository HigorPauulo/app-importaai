import { describeSignInFailure, validateCredentials } from './signIn';

describe('validateCredentials', () => {
  it('aceita e-mail e senha preenchidos', () => {
    expect(validateCredentials({ email: ' camila.souza@email.com ', password: 'segredo1' })).toEqual({});
  });

  it('pede os dois campos quando vazios', () => {
    expect(validateCredentials({ email: '  ', password: '' })).toEqual({
      email: 'Informe o e-mail.',
      password: 'Informe a senha.',
    });
  });

  it('recusa e-mail sem domínio', () => {
    expect(validateCredentials({ email: 'camila@', password: 'x' }).email).toMatch(/Confira o e-mail/);
  });
});

describe('describeSignInFailure', () => {
  it('CT-04: credencial errada não diz qual campo errou', () => {
    expect(describeSignInFailure({ code: 'INVALID_CREDENTIALS' })).toEqual({
      title: 'E-mail ou senha incorretos',
      message: 'Confira os dois e tente de novo.',
    });
  });

  it('CT-05: bloqueio mostra o tempo restante, arredondado para cima', () => {
    expect(describeSignInFailure({ code: 'ACCOUNT_LOCKED', retryAfterSeconds: 900 }).message).toBe(
      'Tente de novo em 15 minutos.',
    );
    expect(describeSignInFailure({ code: 'ACCOUNT_LOCKED', retryAfterSeconds: 30 }).message).toBe(
      'Tente de novo em 1 minuto.',
    );
  });
});
