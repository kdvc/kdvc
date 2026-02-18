import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

export function useCourseById(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => apiFetch<any>(`/courses/${id}`),
    enabled: !!id,
  });
}
