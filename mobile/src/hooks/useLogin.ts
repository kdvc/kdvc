import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../services/api';
import { setTokens } from '../services/authStore';

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type LoginResult = {
  user: User;
  access_token: string;
  refresh_token: string;
  created: boolean;
};

/**
 * Hook that exchanges a Google id_token for internal KDVC tokens.
 *
 * Usage:
 * ```ts
 * const { mutateAsync: login, isPending, error } = useLogin();
 * const result = await login(googleIdToken);
 * ```
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (googleIdToken: string): Promise<LoginResult> => {
      const data = await apiFetch<LoginResult>('/auth/google/login', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleIdToken}`,
        },
        skipAuth: true,
        body: JSON.stringify({ idToken: googleIdToken }),
      });

      await setTokens(data.user, data.access_token, data.refresh_token);

      return data;
    },
  });
}
