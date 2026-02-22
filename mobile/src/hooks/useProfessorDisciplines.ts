import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';
import { getCurrentUser } from '../services/authStore';

export function useProfessorDisciplines() {
  return useQuery({
    queryKey: ['professorDisciplines'],
    queryFn: async () => {
      const [courses, user] = await Promise.all([
        apiFetch<any[]>('/courses'),
        getCurrentUser(),
      ]);

      if (!user) return [];

      // Since backend doesn't filter by teacher currently, filter locally
      // to avoid 403 Forbidden errors when starting a class session
      return courses.filter((course) => course.teacherId === user.id);
    },
  });
}
