import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

export function useStudentClasses() {
  return useQuery({
    queryKey: ['studentClasses'],
    queryFn: () => apiFetch<any[]>('/courses'),
  });
}
