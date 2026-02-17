import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

/**
 * Hook to update the current user via PATCH /users/:id.
 *
 * Usage:
 * ```ts
 * const { mutateAsync: updateUser } = useUpdateUser();
 * await updateUser({ id: '...', data: { role: 'TEACHER' } });
 * ```
 */
export function useUpdateUser() {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => {
      return apiFetch(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  });
}
