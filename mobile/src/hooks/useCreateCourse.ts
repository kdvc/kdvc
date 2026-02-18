import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

/**
 * Hook to create a course (turma) via POST /courses,
 * and optionally add students in batch via POST /courses/:id/students/batch.
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      schedules,
      studentEmails,
    }: {
      name: string;
      description?: string;
      schedules?: { dayOfWeek: number; startTime: string; endTime: string }[];
      studentEmails?: string[];
    }) => {
      // Create the course with schedules and students in one go
      const course = await apiFetch<{ id: string }>('/courses', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          schedules,
          emails: studentEmails,
        }),
      });

      return course;
    },
    onSuccess: () => {
      // Invalidate the disciplines list so it refetches
      queryClient.invalidateQueries({ queryKey: ['professorDisciplines'] });
    },
  });
}
