import { useQuery } from '@tanstack/react-query';
import { getStudentClasses } from '../services/mockApi';

export function useStudentClasses() {
  return useQuery({
    queryKey: ['studentClasses'],
    queryFn: getStudentClasses,
  });
}
