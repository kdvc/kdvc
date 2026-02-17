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
      studentEmails,
    }: {
      name: string;
      description?: string;
      studentEmails?: string[];
    }) => {
      // 1. Create the course
      const course = await apiFetch<{ id: string }>('/courses', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });

      // 2. If student emails provided, add them in batch
      if (studentEmails && studentEmails.length > 0) {
        await apiFetch(`/courses/${course.id}/students/batch`, {
          method: 'POST',
          body: JSON.stringify({ emails: studentEmails }),
        });
      }

      return course;
    },
    onSuccess: () => {
      // Invalidate the disciplines list so it refetches
      queryClient.invalidateQueries({ queryKey: ['professorDisciplines'] });
    },
  });
}
