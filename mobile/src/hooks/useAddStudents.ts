import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

export function useAddStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      emails,
    }: {
      courseId: string;
      emails: string[];
    }) => {
      const response = await apiFetch<any>(
        `/courses/${courseId}/students/batch`,
        {
          method: 'POST',
          body: JSON.stringify({ emails }),
        },
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['professorStudents', variables.courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ['professorClassStudents', variables.courseId],
      });
    },
  });
}
