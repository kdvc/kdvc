import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

/**
 * Hook to remove a course (turma) via DELETE /courses/:id
 */
export function useRemoveCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId: string) => {
            await apiFetch(`/courses/${courseId}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            // Invalidate the disciplines list so the deleted course is removed from ProfessorHomeScreen
            queryClient.invalidateQueries({ queryKey: ['professorDisciplines'] });
        },
    });
}
