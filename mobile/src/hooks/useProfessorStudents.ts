import { useQuery } from '@tanstack/react-query';
import { getProfessorStudents } from '../services/mockApi';

export function useProfessorStudents() {
  return useQuery({
    queryKey: ['professorStudents'],
    queryFn: getProfessorStudents,
  });
}
