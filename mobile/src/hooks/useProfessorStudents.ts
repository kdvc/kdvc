import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

export function useProfessorStudents(courseId: string) {
  return useQuery({
    queryKey: ['professorStudents', courseId],
    queryFn: async () => {
      const course = await apiFetch<any>(`/courses/${courseId}`);
      return course.students ?? [];
    },
    enabled: !!courseId,
  });
}
