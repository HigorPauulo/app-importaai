import type { SignIn, SignInFailure } from '../domain/signIn';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiError = { code?: string; retryAfterSeconds?: number };

// Guardar a sessão devolvida entra com a US-02, junto do contrato de resposta de sucesso.
async function post(path: string, body: object): Promise<ApiError | null | 'OFFLINE'> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return 'OFFLINE';
  }
  if (response.ok) return null;
  return response.json().catch(() => ({}));
}

// POST /auth/login (api.md, RF-02).
export const signIn: SignIn = async ({ email, password }) => {
  const error = await post('/auth/login', { email: email.trim(), password });
  if (error === null) return null;
  if (error === 'OFFLINE') return { code: 'OFFLINE' };
  return toSignInFailure(error);
};

function toSignInFailure({ code, retryAfterSeconds }: ApiError): SignInFailure {
  if (code === 'INVALID_CREDENTIALS' || code === 'ACCOUNT_BLOCKED') return { code };
  // Sem o campo, vale o prazo inteiro do bloqueio de RF-02 (15 minutos).
  if (code === 'ACCOUNT_LOCKED') return { code, retryAfterSeconds: retryAfterSeconds ?? 900 };
  return { code: 'UNAVAILABLE' };
}
