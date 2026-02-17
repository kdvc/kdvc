import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

export function useProfessorClassStudents(courseId: string) {
  return useQuery({
    queryKey: ['professorClassStudents', courseId],
    queryFn: async () => {
      const course = await apiFetch<any>(`/courses/${courseId}`);
      return course.students ?? [];
    },
    enabled: !!courseId,
  });
}

export function useProfessorAttendanceHistory(courseId: string) {
  return useQuery({
    queryKey: ['professorAttendanceHistory', courseId],
    queryFn: async () => {
      const classes = await apiFetch<any[]>(`/courses/${courseId}/classes`);
      return classes;
    },
    enabled: !!courseId,
  });
}
