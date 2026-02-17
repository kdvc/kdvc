import { useQuery } from '@tanstack/react-query';
import { getProfessorDisciplines } from '../services/mockApi';

export function useProfessorDisciplines() {
  return useQuery({
    queryKey: ['professorDisciplines'],
    queryFn: getProfessorDisciplines,
  });
}
