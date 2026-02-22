import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

/**
 * Hook to remove a student from a course via DELETE /courses/:courseId/students/:studentId
 */
export function useRemoveStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            courseId,
            studentId,
        }: {
            courseId: string;
            studentId: string;
        }) => {
            await apiFetch(`/courses/${courseId}/students/${studentId}`, {
                method: 'DELETE',
            });
        },
        onSuccess: (_, variables) => {
            // Invalidate the specific course's student list
            queryClient.invalidateQueries({
                queryKey: ['professorClassStudents', variables.courseId],
            });
        },
    });
}
