import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

export function useProfessorDisciplines() {
  return useQuery({
    queryKey: ['professorDisciplines'],
    queryFn: () => apiFetch<any[]>('/courses'),
  });
}
